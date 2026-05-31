"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  User, 
  Settings, 
  Bell, 
  Bookmark, 
  Heart, 
  Trophy, 
  Calendar,
  ChevronRight,
  LogOut,
  Moon,
  Globe,
  Shield,
  Smartphone
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const tabs = ["Overview", "Favorites", "Settings"]

const favoriteTeams = [
  { name: "India", shortName: "IND", type: "International" },
  { name: "Mumbai Indians", shortName: "MI", type: "IPL" },
  { name: "Chennai Super Kings", shortName: "CSK", type: "IPL" },
]

const favoritePlayers = [
  { name: "Virat Kohli", team: "India", role: "Batsman" },
  { name: "Jasprit Bumrah", team: "India", role: "Bowler" },
  { name: "MS Dhoni", team: "CSK", role: "Wicketkeeper" },
]

const recentActivity = [
  { type: "match", title: "IND vs AUS - 3rd T20", time: "2 hours ago" },
  { type: "prediction", title: "Predicted MI to win vs CSK", time: "Yesterday" },
  { type: "bookmark", title: "Saved: IPL Points Table", time: "2 days ago" },
  { type: "news", title: "Read: Kohli breaks record", time: "3 days ago" },
]

const settingsOptions = [
  { icon: Bell, label: "Notifications", description: "Match alerts and updates", href: "#" },
  { icon: Moon, label: "Appearance", description: "Dark mode enabled", href: "#" },
  { icon: Globe, label: "Language", description: "English (US)", href: "#" },
  { icon: Shield, label: "Privacy", description: "Manage your data", href: "#" },
  { icon: Smartphone, label: "Devices", description: "Manage connected devices", href: "#" },
]

export function ProfilePageContent() {
  const [activeTab, setActiveTab] = useState("Overview")

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-card to-accent/10 border border-primary/20 p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 border-2 border-primary">
            <User className="h-10 w-10 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">Cricket Fan</h1>
            <p className="text-muted-foreground mb-3">cricket.fan@email.com</p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Joined March 2024
              </span>
              <span className="flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-accent" />
                Premium Member
              </span>
            </div>
          </div>
          <Button variant="outline" className="border-border hover:bg-muted">
            <Settings className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatBox icon={Heart} label="Favorite Teams" value="3" />
        <StatBox icon={User} label="Favorite Players" value="12" />
        <StatBox icon={Bookmark} label="Saved Items" value="28" />
        <StatBox icon={Trophy} label="Predictions Made" value="156" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-3 text-sm font-medium relative transition-colors",
              activeTab === tab
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="profile-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "Overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    {activity.type === "match" && <Trophy className="h-5 w-5 text-primary" />}
                    {activity.type === "prediction" && <Trophy className="h-5 w-5 text-accent" />}
                    {activity.type === "bookmark" && <Bookmark className="h-5 w-5 text-primary" />}
                    {activity.type === "news" && <Calendar className="h-5 w-5 text-primary" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              ))}
            </div>
          </section>

          {/* Quick Links */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <QuickLink href="/live" icon={Trophy} label="Live Matches" />
              <QuickLink href="/predictions" icon={Trophy} label="My Predictions" />
              <QuickLink href="/news" icon={Calendar} label="Latest News" />
              <QuickLink href="/series" icon={Calendar} label="Upcoming Series" />
            </div>
          </section>
        </div>
      )}

      {activeTab === "Favorites" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Favorite Teams */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Favorite Teams</h2>
            <div className="space-y-3">
              {favoriteTeams.map((team, index) => (
                <motion.div
                  key={team.shortName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                      {team.shortName}
                    </div>
                    <div>
                      <p className="font-medium">{team.name}</p>
                      <p className="text-sm text-muted-foreground">{team.type}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Heart className="h-5 w-5 text-live fill-live" />
                  </Button>
                </motion.div>
              ))}
              <Button variant="outline" className="w-full border-dashed">
                + Add Team
              </Button>
            </div>
          </section>

          {/* Favorite Players */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Favorite Players</h2>
            <div className="space-y-3">
              {favoritePlayers.map((player, index) => (
                <motion.div
                  key={player.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                      <User className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium">{player.name}</p>
                      <p className="text-sm text-muted-foreground">{player.team} - {player.role}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Heart className="h-5 w-5 text-live fill-live" />
                  </Button>
                </motion.div>
              ))}
              <Button variant="outline" className="w-full border-dashed">
                + Add Player
              </Button>
            </div>
          </section>
        </div>
      )}

      {activeTab === "Settings" && (
        <div className="max-w-2xl">
          <div className="space-y-2">
            {settingsOptions.map((option, index) => (
              <motion.div
                key={option.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={option.href}
                  className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <option.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function StatBox({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="p-4 rounded-xl bg-card border border-border text-center">
      <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function QuickLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <span className="font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
    </Link>
  )
}
