import { StaticPage } from "@/components/static-page"

export const metadata = {
  title: "About CricYug",
  description: "Learn about CricYug and its cricket coverage.",
}

export default function AboutPage() {
  return (
    <StaticPage
      title="About CricYug"
      description="CricYug is a modern cricket hub for scores, fixtures, rankings, points tables and manually curated cricket stories."
      sections={[
        {
          title: "What We Cover",
          body: "We bring live and recent match data, match center pages, player and team discovery, series tracking, points tables and editorial cricket analysis into one clean experience.",
        },
        {
          title: "Editorial Approach",
          body: "CricYug news is written and curated manually, so stories can reflect your voice, priorities and cricket judgment instead of generic automated feeds.",
        },
      ]}
    />
  )
}
