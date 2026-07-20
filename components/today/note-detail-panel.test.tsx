import { render,screen,waitFor } from '@testing-library/react';
import { describe,it,expect,vi,beforeEach } from 'vitest';
import { NoteDetailPanel } from './note-detail-panel';
import { api } from '@/lib/api/endpoints';

vi.mock('@/lib/api/endpoints',()=>({api:{note:vi.fn()}}));

const detail={id:'note_1',raw_text:'Short raw note',summary:'Short summary',processing_status:'processed' as const,created_at:'2026-07-19T10:00:00Z',processed_at:null,actions:[],people:[],decisions:[],entities:[]};

beforeEach(()=>{vi.mocked(api.note).mockReset();vi.mocked(api.note).mockResolvedValue(detail);});

describe('NoteDetailPanel',()=>{
 it('renders a compact shared empty-state panel',()=>{render(<NoteDetailPanel noteId={null} onClose={vi.fn()} onFinished={vi.fn()}/>);const panel=screen.getByRole('complementary');expect(panel).toHaveClass('detail-panel','note-detail-panel','note-detail-empty');expect(panel).not.toHaveClass('note-detail-open');expect(screen.getByRole('heading',{name:'Note details'})).toBeInTheDocument();expect(screen.getByText('Select a note to inspect its details.')).toBeInTheDocument();});
 it('keeps existing detail content and applies the shared desktop scroll panel classes',async()=>{render(<NoteDetailPanel noteId="note_1" onClose={vi.fn()} onFinished={vi.fn()}/>);const panel=screen.getByRole('complementary',{name:'Note details'});expect(panel).toHaveClass('detail-panel','note-detail-panel','note-detail-open','stack');expect(panel).toHaveAttribute('tabindex','0');expect(screen.getByRole('button',{name:'Close details'})).toHaveClass('drawer-close');await screen.findByText('Short raw note');expect(screen.getByText('Short summary')).toBeInTheDocument();expect(screen.getByRole('heading',{name:'Raw note'}).closest('section')).toHaveClass('note-detail-section');expect(screen.getByRole('heading',{name:'Summary'}).closest('section')).toHaveClass('note-detail-section');await waitFor(()=>expect(api.note).toHaveBeenCalledWith('note_1'));});
});
