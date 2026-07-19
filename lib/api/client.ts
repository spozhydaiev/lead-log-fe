import { getApiBaseUrl } from '@/lib/config/env';
import type { SafeApiError } from './types';
type Json=Record<string,unknown>|unknown[]|string|number|boolean|null;
type Options={method?:'GET'|'POST'|'PATCH'|'DELETE';body?:Json;headers?:Record<string,string>};
export class ApiRequestError extends Error{safe:SafeApiError;constructor(safe:SafeApiError){super(safe.message);this.safe=safe;}}
const safeMessage=(kind:SafeApiError['kind'])=>kind==='network_error'?'Lead Log could not reach the server. Try again.':kind==='unauthorized'?'Your session has expired. Please sign in again.':kind==='service_unavailable'?'Lead Log is temporarily unavailable. Try again.':'Something went wrong. Try again.';
function mapStatus(status:number,code?:string):SafeApiError['kind']{if(status===401)return'unauthorized';if(status===400||code==='validation_error')return'validation_error';if(status===409)return'conflict';if(status===429)return'rate_limited';if(status===503)return'service_unavailable';if(status===404)return'not_found';return status>=500?'service_unavailable':'unexpected_error';}
export async function apiRequest<T>(path:string,options:Options={}):Promise<T>{
 const headers:Record<string,string>={...(options.headers??{})};
 const init:RequestInit={method:options.method??'GET',credentials:'include',headers};
 if(options.body!==undefined){headers['Content-Type']='application/json';init.body=JSON.stringify(options.body)}
 let res:Response;try{res=await fetch(`${getApiBaseUrl()}${path}`,init)}catch{throw new ApiRequestError({kind:'network_error',message:safeMessage('network_error')})}
 if(res.status===204)return undefined as T;
 let parsed:unknown=null;try{parsed=await res.json()}catch{parsed=null}
 if(!res.ok){const obj=parsed&&typeof parsed==='object'?parsed as {error?:{code?:string;message?:string}}:{};const kind=mapStatus(res.status,obj.error?.code);throw new ApiRequestError({kind,status:res.status,message:safeMessage(kind)})}
 if(parsed&&typeof parsed==='object'&&'data' in parsed)return (parsed as {data:T}).data;
 return parsed as T;
}
