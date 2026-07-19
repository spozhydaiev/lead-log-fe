export function getApiBaseUrl(){const value=process.env.NEXT_PUBLIC_API_BASE_URL;if(!value)throw new Error('NEXT_PUBLIC_API_BASE_URL is required');return value.replace(/\/$/,'');}
