"use client"

import { motion } from "framer-motion"
import { useState } from "react"

export function ComingSoonPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [password, setPassword] = useState("")
    const [error, setError] = useState(false)

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        const correctPassword = process.env.NEXT_PUBLIC_BETA_PASSWORD ?? "1234"
        if (password === correctPassword) {
            setIsAuthenticated(true)
            setError(false)
        } else {
            setError(true)
        }
    }

    if (!isAuthenticated) {
        return (
            <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050505] text-white font-sans">
                <form onSubmit={handleLogin} className="flex flex-col items-center gap-4 w-full max-w-xs px-4">
                    <h1 className="text-2xl font-light tracking-widest uppercase text-zinc-400">Restricted Access</h1>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter Password"
                        className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-center tracking-widest focus:outline-none focus:border-cyan-500 transition-colors"
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-white text-black font-bold uppercase tracking-widest rounded-md hover:bg-zinc-200 transition-colors"
                    >
                        Enter
                    </button>
                    {error && <p className="text-red-500 text-xs tracking-widest uppercase animate-pulse">Incorrect Password</p>}
                </form>
            </div>
        )
    }

    return (
        // z-[200] covers the site header
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050505] text-white overflow-hidden font-sans">

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
