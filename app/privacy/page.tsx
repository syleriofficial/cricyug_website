import { StaticPage } from "@/components/static-page"

export const metadata = {
  title: "Privacy Policy | CricYug",
  description: "CricYug privacy policy.",
}

export default function PrivacyPage() {
  return (
    <StaticPage
      title="Privacy Policy"
      description="A simple privacy overview for CricYug users."
      sections={[
        {
          title: "Data We Use",
          body: "CricYug displays cricket data, editorial content and basic product interactions. If analytics or accounts are enabled later, this policy should be updated before launch.",
        },
        {
          title: "User Accounts",
          body: "Profile features are currently product placeholders. Do not enter sensitive personal information until a real authentication and privacy workflow is added.",
        },
      ]}
    />
  )
}
