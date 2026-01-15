"use client"

import { motion } from "framer-motion"

export default function CinematicBlurPage() {
    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-black text-white overflow-hidden font-sans">

            {/* Background Blur Animation (Simulating traffic lights) */}
            <div className="absolute inset-0 z-0 bg-black">
                {/* Red Lights (Taillights) */}
                <motion.div
                    animate={{ x: ["100%", "-20%"] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[40%] right-0 w-[600px] h-[300px] bg-red-600/40 blur-[100px] rounded-full opacity-60"
                />
                <motion.div
                    animate={{ x: ["100%", "-20%"] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 3 }}
                    className="absolute top-[50%] right-0 w-[400px] h-[200px] bg-amber-600/30 blur-[80px] rounded-full opacity-50"
                />

                {/* White/Blue Lights (Headlights) - Moving Opposite */}
                <motion.div
                    animate={{ x: ["-20%", "100%"] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[30%] left-0 w-[500px] h-[250px] bg-blue-100/20 blur-[90px] rounded-full opacity-40"
                />
                <motion.div
                    animate={{ x: ["-20%", "100%"] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "linear", delay: 2 }}
                    className="absolute top-[45%] left-0 w-[300px] h-[150px] bg-white/10 blur-[60px] rounded-full opacity-30"
                />
            </div>

            {/* Grain Overlay for film look */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* Content */}
            <div className="relative z-20 flex flex-col items-center space-y-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="flex flex-col items-center"
                >
                    <h1 className="text-7xl md:text-9xl font-bold tracking-tighter text-white mix-blend-overlay">
                        DRIVE
                    </h1>
                    <h1 className="text-7xl md:text-9xl font-bold tracking-tighter text-white/90">
                        SAFE
                    </h1>
                </motion.div>

                <div className="h-[1px] w-24 bg-white/50" />

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="text-white/60 text-sm font-light tracking-[0.3em] uppercase"
                >
                    Road Rules by Country
                </motion.p>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-zinc-200 transition-colors"
                >
                    Notify Me
                </motion.button>
            </div>
        </div>
    )
}
