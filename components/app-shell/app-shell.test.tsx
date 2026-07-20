import { render,screen } from '@testing-library/react';
import { describe,expect,it,vi } from 'vitest';
import { AppShell } from './app-shell';
let path='/tickets';
vi.mock('next/navigation',()=>({usePathname:()=>path}));
describe('AppShell',()=>{it('renders Tickets navigation with active styling',()=>{render(<AppShell><p>Content</p></AppShell>);const ask=screen.getByRole('link',{name:'Ask'});expect(ask).toHaveAttribute('href','/ask');const tickets=screen.getByRole('link',{name:'Tickets'});expect(tickets).toHaveAttribute('href','/tickets');expect(tickets).toHaveClass('active');const actions=screen.getByRole('link',{name:'Actions'});expect(actions).toHaveAttribute('href','/actions');expect(screen.queryByText(/later/)).not.toBeInTheDocument();expect(screen.getByRole('link',{name:'People'})).toBeInTheDocument();expect(screen.getByRole('link',{name:'Today'})).toBeInTheDocument();});});

it('marks Actions active',()=>{path='/actions';render(<AppShell><p>Content</p></AppShell>);expect(screen.getByRole('link',{name:'Actions'})).toHaveClass('active');});

it('marks Ask active',()=>{path='/ask';render(<AppShell><p>Content</p></AppShell>);expect(screen.getByRole('link',{name:'Ask'})).toHaveClass('active');});
