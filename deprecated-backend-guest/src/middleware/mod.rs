use std::str::FromStr;

use actix_web::{
    Error,
    dev::{Service, ServiceRequest, ServiceResponse},
    http::header::{HeaderName, HeaderValue},
};
use futures_util::future::LocalBoxFuture;
use std::time::Instant;

pub fn timer_middleware_fn<S, B>(
    req: ServiceRequest,
    srv: &S,
) -> LocalBoxFuture<'static, Result<ServiceResponse<B>, Error>>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: 'static,
{
    let start_timer = Instant::now();
    let fut = srv.call(req);
    Box::pin(async move {
        let mut res = fut.await?;
        let duration = start_timer.elapsed().as_millis();
        let duration_str: String = duration.to_string();
        let headers = res.headers_mut();
        headers.insert(
            HeaderName::from_str("X-Backend-Process-Ms").unwrap(),
            HeaderValue::from_str(duration_str.as_str()).unwrap(),
        );
        Ok(res)
    })
}

pub fn cache_middleware_fn<S, B>(
    req: ServiceRequest,
    srv: &S,
) -> LocalBoxFuture<'static, Result<ServiceResponse<B>, Error>>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: 'static,
{
    let fut = srv.call(req);
    Box::pin(async move {
        let mut res = fut.await?;
        let headers = res.headers_mut();
        headers.insert(
            HeaderName::from_str("Cache-Control").unwrap(),
            HeaderValue::from_str("public, max-age=600").unwrap(),
        );
        Ok(res)
    })
}
