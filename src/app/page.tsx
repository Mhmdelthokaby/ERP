import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Transportation & Tourism ERP</h1>
      <p className="mt-2 text-muted-foreground">v1.0</p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/login"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Sign In
        </Link>
      </div>
    </main>
  )
}
