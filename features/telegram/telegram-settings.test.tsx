import { render, screen, waitFor, act, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TelegramSettings } from './telegram-settings';

const refreshSession = vi.fn(() => Promise.resolve());
vi.mock('@/features/auth/session-provider', () => ({ useSession: () => ({ refreshSession }) }));

const ok = (data: unknown) => Promise.resolve(new Response(JSON.stringify({ data }), { status: 200 }));
const statusResponse = (connected: boolean) => ok({ connected, linked_at: connected ? '2026-07-19T12:00:00Z' : null });
const linkResponse = (expires_at = new Date(Date.now() + 60_000).toISOString()) => ok({ url: 'https://t.me/leadlogbot?start=abc', expires_at });
const statusCalls = () => (fetch as ReturnType<typeof vi.fn>).mock.calls.filter(([url]) => String(url).includes('/integrations/telegram/status'));
const sessionCalls = () => (fetch as ReturnType<typeof vi.fn>).mock.calls.filter(([url]) => String(url).includes('/auth/session'));
const linkCalls = () => (fetch as ReturnType<typeof vi.fn>).mock.calls.filter(([, init]) => init?.method === 'POST');
const deleteCalls = () => (fetch as ReturnType<typeof vi.fn>).mock.calls.filter(([, init]) => init?.method === 'DELETE');

beforeEach(() => {
  vi.useRealTimers();
  refreshSession.mockClear();
  global.fetch = vi.fn() as typeof fetch;
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('TelegramSettings', () => {
  it('loads an already connected account once without polling or session refresh', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockImplementation(() => statusResponse(true));
    const { rerender } = render(<TelegramSettings />);

    expect(await screen.findByText('Telegram connected')).toBeInTheDocument();
    expect(screen.queryByText(/Restoring your session/)).toBeNull();
    expect(statusCalls()).toHaveLength(1);
    expect(refreshSession).not.toHaveBeenCalled();

    rerender(<TelegramSettings />);
    expect(statusCalls()).toHaveLength(1);
    expect(sessionCalls()).toHaveLength(0);
    expect(refreshSession).not.toHaveBeenCalled();
  });

  it('loads a disconnected account once without polling or session refresh', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockImplementation(() => statusResponse(false));
    render(<TelegramSettings />);

    expect(await screen.findByText('Telegram is not connected.')).toBeInTheDocument();
    expect(statusCalls()).toHaveLength(1);
    expect(refreshSession).not.toHaveBeenCalled();
  });

  it('polls only after link generation and refreshes once after a connected transition', async () => {
    (fetch as ReturnType<typeof vi.fn>)
      .mockImplementationOnce(() => statusResponse(false))
      .mockImplementationOnce(() => linkResponse())
      .mockImplementationOnce(() => statusResponse(false))
      .mockImplementationOnce(() => statusResponse(true));

    render(<TelegramSettings />);
    expect(await screen.findByText('Telegram is not connected.')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Connect Telegram'));
    expect(await screen.findByText('Open Telegram')).toBeInTheDocument();
    expect(linkCalls()).toHaveLength(1);

    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 2600)); });
    await waitFor(() => expect(statusCalls()).toHaveLength(2));
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 2600)); });
    await waitFor(() => expect(screen.getByText('Telegram connected')).toBeInTheDocument());
    expect(statusCalls()).toHaveLength(3);
    expect(refreshSession).toHaveBeenCalledTimes(1);

    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 3000)); });
    expect(statusCalls()).toHaveLength(3);
  });

  it('stops polling when the generated link expires and on unmount', async () => {
    (fetch as ReturnType<typeof vi.fn>)
      .mockImplementationOnce(() => statusResponse(false))
      .mockImplementationOnce(() => linkResponse(new Date(Date.now() + 3000).toISOString()))
      .mockImplementation(() => statusResponse(false));

    const { unmount } = render(<TelegramSettings />);
    expect(await screen.findByText('Telegram is not connected.')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Connect Telegram'));
    await screen.findByText('Open Telegram');
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 2600)); });
    await waitFor(() => expect(statusCalls()).toHaveLength(2));
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 3500)); });
    expect(statusCalls()).toHaveLength(2);
    unmount();
    expect(statusCalls()).toHaveLength(2);
  });

  it('disconnects locally and refreshes at most once without starting polling', async () => {
    (fetch as ReturnType<typeof vi.fn>)
      .mockImplementationOnce(() => statusResponse(true))
      .mockImplementationOnce(() => Promise.resolve(new Response(null, { status: 204 })));

    render(<TelegramSettings />);
    expect(await screen.findByText('Telegram connected')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Disconnect Telegram'));
    await userEvent.click(screen.getByRole('button', { name: 'Disconnect' }));

    expect(await screen.findByText('Telegram is not connected.')).toBeInTheDocument();
    expect(deleteCalls()).toHaveLength(1);
    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(statusCalls()).toHaveLength(1);
  });

  it('shows local retry UI for failed initial status without automatic retries or logout', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue(new Response(JSON.stringify({ error: { code: 'internal_error', message: 'down' } }), { status: 500 }));
    render(<TelegramSettings />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not check Telegram connection. Try again.');
    expect(screen.getByText('Retry')).toBeInTheDocument();
    expect(refreshSession).not.toHaveBeenCalled();
    expect(statusCalls()).toHaveLength(1);
  });
});
