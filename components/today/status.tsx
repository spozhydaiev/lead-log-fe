import type { ProcessingStatus } from '@/lib/api/types';
export function statusLabel(s:ProcessingStatus){return s==='pending'?'Saved':s==='processing'?'Processing…':s==='processed'?'Processed':'Could not process'}
export function StatusChip({status}:{status:ProcessingStatus}){return <span className="chip">{statusLabel(status)}</span>}
