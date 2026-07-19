import { render,screen } from '@testing-library/react';
import { describe,expect,it,vi } from 'vitest';
import { AppShell } from './app-shell';
let path='/people';
vi.mock('next/navigation',()=>({usePathname:()=>path}));
describe('AppShell',()=>{it('renders People navigation with active styling',()=>{render(<AppShell><p>Content</p></AppShell>);const people=screen.getByRole('link',{name:'People'});expect(people).toHaveAttribute('href','/people');expect(people).toHaveClass('active');expect(screen.getByRole('link',{name:'Today'})).toBeInTheDocument();});});
