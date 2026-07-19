'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiRequestError } from '@/lib/api/client';
import { api } from '@/lib/api/endpoints';
import { useSession } from '@/features/auth/session-provider';
import type { TelegramLink, TelegramStatus } from '@/lib/api/types';
import { formatDateTime } from '@/lib/formatting/date';

const POLL_INTERVAL_MS = 2500;
const MAX_POLL_TICKS = 80;

type StatusRequestMode = 'initial' | 'manual' | 'poll';

export function TelegramSettings() {
  const [telegramStatus, setTelegramStatus] = useState<TelegramStatus | null>(null);
  const [activeLink, setActiveLink] = useState<TelegramLink | null>(null);
  const [isLoadingTelegramStatus, setIsLoadingTelegramStatus] = useState(true);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const mountedRef = useRef(false);
  const initialLoadedRef = useRef(false);
  const statusInFlightRef = useRef(false);
  const generationRef = useRef(0);
  const pollAbortRef = useRef<AbortController | null>(null);
  const { refreshSession } = useSession();

  const loadTelegramStatus = useCallback(async (mode: StatusRequestMode = 'manual', signal?: AbortSignal) => {
    if (statusInFlightRef.current) return null;
    statusInFlightRef.current = true;
    if (mode !== 'poll') setError('');
    if (mode === 'initial') setIsLoadingTelegramStatus(true);
    try {
      const next = await api.telegramStatus(signal);
      if (!mountedRef.current || signal?.aborted) return null;
      setTelegramStatus(next);
      return next;
    } catch (e) {
      if (signal?.aborted) return null;
      if (!mountedRef.current) return null;
      setError(e instanceof ApiRequestError && e.safe.kind === 'unauthorized' ? e.safe.message : 'Could not check Telegram connection. Try again.');
      return null;
    } finally {
      statusInFlightRef.current = false;
      if (mountedRef.current && mode === 'initial') setIsLoadingTelegramStatus(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const controller = new AbortController();
    if (!initialLoadedRef.current) {
      initialLoadedRef.current = true;
      void loadTelegramStatus('initial', controller.signal);
    }
    return () => {
      mountedRef.current = false;
      controller.abort();
      pollAbortRef.current?.abort();
    };
  }, [loadTelegramStatus]);

  const stopPolling = useCallback(() => {
    generationRef.current += 1;
    pollAbortRef.current?.abort();
    pollAbortRef.current = null;
    setIsPolling(false);
  }, []);

  async function generate() {
    if (isGeneratingLink || isDisconnecting) return;
    stopPolling();
    setIsGeneratingLink(true);
    setError('');
    try {
      const nextLink = await api.telegramLink();
      if (!mountedRef.current) return;
      const expiresAt = new Date(nextLink.expires_at).getTime();
      if (Number.isNaN(expiresAt) || expiresAt <= Date.now() || telegramStatus?.connected) {
        setActiveLink(nextLink);
        return;
      }
      setActiveLink(nextLink);
      setIsPolling(true);
    } catch {
      if (mountedRef.current) setError('Could not create a Telegram link. Try again.');
    } finally {
      if (mountedRef.current) setIsGeneratingLink(false);
    }
  }

  useEffect(() => {
    if (!activeLink || telegramStatus?.connected) {
      setIsPolling(false);
      return;
    }
    const expiresAt = new Date(activeLink.expires_at).getTime();
    if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
      setIsPolling(false);
      return;
    }

    const generation = generationRef.current;
    let ticks = 0;
    let requestActive = false;
    pollAbortRef.current?.abort();

    const poll = async () => {
      if (!mountedRef.current || generation !== generationRef.current || requestActive) return;
      if (Date.now() >= expiresAt || ticks >= MAX_POLL_TICKS) {
        setIsPolling(false);
        return;
      }
      ticks += 1;
      requestActive = true;
      const controller = new AbortController();
      pollAbortRef.current = controller;
      const next = await loadTelegramStatus('poll', controller.signal);
      requestActive = false;
      if (!mountedRef.current || generation !== generationRef.current || controller.signal.aborted) return;
      if (next?.connected) {
        generationRef.current += 1;
        setActiveLink(null);
        setIsPolling(false);
        await refreshSession();
      }
    };

    const id = window.setInterval(() => { void poll(); }, POLL_INTERVAL_MS);
    return () => {
      window.clearInterval(id);
      pollAbortRef.current?.abort();
    };
  }, [activeLink, telegramStatus?.connected, loadTelegramStatus, refreshSession]);

  async function unlink() {
    if (isDisconnecting) return;
    stopPolling();
    setIsDisconnecting(true);
    setError('');
    try {
      await api.telegramUnlink();
      if (!mountedRef.current) return;
      setConfirm(false);
      setActiveLink(null);
      setTelegramStatus({ connected: false, linked_at: null });
      await refreshSession();
    } catch {
      if (mountedRef.current) setError('Could not disconnect Telegram. Try again.');
    } finally {
      if (mountedRef.current) setIsDisconnecting(false);
    }
  }

  const busy = isGeneratingLink || isDisconnecting;
  return <section className="card section stack"><h2>Telegram integration</h2>{isLoadingTelegramStatus && <p className="muted">Checking Telegram status…</p>}{error && <p className="error" role="alert">{error} <button className="btn" onClick={() => void loadTelegramStatus('manual')}>Retry</button></p>}{telegramStatus?.connected ? <><p><strong>Telegram connected</strong></p>{telegramStatus.linked_at && <p className="muted">Linked {formatDateTime(telegramStatus.linked_at)}</p>}<button className="btn danger" disabled={busy} onClick={() => setConfirm(true)}>Disconnect Telegram</button></> : <><p><strong>Telegram is not connected.</strong></p><p className="muted">Connect Telegram to capture notes and interact with Lead Log through the bot.</p><button className="btn primary" disabled={busy || isLoadingTelegramStatus} aria-busy={isGeneratingLink} onClick={generate}>{isGeneratingLink ? 'Creating link…' : 'Connect Telegram'}</button></>}{activeLink && !telegramStatus?.connected && <div className="stack"><p className="muted">Open the bot, press Start, then return to Lead Log. This link expires {formatDateTime(activeLink.expires_at)}.</p>{isPolling && <p className="muted">Checking for connection…</p>}<a className="btn primary" href={activeLink.url} target="_blank" rel="noopener noreferrer">Open Telegram</a><button className="btn" disabled={statusInFlightRef.current} onClick={() => void loadTelegramStatus('manual')}>Check connection</button></div>}{confirm && <div className="dialog-backdrop" role="presentation"><div className="card dialog" role="dialog" aria-modal="true" aria-labelledby="disconnect-title"><h3 id="disconnect-title">Disconnect Telegram?</h3><p>Existing notes remain available. Future bot messages will no longer access this account.</p><div className="action-row"><button className="btn" onClick={() => setConfirm(false)}>Cancel</button><button className="btn danger" disabled={busy} aria-busy={isDisconnecting} onClick={unlink}>{isDisconnecting ? 'Disconnecting…' : 'Disconnect'}</button></div></div></div>}</section>;
}
