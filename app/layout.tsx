import type { Metadata } from 'next';import './globals.css';import { SessionProvider } from '@/features/auth/session-provider';
export const metadata:Metadata={title:'Lead Log',description:'Private work memory'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><SessionProvider>{children}</SessionProvider></body></html>}
