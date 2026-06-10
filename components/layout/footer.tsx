import Link from "next/link"
export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12 hidden lg:block">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">C</span>
              </div>
              <span className="text-xl font-bold text-gradient-brand">CricYug</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              AI-powered cricket platform with live scores, predictions, and comprehensive coverage.
            </p>
            <p className="text-xs text-muted-foreground">Contact: contact@cricyug.com</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <FooterLink href="/live">Live Scores</FooterLink>
              <FooterLink href="/matches">Matches</FooterLink>
              <FooterLink href="/news">News</FooterLink>
              <FooterLink href="/predictions">AI Predictions</FooterLink>
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold mb-4">Explore</h4>
            <ul className="space-y-2">
              <FooterLink href="/players">Players</FooterLink>
              <FooterLink href="/teams">Teams</FooterLink>
              <FooterLink href="/series">Series</FooterLink>
              <FooterLink href="/points-table">Points Table</FooterLink>
            </ul>
          </div>

          {/* Formats */}
          <div>
            <h4 className="font-semibold mb-4">Formats</h4>
            <ul className="space-y-2">
              <FooterLink href="/matches?format=test">Test Cricket</FooterLink>
              <FooterLink href="/matches?format=odi">ODI</FooterLink>
              <FooterLink href="/matches?format=t20">T20</FooterLink>
              <FooterLink href="/series">Tournaments</FooterLink>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CricYug. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with AI-powered insights for cricket lovers worldwide.
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {children}
      </Link>
    </li>
  )
}
