import '@testing-library/jest-dom/vitest';
import { render,screen } from '@testing-library/react';
import { describe,it,expect } from 'vitest';
import { SummaryContentView } from './summary-utils';

describe('SummaryContentView embedded people',()=>{
 it('renders structured people as compact linked and non-clickable tiles only when IDs exist',()=>{render(<SummaryContentView type="daily" content={{people_highlights:[{person_id:'person_1',display_name:'Adlet',count:2},{text:'Unresolved stakeholder'}],decisions:[{text:'Keep scope small'}],risks:[{text:'Timeline risk'}]}}/>);expect(screen.getByRole('heading',{name:'People highlights'})).toBeInTheDocument();expect(screen.getByRole('link',{name:/Adlet/})).toHaveAttribute('href','/people/person_1');expect(screen.getByText('Unresolved stakeholder').closest('a')).toBeNull();expect(document.querySelector('.embedded-person-grid')).toBeInTheDocument();expect(screen.getByRole('heading',{name:'Decisions'}).nextElementSibling?.tagName).toBe('UL');expect(screen.getByRole('heading',{name:'Risks'}).nextElementSibling?.tagName).toBe('UL');});
 it('does not infer person links from text-only weekly people entries',()=>{render(<SummaryContentView type="weekly" content={{people:[{text:'Alex follow-up'}]}}/>);expect(screen.getByText('Alex follow-up').closest('a')).toBeNull();});
});
