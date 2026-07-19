import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SessionProvider, useSession } from './session-provider';

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }) }));

function data(email = 'a@b.com') {
  return { user: { email, timezone: 'UTC', response_language: 'en' }, telegram: { connected: false, linked_at: null } };
}
function ok(body = data()) {
  return new Response(JSON.stringify({ data: body }), { status: 200 });
}
function Probe({ onRefreshIdentity }: { onRefreshIdentity?: (fn: () => Promise<void>) => void }) {
  const s = useSession();
  onRefreshIdentity?.(s.refreshSession);
  return <div><p>{s.status}</p><p>refreshing:{String(s.isRefreshing)}</p><p>{s.session?.user.email}</p><button onClick={s.refreshSession}>refresh</button><button onClick={() => { void s.refreshSession(); void s.refreshSession(); }}>double</button><button onClick={s.logout}>logout</button></div>;
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.useRealTimers();
});

it('loads authenticated and refreshes without storage', async () => {
  global.fetch = vi.fn().mockResolvedValue(ok()) as typeof fetch;
  render(<SessionProvider><Probe /></SessionProvider>);
  expect(screen.getByText('loading')).toBeInTheDocument();
  await screen.findByText('authenticated');
  await userEvent.click(screen.getByText('refresh'));
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  expect(localStorage.length).toBe(0);
  expect(sessionStorage.length).toBe(0);
});

it('treats 401 as unauthenticated and network as error during bootstrap', async () => {
  global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { code: 'unauthorized', message: 'no', request_id: 'r' } }), { status: 401 })) as typeof fetch;
  render(<SessionProvider><Probe /></SessionProvider>);
  await screen.findByText('unauthenticated');
});

it('logout calls backend and clears state', async () => {
  global.fetch = vi.fn().mockResolvedValueOnce(ok()).mockResolvedValueOnce(new Response(null, { status: 204 })) as typeof fetch;
  render(<SessionProvider><Probe /></SessionProvider>);
  await screen.findByText('authenticated');
  await userEvent.click(screen.getByText('logout'));
  await screen.findByText('unauthenticated');
});

it('background refresh preserves authenticated status and toggles isRefreshing', async () => {
  let resolveRefresh: (value: Response) => void = () => undefined;
  global.fetch = vi.fn()
    .mockResolvedValueOnce(ok())
    .mockImplementationOnce(() => new Promise<Response>((resolve) => { resolveRefresh = resolve; })) as typeof fetch;

  render(<SessionProvider><Probe /></SessionProvider>);
  await screen.findByText('authenticated');
  await userEvent.click(screen.getByText('refresh'));
  expect(screen.getByText('authenticated')).toBeInTheDocument();
  expect(screen.getByText('refreshing:true')).toBeInTheDocument();
  await act(async () => { resolveRefresh(ok(data('new@b.com'))); });
  await screen.findByText('new@b.com');
  expect(screen.getByText('refreshing:false')).toBeInTheDocument();
});

it('keeps existing session on temporary background refresh failure', async () => {
  global.fetch = vi.fn()
    .mockResolvedValueOnce(ok())
    .mockRejectedValueOnce(new Error('network')) as typeof fetch;

  render(<SessionProvider><Probe /></SessionProvider>);
  await screen.findByText('authenticated');
  await userEvent.click(screen.getByText('refresh'));
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  expect(screen.getByText('authenticated')).toBeInTheDocument();
  expect(screen.getByText('a@b.com')).toBeInTheDocument();
});

it('refreshSession identity remains stable across session changes and concurrent refreshes are deduplicated', async () => {
  const identities: Array<() => Promise<void>> = [];
  let resolveRefresh: (value: Response) => void = () => undefined;
  global.fetch = vi.fn()
    .mockResolvedValueOnce(ok())
    .mockImplementationOnce(() => new Promise<Response>((resolve) => { resolveRefresh = resolve; })) as typeof fetch;

  render(<SessionProvider><Probe onRefreshIdentity={(fn) => identities.push(fn)} /></SessionProvider>);
  await screen.findByText('authenticated');
  const first = identities.at(-1);
  await userEvent.click(screen.getByText('double'));
  expect(fetch).toHaveBeenCalledTimes(2);
  await act(async () => { resolveRefresh(ok(data('changed@b.com'))); });
  await screen.findByText('changed@b.com');
  expect(identities.at(-1)).toBe(first);
});
