import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Mail } from "lucide-react"

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Logo and Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Image
                src="/images/trace-green-logo.png"
                alt="Trace Green"
                width={48}
                height={48}
                className="rounded-lg"
              />
              <h1 className="text-2xl font-bold text-primary">Trace Green</h1>
            </div>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Check Your Email</CardTitle>
              <CardDescription>We&apos;ve sent you a confirmation link to complete your registration</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Please check your email and click the confirmation link to activate your account. Once confirmed,
                you&apos;ll be able to start tracking your carbon footprint.
              </p>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Didn&apos;t receive the email? Check your spam folder or
                </p>
                <Button variant="outline" size="sm">
                  Resend confirmation email
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
