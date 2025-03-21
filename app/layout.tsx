import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fixture Creator',
  description: 'Una pagina web para crear tus fixtures',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="./deporte-img.jpg" />
      </head>
      <body>{children}</body>
    </html>
  )
}
