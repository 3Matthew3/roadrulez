"use client"

import { motion } from "framer-motion"
import Link from "next/link"

const CarIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 512 512" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M495.5,316l-34.5-92c-6.8-18.2-24.1-30-43.5-30h-35.3l-55.8-96.6c-9.1-15.8-26.1-25.4-44.3-25.4H129.9c-18.2,0-35.2,9.6-44.3,25.4L29.8,194h-35.3c-19.4,0-36.7,11.8-43.5,30L-83.5,316c-1.3,3.5-2,7.2-2,10.9V426c0,22.1,17.9,40,40,40h20.6c7.7,26.4,32,46,60.9,46s53.2-19.6,60.9-46h218.2c7.7,26.4,32,46,60.9,46s53.2-19.6,60.9-46h20.6c22.1,0,40-17.9,40-40V326.9C497.5,323.2,496.8,319.5,495.5,316z M116.5,104h179l45,78H71.5L116.5,104z M76,432c-15.4,0-28-12.6-28-28s12.6-28,28-28s28,12.6,28,28S91.4,432,76,432z M436,432c-15.4,0-28-12.6-28-28s12.6-28,28-28s28,12.6,28,28S451.4,432,436,432z M457.5,356h-403v-49.8l20.1-53.6c2.3-6.1,8.1-10.1,14.6-10.1h333.5c6.5,0,12.3,4,14.6,10.1l20.1,53.6V356z" />
    </svg>
)

export default function NightDrivePage() {
    return (
        // z-[200] covers the site header
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black text-white overflow-hidden font-sans perspective-[1000px]">

            {/* Background Sky */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#020510] via-[#0b1026] to-[#1a0b2e]">
                {/* Stars */}
                {Array.from({ length: 50 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute bg-white rounded-full opacity-0"
                        style={{
                            width: Math.random() * 2 + 1,
                            height: Math.random() * 2 + 1,
                            top: `${Math.random() * 40}%`,
                            left: `${Math.random() * 100}%`,
                        }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{
                            duration: Math.random() * 3 + 2,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                        }}
                    />
                ))}
            </div>

            {/* Horizon Glow */}
            <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 w-[80vw] h-[40vh] rounded-[100%] bg-fuchsia-600/20 blur-[100px] z-0" />
            <div className="absolute bottom-1/2 w-full h-px bg-fuchsia-500/50 blur-sm z-10" />

            {/* 3D Road Container - Centered */}
            <div
                className="absolute inset-x-0 bottom-0 top-1/2 z-10 flex justify-center overflow-hidden"
                style={{ transformStyle: "preserve-3d", perspective: "300px" }}
            >
                {/* The Road Surface */}
                <div
                    className="absolute bottom-0 w-[400px] md:w-[600px] h-[2000px] bg-[#050505] origin-bottom"
                    style={{
                        transform: "rotateX(80deg)",
                        backgroundImage: `
                            linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.05) 50%, transparent 51%),
                            linear-gradient(90deg, transparent 2%, rgba(50,50,50,0.5) 2%, transparent 3%),
                            linear-gradient(90deg, transparent 97%, rgba(50,50,50,0.5) 97%, transparent 98%)
                        `,
                        backgroundSize: "100% 100%, 100% 100%, 100% 100%"
                    }}
                >
                    {/* Moving Lane Markers */}
                    <div className="absolute inset-0 flex justify-center">
                        <motion.div
                            className="w-2 md:w-4 h-full bg-[repeating-linear-gradient(to_bottom,transparent,transparent_60px,rgba(255,255,255,0.8)_60px,rgba(255,255,255,0.8)_120px)]"
                            animate={{ backgroundPosition: ["0px 0px", "0px 1000px"] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                </div>

                {/* Car Driving on Road */}
                <div className="absolute bottom-[20px] z-20" style={{ transformStyle: "preserve-3d" }}>
                    <CarIcon className="w-16 h-16 text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]" />
                    <div className="absolute -bottom-2 inset-x-2 h-4 bg-red-500/50 blur-xl"></div> {/* Taillights reflection */}
                </div>

                {/* Roadside Poles (Left) */}
                {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                        key={`left-${i}`}
                        className="absolute bottom-0 left-[calc(50%-250px)] md:left-[calc(50%-350px)] w-1 h-32 bg-gradient-to-t from-cyan-500/50 to-transparent"
                        style={{ transformOrigin: "bottom center" }}
                        initial={{ z: -1000, scale: 0, opacity: 0, x: 100 }}
                        animate={{ z: 200, scale: 1.5, opacity: 1, x: -50 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: i * 0.33 }}
                    />
                ))}
                {/* Roadside Poles (Right) */}
                {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                        key={`right-${i}`}
                        className="absolute bottom-0 right-[calc(50%-250px)] md:right-[calc(50%-350px)] w-1 h-32 bg-gradient-to-t from-fuchsia-500/50 to-transparent"
                        style={{ transformOrigin: "bottom center" }}
                        initial={{ z: -1000, scale: 0, opacity: 0, x: -100 }}
                        animate={{ z: 200, scale: 1.5, opacity: 1, x: 50 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: i * 0.33 }}
                    />
                ))}
            </div>

            {/* Content Overlay */}
            <div className="relative z-20 flex flex-col items-center text-center space-y-4 mt-[-20vh]">
                <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                    ROAD<span className="text-cyan-400">RULEZ</span>
                </h1>

                <h2 className="text-2xl md:text-4xl font-light tracking-[0.5em] text-fuchsia-200 uppercase">
                    Coming Soon
                </h2>
            </div>

            {/* Speed Lines Effect overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-50" />

            {/* Footer / Impressum - Centered, Original Style */}
            <div className="absolute bottom-6 z-30 w-full flex justify-center">
                <Link href="/de/impressum" className="text-zinc-700 text-sm hover:text-zinc-500 transition-colors">
                    Impressum / Legal
                </Link>
            </div>
        </div>
    )
}
