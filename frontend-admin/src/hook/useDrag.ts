import { useRef } from "react";

export const useDrag = (onDrop: (start: number, end: number) => void) => {
    const startItemId = useRef<number | null>(null);

    const handleDragStart = (id: number) => {
        startItemId.current = id;
    };

    const handleDragOver = (e: { preventDefault: () => void; }) => {
        e.preventDefault(); // 必須阻止預設行為才能允許 drop
    };

    const handleDrop = (endId: number) => {
        if (!startItemId.current) {
            return
        }
        if (startItemId.current === endId) {
            startItemId.current = null;
            return
        }
        onDrop(startItemId.current, endId)
        startItemId.current = null;
    };
    return {
        handleDragStart,
        handleDragOver,
        handleDrop,
    };
}