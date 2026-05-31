import type { Metadata } from "next"
import { ProfilePageContent } from "@/components/profile/profile-page-content"

export const metadata: Metadata = {
  title: "Your Profile | CricYug",
  description: "Manage your CricYug profile, preferences, and saved content.",
}

export default function ProfilePage() {
  return (
    <main className="min-h-screen pb-20 lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <ProfilePageContent />
      </div>
    </main>
  )
}
