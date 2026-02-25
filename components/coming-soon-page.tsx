"use client"

import { motion } from "framer-motion"
import { useState, useEffect, useMemo } from "react"

interface Streak {
    isRed: boolean;
    height: number;
    width: number;
    duration: number;
    delay: number;
    top: number;
    opacity: number;
}

export function ComingSoonPage() {
    const [mounted, setMounted] = useState(false)

    // Only render animations client-side to avoid hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    // Deterministic streak values — avoids hydration mismatch from Math.random() in render
    const streaks: Streak[] = useMemo(() => {
        const sr = (seed: number) => { const x = Math.sin(seed + 1) * 10000; return x - Math.floor(x) }
        return Array.from({ length: 20 }, (_, i) => ({
            isRed: i % 2 === 0,
            height: sr(i * 6) * 200 + 100,
            width: sr(i * 6 + 1) * 2 + 1,
            duration: sr(i * 6 + 2) * 2 + 3,
            delay: sr(i * 6 + 3) * 5,
            top: sr(i * 6 + 4) * 100,
            opacity: sr(i * 6 + 5) * 0.3 + 0.1,
        }))
    }, [])



    return (
        // z-[200] covers the site header
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050505] text-white overflow-hidden font-sans">

            {/* Background: Abstract "Long Exposure" Traffic */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-[#020203] opacity-90" /> {/* Dark Base */}

                {/* Slanted Container for dynamic angle */}
                {/* Render streaks only on client to avoid hydration mismatch */}
                {mounted && (
                    <div className="absolute inset-0 transform -skew-y-12 scale-150 origin-center">
                        {streaks.map((s, i) => (
                            <motion.div
                                key={i}
                                className={`absolute ${s.isRed ? "bg-red-500" : "bg-cyan-100"} rounded-full blur-[1px]`}
                                style={{
                                    height: `${s.width}px`,
                                    width: `${s.height}px`,
                                    top: `${s.top}%`,
                                    left: "-20%",
                                    opacity: s.opacity,
                                    boxShadow: s.isRed
                                        ? "0 0 10px 1px rgba(239, 68, 68, 0.5)"
                                        : "0 0 10px 1px rgba(207, 250, 254, 0.5)"
                                }}
                                animate={{ x: ["0vw", "150vw"] }}
                                transition={{ duration: s.duration, repeat: Infinity, ease: "linear", delay: s.delay }}
                            />
                        ))}
                    </div>
                )}

                {/* Vignette & Noise */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
            </div>

            {/* Content Overlay */}
            <div className="relative z-20 flex flex-col items-center text-center space-y-8">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                >
                    <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/40 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                        ROAD<span className="text-cyan-400">RULEZ</span>
                    </h1>
                </motion.div>

                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-xl md:text-3xl font-light tracking-[0.6em] text-cyan-100/70 uppercase"
                >
                    Coming Soon
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="pt-12"
                >
                    <div className="px-6 py-2 border border-white/10 rounded-full bg-white/5 backdrop-blur-md text-sm text-zinc-400 uppercase tracking-widest shadow-xl">
                        Global Traffic Rules. Simplified.
                    </div>
                </motion.div>
            </div>

            {/* Speed Lines Effect overlay - kept subtle for depth */}
            <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

            {/* Footer Removed - Impressum Links Deleted */}
        </div>
    )
}
