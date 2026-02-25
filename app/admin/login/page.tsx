"use client"

import { useState, useMemo } from "react"
import { Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Shield, Loader2, Mail, Lock, ArrowRight } from "lucide-react"
import Link from "next/link"

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
})
type LoginForm = z.infer<typeof loginSchema>

function AdminLoginPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get("callbackUrl") ?? "/admin"
    const [error, setError] = useState<string | null>(null)

    // Deterministic star positions — avoids server/client hydration mismatch
    const stars = useMemo(() => {
        const seededRand = (seed: number) => {
            const x = Math.sin(seed + 1) * 10000
            return x - Math.floor(x)
        }
        return Array.from({ length: 80 }, (_, i) => ({
            left: seededRand(i * 3) * 100,
            top: seededRand(i * 3 + 1) * 100,
            delay: (seededRand(i * 3 + 2) * 4).toFixed(2),
            size: seededRand(i * 3) > 0.8 ? 2 : 1,
        }))
    }, [])

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

    const onSubmit = async (data: LoginForm) => {
        setError(null)
        const result = await signIn("credentials", {
            email: data.email,
            password: data.password,
            redirect: false,
        })
        if (result?.error) {
            setError(result.error === "Too many attempts. Please try again later."
                ? "Too many attempts. Please try again later."
                : "Invalid email or password")
        } else {
            router.push(callbackUrl)
            router.refresh()
        }
    }

    return (
        <div className="rr-login-root">
            {/* Animated star particles */}
            <div className="rr-stars" aria-hidden="true">
                {stars.map((s, i) => (
                    <span key={i} className="rr-star" style={{
                        left: `${s.left}%`,
                        top: `${s.top}%`,
                        animationDelay: `${s.delay}s`,
                        width: `${s.size}px`,
                        height: `${s.size}px`,
                    }} />
                ))}
            </div>

            {/* Main layout: form left, shield right */}
            <div className="rr-login-inner">
                {/* ── Form Panel ── */}
                <div className="rr-form-panel">
                    {/* Logo */}
                    <div className="rr-logo-wrap">
                        <div className="rr-logo-icon">
                            <Shield className="rr-logo-svg" />
                        </div>
                        <h1 className="rr-title">RoadRulez Admin</h1>
                        <p className="rr-subtitle">Sign in to your account</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="rr-form" noValidate>
                        {error && (
                            <div className="rr-error-banner" role="alert">
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div className="rr-field">
                            <label className="rr-label" htmlFor="email">Email</label>
                            <div className="rr-input-wrap">
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="admin@roadrulez.com"
                                    autoComplete="email"
                                    className={`rr-input${errors.email ? " rr-input--error" : ""}`}
                                    {...register("email")}
                                />
                                <Mail className="rr-input-icon" size={16} />
                            </div>
                            {errors.email && <p className="rr-field-error">{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div className="rr-field">
                            <label className="rr-label" htmlFor="password">Password</label>
                            <div className="rr-input-wrap">
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    className={`rr-input${errors.password ? " rr-input--error" : ""}`}
                                    {...register("password")}
                                />
                                <Lock className="rr-input-icon" size={16} />
                            </div>
                            {errors.password && <p className="rr-field-error">{errors.password.message}</p>}
                        </div>

                        {/* Submit */}
                        <button type="submit" className="rr-btn-signin" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <><Loader2 className="rr-btn-spinner" size={16} /> Signing in...</>
                            ) : "Sign in"}
                        </button>
                    </form>

                    <p className="rr-disclaimer">Internal use only. Unauthorized access is prohibited.</p>

                    <div className="rr-footer-links">
                        <span className="rr-footer-link rr-footer-link--muted">Forgot your password?</span>
                        <span className="rr-footer-divider">|</span>
                        <Link href="/" className="rr-footer-link">
                            Back to homepage <ArrowRight size={12} className="rr-footer-arrow" />
                        </Link>
                    </div>
                </div>

                {/* ── Shield Graphic ── */}
                <div className="rr-shield-panel" aria-hidden="true">
                    <div className="rr-shield-glow" />
                    <svg className="rr-shield-svg" viewBox="0 0 300 340" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Outer glow ring */}
                        <ellipse cx="150" cy="170" rx="130" ry="145" fill="url(#shieldGlowRing)" opacity="0.18" />
                        {/* Shield body */}
                        <path
                            d="M150 10 L270 60 L270 160 C270 240 210 300 150 330 C90 300 30 240 30 160 L30 60 Z"
                            fill="url(#shieldFill)"
                            stroke="url(#shieldStroke)"
                            strokeWidth="1.5"
                        />
                        {/* Inner shield */}
                        <path
                            d="M150 40 L245 80 L245 160 C245 225 200 275 150 300 C100 275 55 225 55 160 L55 80 Z"
                            fill="url(#shieldInner)"
                            stroke="url(#shieldInnerStroke)"
                            strokeWidth="1"
                            opacity="0.7"
                        />
                        {/* Center lock icon */}
                        <rect x="130" y="155" width="40" height="32" rx="5" fill="url(#lockFill)" stroke="#a78bfa" strokeWidth="1" />
                        <path d="M138 155 L138 145 C138 134 162 134 162 145 L162 155" stroke="#a78bfa" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                        <circle cx="150" cy="171" r="5" fill="#c4b5fd" />
                        <rect x="148" y="171" width="4" height="8" rx="2" fill="#c4b5fd" />
                        {/* Network dots */}
                        {[
                            [70, 90], [90, 50], [130, 30], [170, 25], [220, 55], [250, 100],
                            [260, 155], [240, 220], [200, 280], [150, 320], [100, 275], [55, 215],
                            [45, 150], [60, 90],
                        ].map(([cx, cy], i) => (
                            <circle key={i} cx={cx} cy={cy} r="3" fill="#8b5cf6" opacity="0.9">
                                <animate attributeName="opacity" values="0.5;1;0.5" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                            </circle>
                        ))}
                        {/* Network lines */}
                        {[
                            "M70,90 L90,50", "M90,50 L130,30", "M130,30 L170,25", "M170,25 L220,55",
                            "M220,55 L250,100", "M250,100 L260,155", "M260,155 L240,220",
                            "M240,220 L200,280", "M200,280 L150,320", "M150,320 L100,275",
                            "M100,275 L55,215", "M55,215 L45,150", "M45,150 L60,90", "M60,90 L70,90",
                            "M90,50 L150,25", "M150,25 L220,55", "M70,90 L130,30", "M220,55 L150,320",
                        ].map((d, i) => (
                            <path key={i} d={d} stroke="#7c3aed" strokeWidth="0.8" opacity="0.5" />
                        ))}
                        {/* Sparkles */}
                        {[[85, 120], [215, 110], [250, 180], [60, 200], [180, 310]].map(([x, y], i) => (
                            <g key={i} transform={`translate(${x},${y})`}>
                                <line x1="-5" y1="0" x2="5" y2="0" stroke="white" strokeWidth="1" opacity="0.6">
                                    <animate attributeName="opacity" values="0.2;0.8;0.2" dur={`${1.5 + i * 0.4}s`} repeatCount="indefinite" />
                                </line>
                                <line x1="0" y1="-5" x2="0" y2="5" stroke="white" strokeWidth="1" opacity="0.6">
                                    <animate attributeName="opacity" values="0.2;0.8;0.2" dur={`${1.5 + i * 0.4}s`} repeatCount="indefinite" />
                                </line>
                            </g>
                        ))}
                        <defs>
                            <radialGradient id="shieldGlowRing" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#7c3aed" stopOpacity="1" />
                                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                            </radialGradient>
                            <linearGradient id="shieldFill" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.9" />
                                <stop offset="100%" stopColor="#0f0a2a" stopOpacity="0.7" />
                            </linearGradient>
                            <linearGradient id="shieldStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#a78bfa" />
                                <stop offset="50%" stopColor="#60a5fa" />
                                <stop offset="100%" stopColor="#a78bfa" />
                            </linearGradient>
                            <linearGradient id="shieldInner" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#312e81" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.1" />
                            </linearGradient>
                            <linearGradient id="shieldInnerStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#818cf8" />
                                <stop offset="100%" stopColor="#60a5fa" />
                            </linearGradient>
                            <linearGradient id="lockFill" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#3730a3" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.8" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>

            <style>{`
                .rr-login-root {
                    position: relative;
                    min-height: 100vh;
                    background: radial-gradient(ellipse at 20% 50%, #0d0a2e 0%, #060414 40%, #000208 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    font-family: 'Inter', system-ui, sans-serif;
                }
                .rr-stars { position: absolute; inset: 0; pointer-events: none; }
                .rr-star {
                    position: absolute;
                    border-radius: 50%;
                    background: white;
                    animation: rr-twinkle 3s ease-in-out infinite;
                    opacity: 0.6;
                }
                @keyframes rr-twinkle {
                    0%, 100% { opacity: 0.2; transform: scale(1); }
                    50% { opacity: 0.9; transform: scale(1.4); }
                }
                .rr-login-inner {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    align-items: center;
                    gap: 80px;
                    padding: 48px 32px;
                    max-width: 860px;
                    width: 100%;
                }
                /* ── Form Panel ── */
                .rr-form-panel {
                    flex: 1;
                    max-width: 380px;
                }
                .rr-logo-wrap {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 32px;
                }
                .rr-logo-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 56px;
                    height: 56px;
                    border-radius: 16px;
                    background: linear-gradient(135deg, #7c3aed, #4f46e5);
                    box-shadow: 0 0 24px rgba(124,58,237,0.5);
                }
                .rr-logo-svg { width: 28px; height: 28px; color: white; }
                .rr-title { font-size: 1.5rem; font-weight: 700; color: white; letter-spacing: -0.02em; }
                .rr-subtitle { font-size: 0.875rem; color: #94a3b8; }
                .rr-form { display: flex; flex-direction: column; gap: 18px; }
                .rr-error-banner {
                    padding: 10px 14px;
                    border-radius: 8px;
                    background: rgba(239,68,68,0.15);
                    border: 1px solid rgba(239,68,68,0.3);
                    color: #fca5a5;
                    font-size: 0.8rem;
                    text-align: center;
                }
                .rr-field { display: flex; flex-direction: column; gap: 6px; }
                .rr-label { font-size: 0.875rem; font-weight: 500; color: #e2e8f0; }
                .rr-input-wrap { position: relative; }
                .rr-input {
                    width: 100%;
                    padding: 11px 40px 11px 14px;
                    border-radius: 8px;
                    border: 1px solid rgba(148,163,184,0.15);
                    background: rgba(15,10,42,0.7);
                    color: #e2e8f0;
                    font-size: 0.9rem;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    box-sizing: border-box;
                    backdrop-filter: blur(4px);
                }
                .rr-input::placeholder { color: #475569; }
                .rr-input:focus {
                    border-color: #7c3aed;
                    box-shadow: 0 0 0 3px rgba(124,58,237,0.2);
                }
                .rr-input--error { border-color: rgba(239,68,68,0.5) !important; }
                .rr-input-icon {
                    position: absolute;
                    right: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #475569;
                    pointer-events: none;
                }
                .rr-field-error { font-size: 0.75rem; color: #fca5a5; }
                .rr-btn-signin {
                    width: 100%;
                    padding: 12px;
                    border-radius: 8px;
                    border: none;
                    background: linear-gradient(135deg, #7c3aed, #6d28d9);
                    color: white;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: opacity 0.2s, box-shadow 0.2s, transform 0.1s;
                    box-shadow: 0 4px 20px rgba(124,58,237,0.4);
                    margin-top: 4px;
                }
                .rr-btn-signin:hover:not(:disabled) {
                    opacity: 0.92;
                    box-shadow: 0 6px 28px rgba(124,58,237,0.55);
                    transform: translateY(-1px);
                }
                .rr-btn-signin:active:not(:disabled) { transform: translateY(0); }
                .rr-btn-signin:disabled { opacity: 0.6; cursor: not-allowed; }
                .rr-btn-spinner { animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .rr-disclaimer {
                    margin-top: 20px;
                    text-align: center;
                    font-size: 0.75rem;
                    color: #475569;
                }
                .rr-footer-links {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    margin-top: 12px;
                }
                .rr-footer-link {
                    font-size: 0.8rem;
                    color: #64748b;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 3px;
                    transition: color 0.2s;
                }
                .rr-footer-link:hover { color: #a78bfa; }
                .rr-footer-link--muted { cursor: default; }
                .rr-footer-link--muted:hover { color: #64748b; }
                .rr-footer-divider { color: #334155; font-size: 0.75rem; }
                .rr-footer-arrow { display: inline; }
                /* ── Shield Panel ── */
                .rr-shield-panel {
                    position: relative;
                    flex-shrink: 0;
                    width: 280px;
                    height: 320px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .rr-shield-glow {
                    position: absolute;
                    inset: -40px;
                    border-radius: 50%;
                    background: radial-gradient(ellipse, rgba(124,58,237,0.3) 0%, transparent 70%);
                    animation: rr-pulse-glow 3s ease-in-out infinite;
                }
                @keyframes rr-pulse-glow {
                    0%, 100% { opacity: 0.6; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.08); }
                }
                .rr-shield-svg {
                    width: 100%;
                    height: 100%;
                    filter: drop-shadow(0 0 20px rgba(124,58,237,0.6)) drop-shadow(0 0 60px rgba(96,165,250,0.2));
                    animation: rr-float 4s ease-in-out infinite;
                }
                @keyframes rr-float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                }
                @media (max-width: 640px) {
                    .rr-shield-panel { display: none; }
                    .rr-login-inner { justify-content: center; padding: 32px 20px; }
                    .rr-form-panel { max-width: 100%; }
                }
            `}</style>
        </div>
    )
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <AdminLoginPageContent />
        </Suspense>
    )
}
