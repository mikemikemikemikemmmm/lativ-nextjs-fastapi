use std::{
    future::{Ready, ready},
    str::FromStr,
};

use actix_web::{
    Error,
    dev::{Service, ServiceRequest, ServiceResponse, Transform, forward_ready},
    http::header::{HeaderName, HeaderValue},
};
use futures_util::future::LocalBoxFuture;
use std::time::Instant;

// There are two steps in middleware processing.
// 1. Middleware initialization, middleware factory gets called with
//    next service in chain as parameter.
// 2. Middleware's call method gets called with normal request.
pub struct Timing;

// Middleware factory is `Transform` trait
// `S` - type of the next service
// `B` - type of response's body
impl<S, B> Transform<S, ServiceRequest> for Timing
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type InitError = ();
    type Transform = TimerMiddleware<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(TimerMiddleware { service }))
    }
}

pub struct TimerMiddleware<S> {
    service: S,
}

impl<S, B> Service<ServiceRequest> for TimerMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let start_timer = Instant::now();

        let fut = self.service.call(req);

        Box::pin(async move {
            let mut res = fut.await?;
            let duration = start_timer.elapsed().as_millis();
            let duration_str: String = duration.to_string();
            let headers = res.headers_mut();
            headers.append(
                HeaderName::from_str("X-Backend-Process-Ms").unwrap(),
                HeaderValue::from_str(duration_str.as_str()).unwrap(),
            );
            Ok(res)
        })
    }
}
