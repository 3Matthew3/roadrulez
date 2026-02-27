"use client"

import { useState } from "react"

interface AccessGateProps {
  children: React.ReactNode
}

export function AccessGate({ children }: AccessGateProps) {
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

  return <>{children}</>
}
