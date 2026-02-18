"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Map } from "lucide-react"

export function ComingSoonCountry() {
    return (
        <div className="fixed inset-0 z-[50] flex flex-col items-center justify-center bg-[#050505] text-white overflow-hidden font-sans">

            {/* Background: Abstract "Long Exposure" Traffic */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-[#020203] opacity-90" /> {/* Dark Base */}

                {/* Slanted Container for dynamic angle */}
                <div className="absolute inset-0 transform -skew-y-12 scale-150 origin-center">
                    {/* Light Streaks */}
                    {Array.from({ length: 20 }).map((_, i) => {
                        const isRed = i % 2 === 0; // Alternate between "Heads" (White/Blue) and "Tails" (Red)
                        const color = isRed ? "bg-red-500" : "bg-cyan-100";
                        const height = Math.random() * 200 + 100; // Random length
                        const width = Math.random() * 2 + 1; // Random thickness
                        const duration = Math.random() * 2 + 3; // Random speed
                        const delay = Math.random() * 5;
                        const top = Math.random() * 100;
                        const opacity = Math.random() * 0.3 + 0.1;

                        return (
                            <motion.div
                                key={i}
                                className={`absolute ${color} rounded-full blur-[1px]`}
                                style={{
                                    height: `${width}px`,
                                    width: `${height}px`,
                                    top: `${top}%`,
                                    left: "-20%", // Start off screen
                                    opacity: opacity,
                                    boxShadow: isRed
                                        ? "0 0 10px 1px rgba(239, 68, 68, 0.5)"
                                        : "0 0 10px 1px rgba(207, 250, 254, 0.5)"
                                }}
                                animate={{
                                    x: ["0vw", "150vw"], // Use viewport width units for consistent travel
                                }}
                                transition={{
                                    duration: duration,
                                    repeat: Infinity,
                                    ease: "linear",
                                    delay: delay,
                                }}
                            />
                        )
                    })}
                </div>

                {/* Vignette & Noise */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
            </div>

            {/* Content Overlay */}
            <div className="relative z-20 flex flex-col items-center text-center space-y-8 px-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                >
                    <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/40 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                        NO <span className="text-cyan-400">DATA</span> YET
                    </h1>
                </motion.div>

                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-lg md:text-2xl font-light tracking-[0.4em] text-cyan-100/70 uppercase max-w-2xl"
                >
                    We are working on this country
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="pt-8 flex flex-col sm:flex-row gap-4 w-full justify-center"
                >
                    <Link href="/map" className="group relative px-8 py-3 bg-cyan-900/20 hover:bg-cyan-900/40 border border-cyan-500/30 rounded-full text-cyan-100 uppercase tracking-widest text-sm transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                        <Map className="w-4 h-4" />
                        <span>Go to Map</span>
                    </Link>

                    <Link href="/" className="group relative px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-zinc-300 uppercase tracking-widest text-sm transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2 hover:border-white/30 hover:text-white">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back Home</span>
                    </Link>
                </motion.div>
            </div>

            {/* Speed Lines Effect overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
        </div>
    )
}
