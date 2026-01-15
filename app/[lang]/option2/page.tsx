"use client"

import { motion } from "framer-motion"
import Link from "next/link"

const CarIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 512 512" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M495.5,316l-34.5-92c-6.8-18.2-24.1-30-43.5-30h-35.3l-55.8-96.6c-9.1-15.8-26.1-25.4-44.3-25.4H129.9c-18.2,0-35.2,9.6-44.3,25.4L29.8,194h-35.3c-19.4,0-36.7,11.8-43.5,30L-83.5,316c-1.3,3.5-2,7.2-2,10.9V426c0,22.1,17.9,40,40,40h20.6c7.7,26.4,32,46,60.9,46s53.2-19.6,60.9-46h218.2c7.7,26.4,32,46,60.9,46s53.2-19.6,60.9-46h20.6c22.1,0,40-17.9,40-40V326.9C497.5,323.2,496.8,319.5,495.5,316z M116.5,104h179l45,78H71.5L116.5,104z M76,432c-15.4,0-28-12.6-28-28s12.6-28,28-28s28,12.6,28,28S91.4,432,76,432z M436,432c-15.4,0-28-12.6-28-28s12.6-28,28-28s28,12.6,28,28S451.4,432,436,432z M457.5,356h-403v-49.8l20.1-53.6c2.3-6.1,8.1-10.1,14.6-10.1h333.5c6.5,0,12.3,4,14.6,10.1l20.1,53.6V356z" />
    </svg>
)

export default function GlobeDrivePage() {
    return (
        // z-[200] covers header
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#080808] text-white overflow-hidden font-mono perspective-1000">

            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#151515_1px,transparent_1px),linear-gradient(to_bottom,#151515_1px,transparent_1px)] bg-[size:40px_40px]" />

            {/* Globe Container */}
            <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px] flex items-center justify-center mb-10 transform-style-3d">

                {/* The Earth (CSS+SVG) */}
                <div className="relative z-10 w-full h-full rounded-full bg-[#001835] shadow-[inset_10px_10px_50px_rgba(0,0,0,0.8),0_0_50px_rgba(59,130,246,0.3)] border border-blue-900/30 overflow-hidden">

                    {/* Continents (Moving Background) */}
                    <motion.div
                        className="absolute inset-0 opacity-50"
                        style={{
                            backgroundImage: "url('https://raw.githubusercontent.com/hampusborgos/country-flags/main/png250px/un.png')", // Fallback texture pattern or simple dots if external fails, but let's try a CSS pattern resembling continents.
                            // Actually, let's use a generated world map SVG pattern inline to avoid external deps breaking
                        }}
                    >
                        {/* Abstract Continents via noise/blobs */}
                        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-700/40 rounded-full blur-xl" />
                        <div className="absolute top-1/2 left-2/3 w-40 h-40 bg-green-600/40 rounded-full blur-xl" />
                        <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-green-800/40 rounded-full blur-xl" />

                        {/* Moving Grid - Simulates rotation */}
                        <motion.div
                            className="absolute inset-0 bg-[linear-gradient(90deg,transparent_40px,rgba(255,255,255,0.05)_41px)] bg-[size:50px_100%]"
                            animate={{ backgroundPosition: ["0px 0px", "100px 0px"] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                        />
                    </motion.div>

                    {/* Atmosphere Glow */}
                    <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(100,200,255,0.2)]" />
                </div>

                {/* Orbit Path & Car */}
                {/* To make it go "behind", we rotate the container in 3D or use z-index hacks.
                    Simple z-index hack:
                    2 animations:
                    1. X/Y translation (circle)
                    2. Z-index (toggle between 0 and 20 based on position)
                */}
                <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                >
                    <div className="absolute top-1/2 -right-6 w-12 h-12 -mt-6 flex items-center justify-center">
                        {/* This container rotates.
                             We need to counter-rotate the car to keep it upright or let it bank?
                             Let's let it bank (point forward).
                         */}
                        <CarIcon className="w-10 h-10 text-white drop-shadow-[0_0_15px_rgba(255,255,255,1)] transform rotate-90" />
                    </div>
                </motion.div>

                {/* HACK: To show the car going BEHIND, we need a separate overlay that is semi-transparent earth?
                    Or we use `perspective` and `translateZ`.
                    Let's try true 3D.
                 */}
            </div>

            {/* Content */}
            <div className="relative z-20 flex flex-col items-center space-y-4">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl md:text-7xl font-bold tracking-tighter text-white">
                        WORLDWIDE
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-blue-400 text-sm font-bold tracking-[0.3em] uppercase">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        Coming Soon to 195 Countries
                    </div>
                </div>
            </div>

            {/* Footer / Impressum - Centered, Original Style */}
            <div className="absolute bottom-6 z-30 w-full flex justify-center">
                <Link href="/de/impressum" className="text-zinc-700 text-sm hover:text-zinc-500 transition-colors">
                    Impressum / Legal
                </Link>
            </div>
        </div>
    )
}
