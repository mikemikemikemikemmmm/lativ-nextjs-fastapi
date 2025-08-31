'use client'
import { CategoryAside } from "./_components/categoryAside";
import React, { useEffect, useState } from 'react';
import { useParams } from "next/navigation";
import { NavRead } from "@/types/nav";
import { getApi } from "@/api/base";
import { errorHandler } from "@/utils/errorHandler";
export default function NavLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const params = useParams();
    const { nav_route } = params
    const [nav, setNav] = useState<NavRead | "loading"|"noNav">("loading")
    const getNav = async () => {
        const { data, error } = await getApi<NavRead>(
            `nav/nav_route/${nav_route}`
        )
        if (error) {
            setNav("noNav")
            return errorHandler(error)
        }
        setNav(data)
    }
    useEffect(() => {
        getNav()
    }, [nav_route])
    if (nav==="loading") {
        return null
    }
    if(nav==="noNav"){
        return <div>no nav</div>
    }
    return (
        <div className="flex justify-stretch">
            <div className=' inline-block min-w-2/6 p-4'><CategoryAside nav={nav} /></div>
            <div className=' inline-block min-w-4/6 p-4'> {children}</div>
        </div>
    )
}