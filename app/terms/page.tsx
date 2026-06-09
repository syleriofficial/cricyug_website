import { StaticPage } from "@/components/static-page"

export const metadata = {
  title: "Terms of Service | CricYug",
  description: "CricYug terms of service.",
}

export default function TermsPage() {
  return (
    <StaticPage
      title="Terms of Service"
      description="Basic terms for using CricYug."
      sections={[
        {
          title: "Informational Use",
          body: "CricYug match data, analysis and predictions are provided for informational and entertainment purposes only.",
        },
        {
          title: "Cricket Data",
          body: "Some match and series information may come from third-party cricket data providers and can change or be delayed.",
        },
      ]}
    />
  )
}
