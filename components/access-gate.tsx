"use client"

import { useState } from "react"

interface AccessGateProps {
  children: React.ReactNode
  labels: {
    title: string
    password_placeholder: string
    submit: string
    error: string
  }
}

export function AccessGate({ children, labels }: AccessGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const correctPassword = process.env.NEXT_PUBLIC_BETA_PASSWORD ?? "2002"
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
          <h1 className="text-2xl font-light tracking-widest uppercase text-zinc-400">{labels.title}</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={labels.password_placeholder}
            className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-center tracking-widest focus:outline-none focus:border-cyan-500 transition-colors"
            autoFocus
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-white text-black font-bold uppercase tracking-widest rounded-md hover:bg-zinc-200 transition-colors"
          >
            {labels.submit}
          </button>
          {error && <p className="text-red-500 text-xs tracking-widest uppercase animate-pulse">{labels.error}</p>}
        </form>
      </div>
    )
  }

  return <>{children}</>
}
