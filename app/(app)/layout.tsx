import { Protected } from '@/components/auth/guards';import { AppShell } from '@/components/app-shell/app-shell';
export default function Layout({children}:{children:React.ReactNode}){return <Protected><AppShell>{children}</AppShell></Protected>}
