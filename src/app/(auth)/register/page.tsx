"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authClient } from "@/lib/auth/client"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password || password.length < 8) {
      setError("Please fill all fields (password min 8 characters)")
      return
    }
    setLoading(true)
    setError("")
    const { error: err } = await authClient.signUp.email({ name, email, password })
    if (err) {
      setError(err.message || err.statusText || "Registration failed")
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
          <p className="text-muted text-sm mt-1">Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-dangerDim border border-danger/30 text-danger text-xs rounded-lg px-3 py-2">{error}</div>
          )}
          <div>
            <label className="text-xs text-muted mb-1 block">Full Name</label>
            <input type="text" placeholder="Ahmed Mohamed" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Email</label>
            <input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Password</label>
            <input type="password" placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 rounded-lg text-sm disabled:opacity-50">
            {loading ? "Creating account..." : "Create Account"}
          </button>
          <p className="text-xs text-muted text-center">
            Already have an account? <Link href="/login" className="text-accent hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
