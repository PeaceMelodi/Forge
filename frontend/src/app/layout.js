import { Geist_Mono, Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata = {
  title: 'Forge',
  description: 'Your Personal Command Hub',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} font-sans bg-[#080808] text-white min-h-screen overflow-x-hidden`}>
        {children}
      </body>
    </html>
  )
}