export const Image = (props: { height: number, width: number, src: string, alt?: string ,className?:string }) => {
    return <img className={props.className} height={props.height} width={props.width} src={props.src} alt={props.alt} />
}