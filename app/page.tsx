import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Target, Trophy, Users } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect("/dashboard")

  return (
    <div className="min-h-screen relative flex flex-col">
      <div className="absolute inset-0 pointer-events-none [mask-image:linear-gradient(to_bottom,rgba(0,0,0,.9),rgba(0,0,0,.4),transparent)]">
        <div className="absolute inset-0 bg-[radial-gradient(at_20%_25%,rgba(110,200,60,0.25),transparent_60%),radial-gradient(at_80%_70%,rgba(80,160,70,0.22),transparent_65%)] dark:bg-[radial-gradient(at_25%_30%,rgba(110,200,60,0.15),transparent_60%),radial-gradient(at_75%_70%,rgba(80,160,70,0.15),transparent_65%)]" />
      </div>
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/trace-green-logo.png" alt="Trace Green" width={36} height={36} className="rounded-md" />
            <span className="text-xl font-semibold tracking-tight">Trace Green</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <Link href="#features" className="px-3 py-2 rounded-md text-foreground/70 hover:text-foreground hover:bg-muted/60 transition">Features</Link>
            <Link href="#how" className="px-3 py-2 rounded-md text-foreground/70 hover:text-foreground hover:bg-muted/60 transition">How It Works</Link>
            <Link href="#impact" className="px-3 py-2 rounded-md text-foreground/70 hover:text-foreground hover:bg-muted/60 transition">Impact</Link>
            <Link href="#pricing" className="px-3 py-2 rounded-md text-foreground/70 hover:text-foreground hover:bg-muted/60 transition">Pricing</Link>
            <Link href="/auth/login" className="px-3 py-2 rounded-md text-foreground/70 hover:text-foreground hover:bg-muted/60 transition">Login</Link>
            <Link href="/auth/sign-up" className="ml-2">
              <Button variant="brand" className="h-9 px-5">Get Started</Button>
            </Link>
          </nav>
          <div className="md:hidden">
            <Link href="/auth/sign-up">
              <Button size="sm" variant="brand" className="h-8 px-4">Join</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative min-h-[calc(100vh-4rem)] flex items-stretch">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:py-12 flex flex-col lg:flex-row gap-16 xl:gap-24 items-center w-full">
            <div className="w-full lg:w-[46%] flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-muted/70 px-3 py-1 text-xs font-medium ring-1 ring-border mb-6">
                <span className="h-2 w-2 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse" />
                Accelerate personal climate action
              </div>
              <h1 className="text-4xl sm:text-5xl font-semibold leading-tight tracking-tight mb-6">
                Measure today. Transform tomorrow.
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
                A precision platform to quantify, understand and reduce your daily carbon footprint while earning real rewards and joining a mission driven community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/sign-up"><Button size="lg" variant="brand" className="px-8">Start Free</Button></Link>
                <Link href="#features"><Button size="lg" variant="outline" className="px-8">Explore Features</Button></Link>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-6 max-w-md text-center">
                <div className="space-y-1"><p className="text-2xl font-semibold tracking-tight">50k+</p><p className="text-xs uppercase text-muted-foreground tracking-wide">Actions Logged</p></div>
                <div className="space-y-1"><p className="text-2xl font-semibold tracking-tight">2.3t</p><p className="text-xs uppercase text-muted-foreground tracking-wide">CO2e Reduced</p></div>
                <div className="space-y-1"><p className="text-2xl font-semibold tracking-tight">92%</p><p className="text-xs uppercase text-muted-foreground tracking-wide">Goal Adherence</p></div>
              </div>
            </div>
            <div className="w-full lg:w-[54%] flex justify-center lg:justify-end self-stretch items-center">
              <div className="relative w-[min(340px,42vw)] aspect-[9/19] max-h-[calc(100vh-8rem)] rounded-[2.1rem] border border-border/70 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.35)] bg-background/95 backdrop-blur-xl overflow-hidden ring-1 ring-primary/10">
                <div className="absolute inset-0 bg-[radial-gradient(at_80%_15%,rgba(110,200,90,0.18),transparent_60%),radial-gradient(at_20%_85%,rgba(90,170,90,0.15),transparent_60%)]" />
                <div className="absolute top-0 left-0 right-0 h-7 flex items-center justify-center"><div className="h-1.5 w-24 rounded-full bg-foreground/10" /></div>
                <div className="relative h-full flex flex-col pt-9 pb-5 px-5 gap-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center text-[11px] font-medium">TG</div>
                    <div className="flex flex-col leading-tight">
                      <p className="text-sm font-semibold">Good Morning!</p>
                      <p className="text-xs text-muted-foreground">Ready to lower impact?</p>
                    </div>
                  </div>
                  <div className="rounded-2xl p-4 bg-[linear-gradient(125deg,var(--primary),var(--accent))] text-primary-foreground relative overflow-hidden shadow-sm">
                    <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.9),transparent_60%)]" />
                    <p className="text-xs font-medium tracking-wide">Carbon Progress</p>
                    <p className="text-lg font-semibold mt-1">Level 3</p>
                    <div className="mt-4 flex items-end justify-between">
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold leading-none tracking-tight">127</span>
                        <span className="text-[11px] font-medium mt-1 opacity-90">actions</span>
                      </div>
                      <div className="text-right text-[11px] leading-tight opacity-95">
                        <p>This month</p>
                        <p>+18% vs last</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="h-28 rounded-xl bg-white/70 dark:bg-white/5 ring-1 ring-border/60 flex flex-col items-center justify-center gap-3 text-sm font-medium shadow-sm backdrop-blur-sm transition active:scale-[.98]">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/15 to-accent/20 flex items-center justify-center"><Leaf className="w-4 h-4 text-primary"/></div>
                      Track Now
                    </button>
                    <button className="h-28 rounded-xl bg-white/70 dark:bg-white/5 ring-1 ring-border/60 flex flex-col items-center justify-center gap-3 text-sm font-medium shadow-sm backdrop-blur-sm transition active:scale-[.98]">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/15 to-accent/20 flex items-center justify-center"><Target className="w-4 h-4 text-primary"/></div>
                      Set Goal
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="text-xs font-medium text-muted-foreground tracking-wide px-1">Recent Activity</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 rounded-xl ring-1 ring-border/60 bg-white/70 dark:bg-white/5 px-3 py-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center"><Leaf className="w-4 h-4 text-primary"/></div>
                        <div className="flex-1">
                          <p className="text-sm leading-tight">Cycling Commute</p>
                          <p className="text-[11px] text-muted-foreground">2 hours ago</p>
                        </div>
                        <span className="text-[11px] px-2 py-1 rounded-full bg-primary/15 text-primary">Excellent</span>
                      </div>
                      <div className="flex items-center gap-3 rounded-xl ring-1 ring-border/60 bg-white/70 dark:bg-white/5 px-3 py-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center"><Target className="w-4 h-4 text-primary"/></div>
                        <div className="flex-1">
                          <p className="text-sm leading-tight">Plant-Based Meal</p>
                          <p className="text-[11px] text-muted-foreground">1 day ago</p>
                        </div>
                        <span className="text-[11px] px-2 py-1 rounded-full bg-accent/15 text-foreground/80">Good</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 mt-auto">
                    <span className="text-foreground font-medium">Home</span>
                    <span className="text-muted-foreground">Track</span>
                    <span className="text-muted-foreground">Rewards</span>
                    <span className="text-muted-foreground">Profile</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="impact" className="py-12 border-y bg-background/60 backdrop-blur">
          <div className="mx-auto max-w-7xl px-6 grid gap-8 sm:grid-cols-3">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">1</div>
              <div><p className="font-medium">Log actions</p><p className="text-sm text-muted-foreground">Transport, energy, food, lifestyle</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">2</div>
              <div><p className="font-medium">Get insights</p><p className="text-sm text-muted-foreground">AI guidance & benchmarks</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">3</div>
              <div><p className="font-medium">Earn rewards</p><p className="text-sm text-muted-foreground">Badges, points & perks</p></div>
            </div>
          </div>
        </section>
        <section id="features" className="py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-2xl mb-14">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">Everything you need to drive personal climate impact</h2>
              <p className="text-muted-foreground leading-relaxed">An integrated toolkit combining measurement accuracy, behavioral science and meaningful incentives to turn intent into lasting sustainable habits.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <Card className="relative group">
                <CardHeader className="pb-3">
                  <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center mb-3"><Leaf className="w-5 h-5 text-primary"/></div>
                  <CardTitle className="text-base">Unified Tracking</CardTitle>
                  <CardDescription>Log mobility, energy, food and lifestyle in seconds with adaptive inputs.</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 text-xs text-muted-foreground">Real time factors and localized emission data ensure credible results.</CardContent>
              </Card>
              <Card className="relative group">
                <CardHeader className="pb-3">
                  <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center mb-3"><Target className="w-5 h-5 text-primary"/></div>
                  <CardTitle className="text-base">Adaptive Goals</CardTitle>
                  <CardDescription>Dynamic reduction targets that scale with your progress.</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 text-xs text-muted-foreground">Science aligned pathways that stay motivating not overwhelming.</CardContent>
              </Card>
              <Card className="relative group">
                <CardHeader className="pb-3">
                  <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center mb-3"><Trophy className="w-5 h-5 text-primary"/></div>
                  <CardTitle className="text-base">Reward Economy</CardTitle>
                  <CardDescription>Earn points, unlock tiers and redeem curated sustainable perks.</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 text-xs text-muted-foreground">Meaningful incentives reinforcing positive habit loops.</CardContent>
              </Card>
              <Card className="relative group">
                <CardHeader className="pb-3">
                  <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center mb-3"><Users className="w-5 h-5 text-primary"/></div>
                  <CardTitle className="text-base">Collective Momentum</CardTitle>
                  <CardDescription>Community challenges, leaderboards and shared pledges.</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 text-xs text-muted-foreground">Social accountability multiplies individual impact.</CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section id="how" className="py-24 bg-muted/40 border-y">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-12 text-center">Progress you can feel in weeks</h2>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center font-medium mb-4">01</div>
                <p className="font-medium mb-2">Establish Baseline</p>
                <p className="text-sm text-muted-foreground leading-relaxed">Connect habits and log a week of activity to generate your personalized emissions fingerprint.</p>
              </div>
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center font-medium mb-4">02</div>
                <p className="font-medium mb-2">Optimize Habits</p>
                <p className="text-sm text-muted-foreground leading-relaxed">Receive prioritized reduction suggestions ranked by impact, cost and feasibility.</p>
              </div>
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center font-medium mb-4">03</div>
                <p className="font-medium mb-2">Compound Impact</p>
                <p className="text-sm text-muted-foreground leading-relaxed">Sustain momentum via rewards, streaks and community accountability.</p>
              </div>
            </div>
          </div>
        </section>
        <section className="py-28">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-6">Ready to act on your climate intent</h2>
            <p className="text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">Turn scattered sustainable choices into a cohesive personal climate strategy. Start free in under a minute and see measurable progress in your first week.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/sign-up"><Button size="lg" variant="brand" className="px-10">Create Your Account</Button></Link>
              <Link href="#features"><Button size="lg" variant="outline" className="px-10">View Features</Button></Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-10 text-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-2">
              <Image src="/images/trace-green-logo.png" alt="Trace Green" width={28} height={28} className="rounded" />
              <span className="font-medium">Trace Green</span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-muted-foreground">
              <Link href="#features" className="hover:text-foreground transition">Features</Link>
              <Link href="#how" className="hover:text-foreground transition">How It Works</Link>
              <Link href="#impact" className="hover:text-foreground transition">Impact</Link>
              <Link href="#pricing" className="hover:text-foreground transition">Pricing</Link>
              <Link href="/auth/login" className="hover:text-foreground transition">Login</Link>
            </div>
            <p className="text-muted-foreground">© 2024 Trace Green</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
