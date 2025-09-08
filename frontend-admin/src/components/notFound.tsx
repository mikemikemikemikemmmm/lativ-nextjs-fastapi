import Image from "next/image"

export const NotFoundUI=()=>{
    return <div className="flex justify-center items-center w-full h-[500]">
       <Image className="max-w-full" src={"/404.jpg"} height={250} width={400} alt="404" />
    </div>
}
