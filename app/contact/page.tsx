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
          body: "Email the CricYug team at contact@cricyug.com for editorial, product and partnership messages.",
        },
        {
          title: "Editorial Notes",
          body: "If you want to publish a match preview, analysis piece or site announcement, add it to the manual news dataset or future editorial CMS.",
        },
      ]}
    />
  )
}
