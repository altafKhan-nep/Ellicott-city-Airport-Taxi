import { useQuery } from '@tanstack/react-query';
import api from '../../../../services/api.js';
import { Card, CardTitle } from '../../components/ui/card';
export default function FinancePage(){
  const { data }=useQuery({ queryKey:['crm','payments'], queryFn: async()=>(await api.get('/admin/payments')).data });
  const summary:any=(data as any)?.summary??{}; const payments:any[]=(data as any)?.payments??[];
  return (<div className="space-y-4"><h1 className="text-2xl font-bold">Finance — Reconciliation</h1><div className="grid gap-4 sm:grid-cols-4">{Object.entries(summary).map(([k,v]:any)=><Card key={k}><CardTitle className="capitalize">{k}</CardTitle><p className="mt-1 text-xl font-bold">${(v.total??0).toFixed(2)}</p><p className="text-xs text-muted">{v.count} payments</p></Card>)}</div><Card><CardTitle>Recent transactions (Stripe + cash)</CardTitle><ul className="mt-3 space-y-2 text-sm">{payments.slice(0,10).map((p:any)=><li key={p._id} className="flex justify-between border-b py-2 last:border-0 dark:border-accent-800"><span>{p.provider} {p.method} {p.status}</span><span className="font-medium">${p.amount.toFixed(2)}</span></li>)}</ul><p className="mt-3 text-xs text-muted">Stripe reconciliation, refunds, invoices, payouts, taxes, CSV export → extend via Invoice/Payout models + webhooks.</p></Card></div>);
}
