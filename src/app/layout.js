import { Inter } from 'next/font/google'
import './globals.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { SocketProvider } from './context/SocketContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Freshs.pk – Online Grocery Store | Farm-Fresh Quality Delivered',
  description: `Freshs.pk – Your one-stop online grocery store, delivering farm-fresh quality, unbeatable convenience, and savings right to your doorstep!`,
  icons: {
    icon: [{ url: '/logo.png', type: 'image/png' }],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SocketProvider>
          {children}
        </SocketProvider>
          <ToastContainer />
      </body>
    </html>
  )
}
