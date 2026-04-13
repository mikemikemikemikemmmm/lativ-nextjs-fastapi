export const isDevEnvironment = () => {
    return import.meta.env.NODE_ENV === 'development';
}
export const ENV = {
    backendUrl: import.meta.env.VITE_BACKEND_BASE_URL,
    imgUrlPrefix: import.meta.env.VITE_IMG_BASE_URL,
}
export const getImgUrl = (fileName: string) => {
    if(isDevEnvironment()){
        return ENV.imgUrlPrefix  + fileName
    }
    return ENV.imgUrlPrefix + "prod/" + fileName
}