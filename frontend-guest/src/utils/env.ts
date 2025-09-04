export const isDevEnvironment = () => {
    return process.env.NODE_ENV === 'development';
}
export const ENV = {
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
    imgUrlPrefix: process.env.NEXT_PUBLIC_S3_URL_PREFIX
}
export const getImgUrl = (fileName: string) => {
    return ENV.imgUrlPrefix + fileName
}