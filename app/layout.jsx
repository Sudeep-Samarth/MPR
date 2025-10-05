import "./globals.css"
import { Providers } from "@/components/providers"

export const metadata = {
  title: "NewGen Fitness - Premium Fitness Equipment & Supplements",
  description: "Your one-stop shop for fitness equipment, supplements, and accessories",
    generator: 'v0.app'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
