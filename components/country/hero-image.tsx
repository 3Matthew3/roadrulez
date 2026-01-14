"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface HeroImageProps {
    images?: string[]
    name: string
}

export default function HeroImage({ images, name }: HeroImageProps) {
    const [currentImage, setCurrentImage] = useState<string>("")
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        if (images && images.length > 0) {
            // Check sessionStorage for last shown image to prevent back-to-back duplicates
            const storageKey = `roardrulez_last_hero_${name.replace(/\s+/g, '_').toLowerCase()}`
            const lastImage = sessionStorage.getItem(storageKey)

            // Filter out the last image if we have more than 1 option
            let candidates = images
            if (images.length > 1 && lastImage) {
                candidates = images.filter(img => img !== lastImage)
            }

            // Select random from candidates
            const randomIndex = Math.floor(Math.random() * candidates.length)
            const selected = candidates[randomIndex]

            setCurrentImage(selected)
            sessionStorage.setItem(storageKey, selected)
        }
        setIsLoaded(true)
    }, [images, name])

    if (!isLoaded) {
        return <div className="absolute inset-0 bg-[#0a0e17]" />
    }

    if (!currentImage) {
        // Fallback to the default texture
        return (
            <div className="absolute inset-0 opacity-40 bg-[url('/hero-globe.png')] bg-cover bg-center" />
        )
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={currentImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="absolute inset-0"
            >
                <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
                    style={{ backgroundImage: `url('${currentImage}')` }}
                />
            </motion.div>
        </AnimatePresence>
    )
}
