"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface HeroImageProps {
    images?: string[]
    name: string
}

export default function HeroImage({ images, name }: HeroImageProps) {
    const [currentImage, setCurrentImage] = useState<string>("")
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        if (images && images.length > 0) {
            const storageKey = `roadrulez_last_hero_v2_${name.replace(/\s+/g, "_").toLowerCase()}`
            const lastImage = sessionStorage.getItem(storageKey)

            let candidates = images
            if (images.length > 1 && lastImage) {
                candidates = images.filter((img) => img !== lastImage)
            }

            const randomIndex = Math.floor(Math.random() * candidates.length)
            const selected = candidates[randomIndex]

            setCurrentImage(selected)
            sessionStorage.setItem(storageKey, selected)
        }
        setIsLoaded(true)
    }, [images, name])

    if (!isLoaded) {
        return <div className="absolute inset-0 bg-[#0a0e17]" aria-hidden="true" />
    }

    if (!currentImage) {
        return (
            <div
                className="absolute inset-0 bg-[url('/hero-globe.png')] bg-cover bg-center opacity-40"
                aria-hidden="true"
            />
        )
    }

    return (
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={currentImage}
                alt=""
                draggable={false}
                className={cn(
                    "pointer-events-none absolute inset-0 h-full w-full select-none object-cover",
                    "transition-opacity duration-700",
                    isLoaded ? "opacity-100" : "opacity-0"
                )}
            />
        </div>
    )
}
