import { TicketDetailPage } from '@/components/tickets/ticket-detail-page';
export default async function Page({params}:{params:Promise<{key:string}>}){const {key}=await params;return <TicketDetailPage ticketKey={key}/>}
