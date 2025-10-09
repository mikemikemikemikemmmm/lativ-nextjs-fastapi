mod middleware;
mod router;
mod setting;
use actix_web::middleware::{DefaultHeaders, Logger};
use log;

use actix_cors::Cors;
use actix_web::{App, HttpServer, Responder, get, web};
use env_logger::Env;
use sqlx::postgres::PgPoolOptions;

#[get("/health_check")]
async fn health_check() -> impl Responder {
    "health"
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    print!("1");
    env_logger::init_from_env(Env::default().default_filter_or("debug"));

    log::debug!("server start.");
    let _setting = setting::get_settings();
    let pool = PgPoolOptions::new()
        .connect(&_setting.sql_url)
        .await
        .map_err(|e| {
            log::error!("Failed to create pool, {}", e);
            std::io::Error::new(std::io::ErrorKind::Other, e)
        })?;

    log::debug!("listen 127.0.0.1:{}", &_setting.port);
    HttpServer::new(move || {
        App::new()
            .wrap_fn(middleware::timer_middleware_fn)
            .wrap_fn(middleware::cache_middleware_fn)
            .wrap(Logger::default())
            .wrap(
                DefaultHeaders::new()
                    .add(("X-Content-Type-Options", "nosniff"))
                    .add(("X-Frame-Options", "DENY"))
                    .add(("X-XSS-Protection", "1; mode=block"))
                    .add(("Referrer-Policy", "no-referrer")),
            )
            .wrap(
                Cors::default()
                    .allowed_origin(&_setting.frontend_guest_origin.as_str())
                    .allowed_origin(&_setting.monitor_origin.as_str())
                    .allowed_methods(vec!["*"])
                    .allowed_headers(vec!["*"]),
            )
            .app_data(web::Data::new(pool.clone()))
            .service(health_check)
            .service(router::v1::v1_router())
    })
    .bind(format!("127.0.0.1:{}", &_setting.port))?
    .run()
    .await
}
