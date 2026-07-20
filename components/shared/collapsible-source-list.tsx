'use client';
import Link from 'next/link';
import { useId,useMemo,useState } from 'react';
import type { AskSource,SummarySource } from '@/lib/api/types';
import { formatDateTime } from '@/lib/formatting/date';

type AnySource=AskSource|SummarySource;
type SourceAction=(source:AnySource,e:React.MouseEvent<HTMLButtonElement>)=>void;
type Props={sources:AnySource[]|null|undefined;heading?:string;onOpenNote:SourceAction;initialVisibleCount?:number;largeCollectionThreshold?:number};
function cap(s:string,n=280){return s.length>n?`${s.slice(0,n-1)}…`:s}
function title(t:string|null|undefined){return t?t.split('_').map(p=>p[0]?.toUpperCase()+p.slice(1)).join(' '):'Source'}
function noteId(s:AnySource){return 'id'in s?s.id:s.note_id||s.source_note_id}
function isAsk(s:AnySource):s is AskSource{return !('occurred_at'in s)}
function timestamp(s:AnySource){return 'occurred_at'in s?s.occurred_at:s.timestamp}
function label(s:AnySource){return s.label||('occurred_at'in s?'Source note':title(s.type))}
function excerpt(s:AnySource){return s.excerpt||''}
function keyFor(s:AnySource,i:number){return `${s.type??'source'}-${noteId(s)??'evidence'}-${i}`}
function SourceActionView({source,onOpenNote}:{source:AnySource;onOpenNote:SourceAction}){const note=noteId(source);if(!isAsk(source))return <button className="btn" onClick={e=>onOpenNote(source,e)}>Open source note</button>;if(source.type==='note'&&note)return <button className="btn" onClick={e=>onOpenNote(source,e)}>Open note</button>;if(source.type==='person'&&source.person_id)return <Link className="btn" href={`/people/${encodeURIComponent(source.person_id)}`}>Open person</Link>;if(source.type==='ticket'&&source.ticket_key)return <Link className="btn" href={`/tickets/${encodeURIComponent(source.ticket_key)}`}>Open ticket</Link>;if(source.type==='action')return note?<button className="btn" onClick={e=>onOpenNote(source,e)}>Open source note</button>:<Link className="btn" href="/actions">Open actions</Link>;if(source.type==='decision'&&note)return <button className="btn" onClick={e=>onOpenNote(source,e)}>Open source note</button>;return <span className="muted">Evidence only</span>}
export function CollapsibleSourceList({sources,heading='Source notes',onOpenNote,initialVisibleCount=5,largeCollectionThreshold=30}:Props){const safe=useMemo(()=>sources??[],[sources]);const [expanded,setExpanded]=useState(false);const id=useId();if(!safe.length)return null;const total=safe.length;const needsToggle=total>initialVisibleCount;const visible=expanded?safe:safe.slice(0,initialVisibleCount);const large=expanded&&total>largeCollectionThreshold;const list=<ol className="source-list">{visible.map((s,i)=><li key={keyFor(s,i)} className="source-card"><div><strong>{label(s)}</strong>{timestamp(s)&&<span className="muted"> · {formatDateTime(timestamp(s)??null)}</span>}</div>{isAsk(s)&&s.type&&s.type!=='note'&&<p className="muted"><span className="chip">{title(s.type)}</span></p>}{excerpt(s)&&<p className="muted excerpt">{cap(excerpt(s))}</p>}<SourceActionView source={s} onOpenNote={onOpenNote}/></li>)}</ol>;return <section className="card section stack" aria-labelledby={`${id}-heading`}><h2 id={`${id}-heading`}>{heading}</h2><div id={`${id}-region`} className={large?'source-scroll-region':''} tabIndex={large?0:undefined} aria-label={large?'All source notes':undefined}>{large&&<p className="muted source-scroll-label">All source notes</p>}{list}</div>{needsToggle&&<button className="btn source-toggle" type="button" aria-expanded={expanded} aria-controls={`${id}-region`} aria-label={`${expanded?'Show fewer':'Show all'} ${total} sources`} onClick={()=>setExpanded(v=>!v)}>{expanded?'Show less':`Show all ${total} sources`}</button>}</section>}
