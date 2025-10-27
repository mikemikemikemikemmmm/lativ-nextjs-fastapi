use actix_web::{HttpResponse, Responder, error, get, web};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::{PgPool, Row,FromRow};
pub fn v1_router() -> actix_web::Scope {
    actix_web::web::scope("/v1")
        .service(get_nav_by_route)
        .service(get_navs)
        .service(get_categorys)
        .service(get_series)
        .service(get_product_cards)
        .service(get_product_detail)
}

// -----------------------------------------------------------------
#[derive(Debug, Serialize, FromRow)]
struct Nav {
    id: i32,
    name: String,
    route: String,
    img_file_name: String,
}
#[get("/navs/{nav_route}")]
async fn get_nav_by_route(
    path: web::Path<String>,
    pool: web::Data<PgPool>,
) -> actix_web::Result<impl Responder> {
    let nav_route = path.into_inner();

    let query_str = r#"
        SELECT
            n.id,
            n.name,
            n.route,
            n.img_file_name
        FROM nav n
        WHERE n.route = $1
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
        .bind(nav_route) // 🔒 安全綁定參數，避免 SQL injection
        .fetch_one(pool.get_ref())
        .await
        .map_err(|e| {
            eprintln!("DB error: {:?}", e);
            error::ErrorBadRequest("database query error")
        })?;

    let navs: Nav = Nav {
            id: row.get("id"),
            name: row.get("name"),
            route: row.get("route"),
            img_file_name: row.get("img_file_name"),
        };

    Ok(web::Json(navs))
}
#[get("/navs")]
async fn get_navs(pool: web::Data<PgPool>) -> actix_web::Result<impl Responder> {
    let query_str = r#"
        SELECT
            n.id,
            n.name,
            n.route,
            n.img_file_name
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
    let rows = sqlx::query_as::<_, Nav>(query_str)
        .fetch_all(pool.get_ref())
        .await
        .map_err(|_| error::ErrorBadRequest("error"))?; // 正確錯誤處理
    Ok(HttpResponse::Ok().json(rows))
}
// -----------------------------------------------------------------
#[derive(Deserialize)]
struct GetCategorysQuery {
    nav_route: Option<String>,
    product_id: Option<u32>, // 可選參數
}

#[derive(Debug, Serialize, FromRow)]
struct Category {
    id: i32,
    route: String,
    name: String,
    nav_route: String,
    sub_categorys: Value, // 因為 SQL 的 json_agg 是 JSON，serde_json::Value 可以直接接
}
#[get("/categorys")]
async fn get_categorys(
    query: web::Query<GetCategorysQuery>,
    pool: web::Data<PgPool>,
) -> actix_web::Result<impl Responder> {
    let q = query.into_inner();
    let mut query_str = "";
    if q.nav_route.is_some() {
        query_str = r#"
            SELECT 
                c.id,
                c.route,
                c.name,
                n.route AS nav_route,
                json_agg(
                    json_build_object(
                        'id', sc.id,
                        'route', sc.route,
                        'name', sc.name
                    )
                    ORDER BY sc."order"
                ) AS sub_categorys 
            FROM nav n
            INNER JOIN category c 
                ON c.nav_id = n.id AND n.route = $1
            INNER JOIN sub_category sc
                ON sc.category_id = c.id
            INNER JOIN series s
                ON s.sub_category_id = sc.id
            WHERE EXISTS (
                SELECT 1
                FROM product p
                INNER JOIN sub_product sp
                    ON sp.product_id = p.id
                WHERE p.series_id = s.id
            )
            GROUP BY c.id, c.name, c.route, c."order", n.route
            ORDER BY c."order"
        "#;
    } else if q.product_id.is_some() {
        query_str = r#"
            SELECT 
                c.id,
                c.route,
                c.name,
                n.route AS nav_route,
                json_agg(
                    json_build_object(
                        'id', sc.id,
                        'route', sc.route,
                        'name', sc.name
                    )
                    ORDER BY sc."order"
                ) AS sub_categorys 
            FROM nav n
            INNER JOIN category c 
                ON c.nav_id = n.id
            INNER JOIN sub_category sc
                ON sc.category_id = c.id
            INNER JOIN series s
                ON s.sub_category_id = sc.id
            WHERE EXISTS (
                SELECT 1
                FROM product p
                INNER JOIN sub_product sp
                    ON sp.product_id = p.id AND p.id = $1
                WHERE p.series_id = s.id
            )
            GROUP BY c.id, c.name, c.route, c."order", n.route
            ORDER BY c."order"
        "#;
    } else {
        return Err(error::ErrorBadRequest("missing query parameter"));
    }
    let rows = if let Some(nav_route) = q.nav_route {
        sqlx::query_as::<_, Category>(query_str)
            .bind(nav_route)
            .fetch_all(pool.get_ref())
            .await
            .map_err(|e| {
                println!("DB error: {:?}", e);
                error::ErrorBadRequest("query failed")
            })?
    } else if let Some(product_id) = q.product_id {
        sqlx::query_as::<_, Category>(query_str)
            .bind(product_id as i32) // 確保型別對齊
            .fetch_all(pool.get_ref())
            .await
            .map_err(|e| {
                println!("DB error: {:?}", e);
                error::ErrorBadRequest("query failed")
            })?
    } else {
        unreachable!()
    };

    // 回傳 JSON 結果
    Ok(HttpResponse::Ok().json(rows))
}

// -----------------------------------------------------------------
#[derive(Deserialize)]
struct GetSeriesQuery {
    nav_route: String,
    category_route: String,
    sub_category_route: String,
}

#[derive(Debug, Serialize, FromRow)]
struct Series {
    id: i32,
    name: String,
    sub_category_name: String,
    products: serde_json::Value,
}
#[get("/series")]
async fn get_series(
    query: web::Query<GetSeriesQuery>,
    pool: web::Data<PgPool>,
) -> actix_web::Result<impl Responder> {
    let q = query.into_inner();
    let query_str = r#"
        SELECT
            s.id,
            s.name,
            sc.name AS sub_category_name,
            json_agg(
                jsonb_build_object(
                    'id', p.id,
                    'img_url', p.img_url,
                    'name', p.name,
                    'gender_id', g.id,
                    'gender_name', g.name,
                    'order', p."order",
                    'sub_products', sp_json.sub_products
                ) ORDER BY p."order"
            ) AS products
        FROM nav n 
        INNER JOIN category c 
            ON c.nav_id = n.id AND n.route = $1 AND c.route = $2
        INNER JOIN sub_category sc 
            ON sc.category_id = c.id AND sc.route = $3
        INNER JOIN series s ON s.sub_category_id = sc.id
        INNER JOIN product p ON p.series_id = s.id
        INNER JOIN gender g ON g.id = p.gender_id
        -- 改為 INNER JOIN LATERAL，確保 product 一定有 sub_products
        INNER JOIN LATERAL (
            SELECT json_agg(
                    jsonb_build_object(
                        'id', sp.id,
                        'price', sp.price,
                        'color_id', col.id,
                        'color_name', col.name,
                        'color_img_file_name', col.img_url
                    ) ORDER BY sp."order"
                ) AS sub_products
            FROM sub_product sp
            INNER JOIN color col ON col.id = sp.color_id
            WHERE sp.product_id = p.id
        ) sp_json ON sp_json.sub_products IS NOT NULL  -- 確保至少有一個 sub_product
        GROUP BY s.id, sc.name
        ORDER BY s."order";
        "#;
    let rows = sqlx::query_as::<_, Series>(query_str)
        .bind(q.nav_route)
        .bind(q.category_route)
        .bind(q.sub_category_route)
        .fetch_all(pool.get_ref())
        .await
        .map_err(|_| error::ErrorBadRequest("error"))?; // 正確錯誤處理
    Ok(HttpResponse::Ok().json(rows))
}

// -----------------------------------------------------------------
#[derive(Deserialize)]
struct GetNavIndexQ {
    nav_route: String,
}

#[derive(Debug, Serialize, FromRow)]
struct ProductCard {
    id: i32,
    img_url: String,
    name: String,
    gender_name: String,
    sub_products: Value, // json_agg 結果用 Value
}
#[get("/products/nav_index")]
async fn get_product_cards(
    query: web::Query<GetNavIndexQ>,
    pool: web::Data<PgPool>
) -> actix_web::Result<impl Responder> {
    let q = query.into_inner();
    let query_str = r#"
        SELECT
            p.id,
            p.img_url,
            p.name,
            g.name AS gender_name,
            (
                SELECT json_agg(
                    jsonb_build_object(
                        'id', sp.id,
                        'price', sp.price,
                        'color_id', col.id,
                        'color_name', col.name,
                        'color_img_file_name', col.img_url
                    ) ORDER BY sp."order"
                )
                FROM sub_product sp
                INNER JOIN color col ON col.id = sp.color_id
                WHERE sp.product_id = p.id
            ) AS sub_products
        FROM nav n
        INNER JOIN category c ON c.nav_id = n.id AND n.route = $1
        INNER JOIN sub_category sc ON sc.category_id = c.id
        INNER JOIN series s ON s.sub_category_id = sc.id
        INNER JOIN product p ON p.series_id = s.id 
        INNER JOIN gender g ON g.id = p.gender_id
        WHERE EXISTS (
            SELECT 1
            FROM sub_product sp
            WHERE sp.product_id = p.id
        )
        GROUP BY p.id, p.name, p.img_url, g.name
        ORDER BY p."order";
    "#;

    let rows: Vec<ProductCard> = sqlx::query_as::<_, ProductCard>(query_str)
        .bind(q.nav_route)
        .fetch_all(pool.get_ref())
        .await
        .map_err(|e| {
            println!("DB error: {:?}", e);
            error::ErrorBadRequest("query failed")
        })?;

    Ok(HttpResponse::Ok().json(rows))
}
//---------------------------------------------------------------------
#[derive(Deserialize)]
struct GetProductDetailQ {
    product_id: u32,
}


#[derive(Debug, Serialize, FromRow)]
struct ProductDetail {
    id: i32,
    img_url: String,
    name: String,
    gender_name: String,
    sub_products: Value, // jsonb_agg 結果可以直接用 Value
}
#[get("/products")]
async fn get_product_detail(
    query: web::Query<GetProductDetailQ>,
    pool: web::Data<PgPool>
) -> actix_web::Result<impl Responder> {
    let q = query.into_inner();

    let query_str = r#"
        WITH subproduct_sizes AS (
            SELECT
                ssp.sub_product_id,
                jsonb_agg(
                    jsonb_build_object('id', si.id, 'name', si.name)
                    ORDER BY si."order"
                ) AS sizes
            FROM size_sub_product ssp
            INNER JOIN size si ON si.id = ssp.size_id
            GROUP BY ssp.sub_product_id
        ),
        sub_products_agg AS (
            SELECT
                sp.product_id,
                jsonb_agg(
                    jsonb_build_object(
                        'id', sp.id,
                        'price', sp.price,
                        'img_file_name', sp.img_file_name,
                        'color_id', col.id,
                        'color_name', col.name,
                        'color_img_file_name', col.img_url,
                        'sizes', COALESCE(sizes.sizes, '[]'::jsonb)
                    )
                    ORDER BY sp."order"
                ) AS sub_products
            FROM sub_product sp
            INNER JOIN color col ON col.id = sp.color_id
            LEFT JOIN subproduct_sizes sizes ON sizes.sub_product_id = sp.id
            GROUP BY sp.product_id
        )
        SELECT
            p.id,
            p.img_url,
            p.name,
            g.name AS gender_name,
            COALESCE(spa.sub_products, '[]'::jsonb) AS sub_products
        FROM product p
        INNER JOIN gender g ON g.id = p.gender_id
        LEFT JOIN sub_products_agg spa ON spa.product_id = p.id
        WHERE p.id = $1
        ORDER BY p."order";
    "#;

    let rows: Vec<ProductDetail> = sqlx::query_as::<_, ProductDetail>(query_str)
        .bind(q.product_id as i32)
        .fetch_all(pool.get_ref())
        .await
        .map_err(|e| {
            println!("DB error: {:?}", e);
            error::ErrorBadRequest("query failed")
        })?;

    Ok(HttpResponse::Ok().json(rows))
}