import { useEffect, useState } from "react";
import { CategoryAside } from "./_category/categoryAside";
import { CategoryRead } from "@/types/nav";
import { errorHandler } from "@/utils/errorHandler";
import { getApi } from "@/api/base";
import { ModalContainer } from "@/components/modalContainer";
export default function NavLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <CategoryAside />
            <div>
                {children}
            </div>
        </>
    )
}