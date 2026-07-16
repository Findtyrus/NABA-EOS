"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function InviteSignupForm({
  email,
  teamName,
  alreadyAccepted,
}: {
  email: string
  teamName: string | null
  alreadyAccepted: boolean
}) {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (!data.session) {
      setMessage("Check your email to confirm your account, then sign in.")
      setLoading(false)
      return
    }

    router.replace("/dashboard")
    router.refresh()
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">You&apos;re invited to NABA</CardTitle>
          <CardDescription>
            {alreadyAccepted
              ? "This invite has already been used. Sign in with your existing account."
              : teamName
                ? `Create your account to join the ${teamName} team.`
                : "Create your account to get started."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alreadyAccepted ? (
            <Button className="w-full" onClick={() => router.replace("/login")}>
              Go to sign in
            </Button>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} readOnly disabled />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {message && <p className="text-sm text-success">{message}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
