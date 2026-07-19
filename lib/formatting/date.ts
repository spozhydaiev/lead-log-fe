export const formatTime=(iso:string)=>new Intl.DateTimeFormat(undefined,{hour:'numeric',minute:'2-digit'}).format(new Date(iso));
export const formatDateTime=(iso:string|null)=>iso?new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(new Date(iso)):'Not available';
