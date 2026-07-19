import { render,screen } from '@testing-library/react';
import { describe,expect,it,vi } from 'vitest';
import { AppShell } from './app-shell';
let path='/tickets';
vi.mock('next/navigation',()=>({usePathname:()=>path}));
describe('AppShell',()=>{it('renders Tickets navigation with active styling',()=>{render(<AppShell><p>Content</p></AppShell>);const tickets=screen.getByRole('link',{name:'Tickets'});expect(tickets).toHaveAttribute('href','/tickets');expect(tickets).toHaveClass('active');expect(screen.getByRole('link',{name:'People'})).toBeInTheDocument();expect(screen.getByRole('link',{name:'Today'})).toBeInTheDocument();});});
