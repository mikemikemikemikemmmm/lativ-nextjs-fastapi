export const isDevEnvironment = () => {
    return import.meta.env.NODE_ENV === 'development';
}
export const ENV = {
    backendUrl: import.meta.env.VITE_BACKEND_BASE_URL,
    imgUrlPrefix: import.meta.env.VITE_S3_URL_PREFIX
}
export const getImgUrl = (fileName: string) => {
    return ENV.imgUrlPrefix + fileName
}