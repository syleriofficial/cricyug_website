import { StaticPage } from "@/components/static-page"

export const metadata = {
  title: "Contact CricYug",
  description: "Contact the CricYug team.",
}

export default function ContactPage() {
  return (
    <StaticPage
      title="Contact"
      description="Reach the CricYug team for editorial, partnership or product questions."
      sections={[
        {
          title: "Email",
          body: "For now, use your official CricYug contact email on this page once it is finalized. This placeholder keeps the production route live instead of sending users to a 404.",
        },
        {
          title: "Editorial Notes",
          body: "If you want to publish a match preview, analysis piece or site announcement, add it to the manual news dataset or future editorial CMS.",
        },
      ]}
    />
  )
}
