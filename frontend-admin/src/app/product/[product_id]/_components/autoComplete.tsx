import { getImgUrl } from "@/utils/env";
import React, { useState, useEffect, useRef, useCallback } from "react";


interface AutocompleteProps<T> {
    fetchData: (query: string) => Promise<T[]>;
    onSelect: (item: T) => void;
}

const debounceMS = 500
export function Autocomplete<T extends { name: string, img_url: string, id: number }>({ fetchData, onSelect }: AutocompleteProps<T>) {
    const [inputValue, setInputValue] = useState<string>("");
    const [results, setResults] = useState<T[]>([]);
    // const [loading, setLoading] = useState<boolean>(false);
    const [highlightIndex, setHighlightIndex] = useState<number>(-1);
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);


    // 防抖處理
    const debounceFetch = useCallback((value: string) => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(async () => {
            if (!value) {
                setResults([]);
                return;
            }
            // setLoading(true);
            try {
                const data = await fetchData(value);
                setResults(data);
            } catch (err) {
                console.error(err);
            } finally {
                // setLoading(false);
            }
        }, debounceMS);
    }, [fetchData]);


    useEffect(() => {
        debounceFetch(inputValue);
    }, [inputValue, debounceFetch]);


    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!results.length) return;
        if (e.key === "ArrowDown") {
            setHighlightIndex((prev) => (prev + 1) % results.length);
        } else if (e.key === "ArrowUp") {
            setHighlightIndex((prev) => (prev - 1 + results.length) % results.length);
        } else if (e.key === "Enter" && highlightIndex >= 0) {
            handleSelect(e, results[highlightIndex]);
        }
    };


    const handleSelect = (e: React.MouseEvent<HTMLLIElement, MouseEvent> | React.KeyboardEvent<HTMLInputElement>, item: T) => {
        e.preventDefault()
        setInputValue(item.name || String(item));
        // setShowDropdown(false);
        if (onSelect) {
            onSelect(item);
        }
    };

    return (
        <div className="relative inline-block w-64" tabIndex={0} onBlur={()=> {
            setShowDropdown(false)
        }}>
            <input
                type="text"
                className="w-full border p-2"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={handleKeyDown}
            />
            {/* {loading && (
                <div style={{ top: 10 }} className="absolute right-2 animate-spin border-2 border-black border-t-transparent rounded-full w-5 h-5"></div>
            )} */}


            {showDropdown && (
                <ul className="absolute w-full border bg-white mt-1 z-10 max-h-60 overflow-auto">
                    {results.length === 0 &&
                        <li
                            className={`p-2 cursor-pointer `}
                        >
                            無產品符合
                        </li>
                    }
                    {results.map((item, index) => (
                        <li
                            key={index}
                            className={`p-2 cursor-pointer text-left  ${index === highlightIndex ? "bg-blue-500 text-white" : "hover:bg-gray-200"
                                }`}
                            onMouseEnter={() => setHighlightIndex(index)}
                            onMouseLeave={() => setHighlightIndex(-1)}
                            onMouseDown={e => handleSelect(e, item)}
                        >
                            <div className="block">
                                <div className="inline-block">
                                    <img src={getImgUrl(item.img_url)} style={{ width: 50 }} alt={item.name} />
                                </div>
                                <div className="inline-flex ml-2 items-center justify-center">
                                    {item.name || String(item)}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}


export default Autocomplete;