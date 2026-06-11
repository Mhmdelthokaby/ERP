"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authClient } from "@/lib/auth/client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError("Please fill all fields"); return }
    setLoading(true)
    setError("")
    const { error: err } = await authClient.signIn.email({ email, password })
    if (err) {
      setError(err.message || err.statusText || "Invalid credentials")
      setLoading(false)
    } else {
      router.push("/")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accentDim flex items-center justify-center mx-auto mb-3">
            <i className="fa-solid fa-truck-fast text-bg"></i>
          </div>
          <h1 className="font-display text-2xl font-bold text-fg">TransERP</h1>
          <p className="text-muted text-sm mt-1">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-dangerDim border border-danger/30 text-danger text-xs rounded-lg px-3 py-2">{error}</div>
          )}
          <div>
            <label className="text-xs text-muted mb-1 block">Email</label>
            <input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Password</label>
            <input type="password" placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 rounded-lg text-sm disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <p className="text-xs text-muted text-center">
            Don&apos;t have an account? <Link href="/register" className="text-accent hover:underline">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
