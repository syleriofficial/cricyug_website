/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), payment=()" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://pagead2.googlesyndication.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://g.cricapi.com https://h.cricapi.com https://cdorg.b-cdn.net https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net; connect-src 'self' https://vitals.vercel-insights.com https://pagead2.googlesyndication.com; frame-src 'self' https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com; font-src 'self' data:; frame-ancestors 'self'; base-uri 'self'; form-action 'self'",
          },
        ],
      },
    ]
  },
}

export default nextConfig
