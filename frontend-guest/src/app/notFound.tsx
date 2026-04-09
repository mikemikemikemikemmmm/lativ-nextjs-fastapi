import { Image } from "@/components/image";
// import { ENV } from "@/utils/env";

export const NotFoundUI = () => {
    return <div className="flex justify-center items-center w-dvw h-dvh">
        <Image src={`/404.jpg`} height={250} width={400} alt="404" />
    </div>
}
