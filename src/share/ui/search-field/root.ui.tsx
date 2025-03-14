'use client'

import {type ReactNode, useState} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";

import {TextField} from "@radix-ui/themes";
import {MagnifyingGlassIcon} from "@radix-ui/react-icons";
import {useDebouncedCallback} from "use-debounce";

import {SearchFieldContext} from "./context";
import Form from "next/form";

export type RootProps = TextField.RootProps & {
    children?: ReactNode;
    action?: string;
    queryKey?: string;
}

export function Root({placeholder, queryKey = 'query', children, action, ...props}: RootProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const {replace} = useRouter();

    const [query, setQuery] = useState(searchParams.get(queryKey) ?? '');
    const [focused, setFocused] = useState(false);


    let timeoutId: ReturnType<typeof setTimeout>;

    const handleBlur = () => {
        timeoutId = setTimeout(() => {
            setFocused(false);
        }, 100);
    };

    const handleFocus = () => {
        clearTimeout(timeoutId);
        setFocused(true);
    };

    const handleSearch = useDebouncedCallback(
        (term: string) => {
            const params = new URLSearchParams(searchParams);
            if (params.has('page')) params.set('page', '1');

            if (term) {
                params.set(queryKey, term);
            } else {
                params.delete(queryKey);
            }
            replace(`${pathname}?${params.toString()}`);
        }
        , 300);
    return (
        <Form action={function () {
            if (action) replace(`${action}?${new URLSearchParams(`${queryKey}=${query}`)}`);
        }}
              style={{position: 'relative'}}>
            <TextField.Root placeholder={placeholder}
                            value={query}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                handleSearch(e.target.value);
                            }}
                            {...props}
            >
                <TextField.Slot side="left">
                    <MagnifyingGlassIcon/>
                </TextField.Slot>
            </TextField.Root>
            <SearchFieldContext.Provider value={{query, focused}}>
                {children}
            </SearchFieldContext.Provider>
        </Form>
    )
}