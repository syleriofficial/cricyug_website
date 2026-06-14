import Link from "next/link"
import { Header, MobileNav } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { getDbTeam } from "@/lib/db/cricyug-db"

export const metadata = {
  title: "Team Profile | CricYug",
  description: "View cricket team profile details on CricYug.",
}

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const team = await getDbTeam(id)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <section className="mx-auto max-w-4xl px-4 py-10 lg:py-16">
          <Link href="/teams" className="text-sm text-primary hover:underline">Back to Teams</Link>
          <div className="mt-6 rounded-2xl border border-border bg-card p-6">
            {team ? (
              <>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-black text-primary">
                    {team.logo || team.flag ? (
                      <img src={team.logo || team.flag} alt={team.name} className="h-12 w-12 object-contain" />
                    ) : (
                      team.shortName
                    )}
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold">{team.name}</h1>
                    <p className="mt-2 text-muted-foreground">CricYug database team profile</p>
                  </div>
                </div>
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <Info label="Short Name" value={team.shortName} />
                  <Info label="Profile Type" value="Country Team" />
                  <Info label="Country Code" value={team.countryCode || team.id.toUpperCase()} />
                </div>
              </>
            ) : (
              <div>
                <h1 className="text-3xl font-bold">Team profile unavailable</h1>
                <p className="mt-3 text-muted-foreground">
                  This team has not been published in the CricYug database yet.
                </p>
              </div>
            )}
          </div>
          <Button asChild className="mt-8">
            <Link href="/teams">All teams</Link>
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
