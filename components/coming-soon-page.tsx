"use client"

import { Map, Signpost, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

// Custom SVG Icons for distinct vehicle types
const CarIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M19 17H5c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2zm-1.5-6h-11v2h11v-2z" />
        <path d="M5 9l1.5-3.5h11L19 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
    </svg>
)

const ScooterIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M4 16c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2zM16 16c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2z" />
        <path d="M6 14v-5l2-3h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M11 6h5l2 8h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M12 14h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
)

const MotorcycleIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="5" cy="16" r="3" />
        <circle cx="19" cy="16" r="3" />
        <path d="M5 13l3-5h6l3 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M12 13h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M9 8h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
)

export function ComingSoonPage() {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0e17] text-white overflow-hidden font-sans p-4">

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 text-center space-y-4 max-w-2xl mx-auto mt-[-10vh]"
            >
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-2">
                    Coming Soon
                </h1>
                <p className="text-lg md:text-xl text-zinc-400 font-medium tracking-wide">
                    Road rules by country — car, motorcycle & moped.
                </p>
            </motion.div>

            {/* Animation Section */}
            <div className="relative w-full max-w-5xl h-48 my-16 select-none">
                {/* Road Wrapper */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center">
                    {/* Dashed Line - Increased opacity and width for visibility */}
                    <div className="w-full h-[2px] bg-transparent border-t-[3px] border-dashed border-zinc-600/60"></div>
                </div>

                {/* Vehicles Container */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Blue Car */}
                    <motion.div
                        className="absolute top-1/2"
                        initial={{ x: "-10vw" }}
                        animate={{ x: "110vw" }}
                        transition={{
                            repeat: Infinity,
                            duration: 12,
                            ease: "linear",
                            delay: 0
                        }}
                        style={{ marginTop: "-32px" }} // Adjust to sit ON the line
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full" />
                            {/* Using explicit pixel sizes for clarity */}
                            <CarIcon className="h-14 w-14 text-blue-500 relative z-10" />
                        </div>
                    </motion.div>

                    {/* Teal Scooter (Moped) */}
                    <motion.div
                        className="absolute top-1/2"
                        initial={{ x: "-10vw" }}
                        animate={{ x: "110vw" }}
                        transition={{
                            repeat: Infinity,
                            duration: 12,
                            ease: "linear",
                            delay: 4
                        }}
                        style={{ marginTop: "-28px" }}
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-teal-500/30 blur-xl rounded-full" />
                            <ScooterIcon className="h-10 w-10 text-teal-400 relative z-10" />
                        </div>
                    </motion.div>

                    {/* Orange Motorcycle */}
                    <motion.div
                        className="absolute top-1/2"
                        initial={{ x: "-10vw" }}
                        animate={{ x: "110vw" }}
                        transition={{
                            repeat: Infinity,
                            duration: 12,
                            ease: "linear",
                            delay: 8
                        }}
                        style={{ marginTop: "-30px" }}
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-orange-500/30 blur-xl rounded-full" />
                            <MotorcycleIcon className="h-12 w-12 text-orange-400 relative z-10" />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Feature Pills */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="flex flex-wrap justify-center gap-4 relative z-10"
            >
                <div className="px-5 py-2.5 rounded-lg bg-[#151b26] text-blue-200/80 text-sm font-medium border border-blue-900/30 flex items-center gap-2 shadow-sm">
                    <Map className="w-4 h-4" />
                    Country rules
                </div>
                <div className="px-5 py-2.5 rounded-lg bg-[#151b26] text-teal-200/80 text-sm font-medium border border-teal-900/30 flex items-center gap-2 shadow-sm">
                    <ScooterIcon className="w-4 h-4" />
                    Vehicle-specific rules
                </div>
                <div className="px-5 py-2.5 rounded-lg bg-[#151b26] text-orange-200/80 text-sm font-medium border border-orange-900/30 flex items-center gap-2 shadow-sm">
                    <Signpost className="w-4 h-4" />
                    Road signs
                </div>
            </motion.div>
        </div>
    )
}
