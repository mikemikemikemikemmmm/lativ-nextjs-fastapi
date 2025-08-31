export const isDevEnvironment = () => {
    return process.env.NODE_ENV === 'development';
}
export const imgUrlPrefix = process.env.NEXT_PUBLIC_S3_URL_PREFIX