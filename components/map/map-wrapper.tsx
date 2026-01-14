"use client"

import { useMemo } from "react"
import dynamic from "next/dynamic"

export default function MapWrapper(props: any) {
    const Map = useMemo(
        () =>
            dynamic(() => import("@/components/map/map-libre"), {
                loading: () => <div className="h-full w-full animate-pulse bg-muted/20" />,
                ssr: false,
            }),
        []
    )

    return <Map {...props} />
}
