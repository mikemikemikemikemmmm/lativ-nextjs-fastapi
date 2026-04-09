use actix_web::{HttpResponse, Responder, error, get, web};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::{Row, SqlitePool};

pub fn v1_router() -> actix_web::Scope {
    actix_web::web::scope("/v1")
        .service(get_nav_by_route)
        .service(get_navs)
        .service(get_categorys)
        .service(get_series)
        .service(get_product_cards)
        .service(get_product_detail)
}

fn parse_json(s: Option<String>) -> Value {
    s.and_then(|raw| serde_json::from_str(&raw).ok())
        .unwrap_or(Value::Array(vec![]))
}

// -----------------------------------------------------------------
#[derive(Debug, Serialize)]
struct Nav {
    id: i32,
    name: String,
    route: String,
    img_file_name: String,
}

#[get("/navs/{nav_route}")]
async fn get_nav_by_route(
    path: web::Path<String>,
    pool: web::Data<SqlitePool>,
) -> actix_web::Result<impl Responder> {
    let nav_route = path.into_inner();
    let query_str = r#"
        SELECT n.id, n.name, n.route, n.img_file_name
        FROM nav n
        WHERE n.route = ?
          AND EXISTS (
              SELECT 1
              FROM category c
              INNER JOIN sub_category sc ON sc.category_id = c.id
              INNER JOIN series s ON s.sub_category_id = sc.id
              INNER JOIN product p ON p.series_id = s.id
              INNER JOIN sub_product sp ON sp.product_id = p.id
              WHERE c.nav_id = n.id
          )
        ORDER BY n."order"
    "#;
    let row = sqlx::query(query_str)
        .bind(nav_route)
        .fetch_one(pool.get_ref())
        .await
        .map_err(|e| {
            eprintln!("DB error: {:?}", e);
            error::ErrorBadRequest("database query error")
        })?;
    let nav = Nav {
        id: row.get("id"),
        name: row.get("name"),
        route: row.get("route"),
        img_file_name: row.get("img_file_name"),
    };
    Ok(web::Json(nav))
}

#[get("/navs")]
async fn get_navs(pool: web::Data<SqlitePool>) -> actix_web::Result<impl Responder> {
    let query_str = r#"
        SELECT n.id, n.name, n.route, n.img_file_name
        FROM nav n
        WHERE EXISTS (
            SELECT 1
            FROM category c
            INNER JOIN sub_category sc ON sc.category_id = c.id
            INNER JOIN series s ON s.sub_category_id = sc.id
            INNER JOIN product p ON p.series_id = s.id
            INNER JOIN sub_product sp ON sp.product_id = p.id
            WHERE c.nav_id = n.id
        )
        ORDER BY n."order"
    "#;
    let rows = sqlx::query(query_str)
        .fetch_all(pool.get_ref())
        .await
        .map_err(|_| error::ErrorBadRequest("error"))?;
    let navs: Vec<Nav> = rows
        .into_iter()
        .map(|row| Nav {
            id: row.get("id"),
            name: row.get("name"),
            route: row.get("route"),
            img_file_name: row.get("img_file_name"),
        })
        .collect();
    Ok(HttpResponse::Ok().json(navs))
}

// -----------------------------------------------------------------
#[derive(Deserialize)]
struct GetCategorysQuery {
    nav_route: Option<String>,
    product_id: Option<u32>,
}

#[derive(Debug, Serialize)]
struct Category {
    id: i32,
    route: String,
    name: String,
    nav_route: String,
    sub_categorys: Value,
}

#[get("/categorys")]
async fn get_categorys(
    query: web::Query<GetCategorysQuery>,
    pool: web::Data<SqlitePool>,
) -> actix_web::Result<impl Responder> {
    let q = query.into_inner();

    let rows: Vec<Category> = if let Some(nav_route) = q.nav_route {
        // SQLite 版本：correlated subquery 取代 json_agg(... ORDER BY ...)
        let query_str = r#"
            SELECT
                c.id,
                c.route,
                c.name,
                n.route AS nav_route,
                (
                    SELECT json_group_array(json_object('id', t.id, 'route', t.route, 'name', t.name))
                    FROM (
                        SELECT DISTINCT sc.id, sc.route, sc.name, sc."order"
                        FROM sub_category sc
                        INNER JOIN series s ON s.sub_category_id = sc.id
                        WHERE sc.category_id = c.id
                          AND EXISTS (
                              SELECT 1 FROM product p
                              INNER JOIN sub_product sp ON sp.product_id = p.id
                              WHERE p.series_id = s.id
                          )
                        ORDER BY sc."order"
                    ) t
                ) AS sub_categorys
            FROM nav n
            INNER JOIN category c ON c.nav_id = n.id AND n.route = ?
            WHERE EXISTS (
                SELECT 1
                FROM sub_category sc
                INNER JOIN series s ON s.sub_category_id = sc.id
                WHERE sc.category_id = c.id
                  AND EXISTS (
                      SELECT 1 FROM product p
                      INNER JOIN sub_product sp ON sp.product_id = p.id
                      WHERE p.series_id = s.id
                  )
            )
            ORDER BY c."order"
        "#;
        sqlx::query(query_str)
            .bind(nav_route)
            .fetch_all(pool.get_ref())
            .await
            .map_err(|e| {
                eprintln!("DB error: {:?}", e);
                error::ErrorBadRequest("query failed")
            })?
            .into_iter()
            .map(|row| Category {
                id: row.get("id"),
                route: row.get("route"),
                name: row.get("name"),
                nav_route: row.get("nav_route"),
                sub_categorys: parse_json(row.try_get("sub_categorys").ok()),
            })
            .collect()
    } else if let Some(product_id) = q.product_id {
        let pid = product_id as i32;
        // product_id 在查詢中出現兩次，需 bind 兩次
        let query_str = r#"
            SELECT
                c.id,
                c.route,
                c.name,
                n.route AS nav_route,
                (
                    SELECT json_group_array(json_object('id', sc.id, 'route', sc.route, 'name', sc.name))
                    FROM (
                        SELECT sc.id, sc.route, sc.name, sc."order"
                        FROM sub_category sc
                        INNER JOIN series s ON s.sub_category_id = sc.id
                        WHERE sc.category_id = c.id
                          AND EXISTS (
                              SELECT 1 FROM product p
                              INNER JOIN sub_product sp ON sp.product_id = p.id
                              WHERE p.series_id = s.id AND p.id = ?
                          )
                        ORDER BY sc."order"
                    ) sc_ord
                ) AS sub_categorys
            FROM nav n
            INNER JOIN category c ON c.nav_id = n.id
            WHERE EXISTS (
                SELECT 1
                FROM sub_category sc
                INNER JOIN series s ON s.sub_category_id = sc.id
                WHERE sc.category_id = c.id
                  AND EXISTS (
                      SELECT 1 FROM product p
                      INNER JOIN sub_product sp ON sp.product_id = p.id
                      WHERE p.series_id = s.id AND p.id = ?
                  )
            )
            ORDER BY c."order"
        "#;
        sqlx::query(query_str)
            .bind(pid)
            .bind(pid)
            .fetch_all(pool.get_ref())
            .await
            .map_err(|e| {
                eprintln!("DB error: {:?}", e);
                error::ErrorBadRequest("query failed")
            })?
            .into_iter()
            .map(|row| Category {
                id: row.get("id"),
                route: row.get("route"),
                name: row.get("name"),
                nav_route: row.get("nav_route"),
                sub_categorys: parse_json(row.try_get("sub_categorys").ok()),
            })
            .collect()
    } else {
        return Err(error::ErrorBadRequest("missing query parameter"));
    };

    Ok(HttpResponse::Ok().json(rows))
}

// -----------------------------------------------------------------
#[derive(Deserialize)]
struct GetSeriesQuery {
    nav_route: String,
    category_route: String,
    sub_category_route: String,
}

#[derive(Debug, Serialize)]
struct Series {
    id: i32,
    name: String,
    sub_category_name: String,
    products: Value,
}

#[get("/series")]
async fn get_series(
    query: web::Query<GetSeriesQuery>,
    pool: web::Data<SqlitePool>,
) -> actix_web::Result<impl Responder> {
    let q = query.into_inner();
    // SQLite 版本：
    // - 以 correlated subquery 取代 LATERAL JOIN
    // - 以 json_group_array / json_object 取代 json_agg / jsonb_build_object
    // - ORDER BY 放在子查詢內（SQLite 保證 json_group_array 依輸入順序聚合）
    let query_str = r#"
        SELECT
            s.id,
            s.name,
            sc.name AS sub_category_name,
            (
                SELECT json_group_array(json_object(
                    'id',          p.id,
                    'img_url',     p.img_url,
                    'name',        p.name,
                    'gender_id',   g.id,
                    'gender_name', g.name,
                    'order',       p."order",
                    'sub_products', (
                        SELECT json_group_array(json_object(
                            'id',                  sp.id,
                            'price',               sp.price,
                            'color_id',            col.id,
                            'color_name',          col.name,
                            'color_img_file_name', col.img_url
                        ))
                        FROM (
                            SELECT sp.id, sp.price, sp.color_id
                            FROM sub_product sp
                            WHERE sp.product_id = p.id
                            ORDER BY sp."order"
                        ) sp
                        INNER JOIN color col ON col.id = sp.color_id
                    )
                ))
                FROM (
                    SELECT p.id, p.img_url, p.name, p.gender_id, p."order"
                    FROM product p
                    WHERE p.series_id = s.id
                      AND EXISTS (SELECT 1 FROM sub_product sp WHERE sp.product_id = p.id)
                    ORDER BY p."order"
                ) p
                INNER JOIN gender g ON g.id = p.gender_id
            ) AS products
        FROM nav n
        INNER JOIN category c  ON c.nav_id = n.id      AND n.route = ? AND c.route = ?
        INNER JOIN sub_category sc ON sc.category_id = c.id AND sc.route = ?
        INNER JOIN series s    ON s.sub_category_id = sc.id
        ORDER BY s."order"
    "#;
    let rows: Vec<Series> = sqlx::query(query_str)
        .bind(q.nav_route)
        .bind(q.category_route)
        .bind(q.sub_category_route)
        .fetch_all(pool.get_ref())
        .await
        .map_err(|_| error::ErrorBadRequest("error"))?
        .into_iter()
        .map(|row| Series {
            id: row.get("id"),
            name: row.get("name"),
            sub_category_name: row.get("sub_category_name"),
            products: parse_json(row.try_get("products").ok()),
        })
        .collect();
    Ok(HttpResponse::Ok().json(rows))
}

// -----------------------------------------------------------------
#[derive(Deserialize)]
struct GetNavIndexQ {
    nav_route: String,
}

#[derive(Debug, Serialize)]
struct ProductCard {
    id: i32,
    img_url: String,
    name: String,
    gender_name: String,
    sub_products: Value,
}

#[get("/products/nav_index")]
async fn get_product_cards(
    query: web::Query<GetNavIndexQ>,
    pool: web::Data<SqlitePool>,
) -> actix_web::Result<impl Responder> {
    let q = query.into_inner();
    let query_str = r#"
        SELECT
            p.id,
            p.img_url,
            p.name,
            g.name AS gender_name,
            (
                SELECT json_group_array(json_object(
                    'id',                  sp.id,
                    'price',               sp.price,
                    'color_id',            col.id,
                    'color_name',          col.name,
                    'color_img_file_name', col.img_url
                ))
                FROM (
                    SELECT sp.id, sp.price, sp.color_id
                    FROM sub_product sp
                    WHERE sp.product_id = p.id
                    ORDER BY sp."order"
                ) sp
                INNER JOIN color col ON col.id = sp.color_id
            ) AS sub_products
        FROM nav n
        INNER JOIN category c    ON c.nav_id = n.id      AND n.route = ?
        INNER JOIN sub_category sc ON sc.category_id = c.id
        INNER JOIN series s      ON s.sub_category_id = sc.id
        INNER JOIN product p     ON p.series_id = s.id
        INNER JOIN gender g      ON g.id = p.gender_id
        WHERE EXISTS (SELECT 1 FROM sub_product sp WHERE sp.product_id = p.id)
        GROUP BY p.id, p.name, p.img_url, g.name, p."order"
        ORDER BY p."order"
    "#;
    let rows: Vec<ProductCard> = sqlx::query(query_str)
        .bind(q.nav_route)
        .fetch_all(pool.get_ref())
        .await
        .map_err(|e| {
            eprintln!("DB error: {:?}", e);
            error::ErrorBadRequest("query failed")
        })?
        .into_iter()
        .map(|row| ProductCard {
            id: row.get("id"),
            img_url: row.get("img_url"),
            name: row.get("name"),
            gender_name: row.get("gender_name"),
            sub_products: parse_json(row.try_get("sub_products").ok()),
        })
        .collect();
    Ok(HttpResponse::Ok().json(rows))
}

// -----------------------------------------------------------------
#[derive(Deserialize)]
struct GetProductDetailQ {
    product_id: u32,
}

#[derive(Debug, Serialize)]
struct ProductDetail {
    id: i32,
    img_url: String,
    name: String,
    gender_name: String,
    sub_products: Value,
}

#[get("/products")]
async fn get_product_detail(
    query: web::Query<GetProductDetailQ>,
    pool: web::Data<SqlitePool>,
) -> actix_web::Result<impl Responder> {
    let q = query.into_inner();
    // SQLite 版本：
    // - CTE 仍保留但改用 json_group_array / json_object
    // - jsonb_agg / jsonb_build_object → json_group_array / json_object
    // - '[]'::jsonb → json('[]')
    // - ORDER BY 移入子查詢
    let query_str = r#"
        SELECT
            p.id,
            p.img_url,
            p.name,
            g.name AS gender_name,
            COALESCE(
                (
                    SELECT json_group_array(json_object(
                        'id',                  sp.id,
                        'price',               sp.price,
                        'img_file_name',       sp.img_file_name,
                        'color_id',            col.id,
                        'color_name',          col.name,
                        'color_img_file_name', col.img_url,
                        'sizes', COALESCE(
                            (
                                SELECT json_group_array(json_object('id', si.id, 'name', si.name))
                                FROM (
                                    SELECT si.id, si.name
                                    FROM size_sub_product ssp
                                    INNER JOIN size si ON si.id = ssp.size_id
                                    WHERE ssp.sub_product_id = sp.id
                                    ORDER BY si."order"
                                ) si
                            ),
                            json('[]')
                        )
                    ))
                    FROM (
                        SELECT sp.id, sp.price, sp.img_file_name, sp.color_id
                        FROM sub_product sp
                        WHERE sp.product_id = p.id
                        ORDER BY sp."order"
                    ) sp
                    INNER JOIN color col ON col.id = sp.color_id
                ),
                json('[]')
            ) AS sub_products
        FROM product p
        INNER JOIN gender g ON g.id = p.gender_id
        WHERE p.id = ?
    "#;
    let rows: Vec<ProductDetail> = sqlx::query(query_str)
        .bind(q.product_id as i32)
        .fetch_all(pool.get_ref())
        .await
        .map_err(|e| {
            eprintln!("DB error: {:?}", e);
            error::ErrorBadRequest("query failed")
        })?
        .into_iter()
        .map(|row| ProductDetail {
            id: row.get("id"),
            img_url: row.get("img_url"),
            name: row.get("name"),
            gender_name: row.get("gender_name"),
            sub_products: parse_json(row.try_get("sub_products").ok()),
        })
        .collect();
    Ok(HttpResponse::Ok().json(rows))
}
