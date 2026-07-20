import { describe,it,expect,vi,beforeEach } from 'vitest';
import { api } from './endpoints';
import { ApiRequestError } from './client';
beforeEach(()=>{vi.restoreAllMocks()});
describe('person update endpoint',()=>{
 it('PATCHes the centralized person path with exact payload distinctions',async()=>{global.fetch=vi.fn().mockResolvedValue(new Response(JSON.stringify({data:{person:{id:'person_1',display_name:'Adlet',aliases:[],first_mentioned_at:'2026-03-12T10:00:00Z',last_mentioned_at:'2026-07-18T13:42:00Z',mention_count:14,updated_at:'2026-07-18T14:00:00Z'}}}),{status:200})) as typeof fetch;await api.updatePerson('person_1',{expected_updated_at:'old',first_name:null,aliases:[]});expect(fetch).toHaveBeenCalledWith('/api/backend/api/v1/people/person_1',expect.objectContaining({method:'PATCH',credentials:'include',body:JSON.stringify({expected_updated_at:'old',first_name:null,aliases:[]})}));});
 it('propagates safe field errors without exposing raw bodies',async()=>{global.fetch=vi.fn().mockResolvedValue(new Response(JSON.stringify({error:{code:'validation_error',message:'raw',fields:{display_name:'Required'}}}),{status:400})) as typeof fetch;await expect(api.updatePerson('person_1',{expected_updated_at:'old'})).rejects.toMatchObject({safe:{kind:'validation_error',fields:{display_name:'Required'}}});await expect(api.updatePerson('person_1',{expected_updated_at:'old'})).rejects.toBeInstanceOf(ApiRequestError);});
});
