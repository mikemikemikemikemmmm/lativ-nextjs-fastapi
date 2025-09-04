import { getApi } from "@/api/base"

export default async({ params }: { params: { nav_route: string } })  => {
    const { nav_route } = await params
    const {data,error} =await getApi(`categorys?nav_route=${nav_route}`)
    if(error){
        return null
    }
    return <div>2343243</div>
}