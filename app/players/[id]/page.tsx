import Link from "next/link"
import { Header, MobileNav } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { demoPlayers } from "@/lib/demo-data"

export const metadata = {
  title: "Player Profile | CricYug",
  description: "View cricket player profile details on CricYug.",
}

export default async function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const player = demoPlayers.find((item) => item.id === id) || demoPlayers[0]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <section className="mx-auto max-w-4xl px-4 py-10 lg:py-16">
          <Link href="/players" className="text-sm text-primary hover:underline">Back to Players</Link>
          <div className="mt-6 rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-black text-primary">
                {player.shortName.slice(0, 2)}
              </div>
              <div>
                <h1 className="text-4xl font-bold">{player.name}</h1>
                <p className="mt-2 text-muted-foreground">{player.country} • {player.role}</p>
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Info label="Batting" value={player.battingStyle || "Profile update pending"} />
              <Info label="Bowling" value={player.bowlingStyle || "Profile update pending"} />
              <Info label="Country Code" value={player.countryCode} />
              <Info label="Data Status" value="Manual profile" />
            </div>
          </div>
          <Button asChild className="mt-8">
            <Link href="/players">All players</Link>
          </Button>
        </section>
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/35 p-4">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  )
}
