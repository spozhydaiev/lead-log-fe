import { render,screen } from '@testing-library/react';import { describe,it,expect,vi } from 'vitest';import { Protected,PublicOnly } from './guards';
let status='loading';const replace=vi.fn();vi.mock('next/navigation',()=>({useRouter:()=>({replace}),usePathname:()=>'/login'}));vi.mock('@/features/auth/session-provider',()=>({useSession:()=>({status,error:null,refreshSession:vi.fn()})}));
it('does not flash protected content while loading',()=>{status='loading';render(<Protected><p>secret</p></Protected>);expect(screen.queryByText('secret')).toBeNull();expect(screen.getByText(/Restoring/)).toBeInTheDocument()});
it('allows authenticated protected content',()=>{status='authenticated';render(<Protected><p>Today content</p></Protected>);expect(screen.getByText('Today content')).toBeInTheDocument()});
it('redirects authenticated users away from auth routes',()=>{status='authenticated';render(<PublicOnly><p>login</p></PublicOnly>);expect(screen.queryByText('login')).toBeNull()});
