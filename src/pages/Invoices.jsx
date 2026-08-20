import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from '@/components/ui/use-toast';
import SubscriptionGate from '@/components/dashboard/SubscriptionGate';
import InvoiceSidebar from '@/components/invoices/InvoiceSidebar';
import CustomerDetailsCard from '@/components/invoices/CustomerDetailsCard';
import ItemsServicesCard from '@/components/invoices/ItemsServicesCard';
import InvoicePreview from '@/components/invoices/InvoicePreview';
import { getStoreOwnerEmail, hasActiveSubscription } from '@/lib/productUtils';

const TAX_RATE = 8.5;
const today = () => new Date().toISOString().split('T')[0];
const newInvoiceNumber = () => `INV-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

export default function Invoices() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const storeOwnerEmail = getStoreOwnerEmail(user);
  const [step, setStep] = useState(1);
  const [invoiceNumber] = useState(newInvoiceNumber);
  const [customer, setCustomer] = useState({ name: '', address: '', email: '' });
  const [items, setItems] = useState([{ description: '', qty: 1, price: 0 }]);
  const [isSaving, setIsSaving] = useState(false);

  const { data: pastInvoices = [] } = useQuery({
    queryKey: ['invoices', storeOwnerEmail],
    queryFn: () => base44.entities.Invoice.filter({ store_owner_email: storeOwnerEmail }, '-created_date', 100),
    enabled: !!user,
  });

  const savedCustomers = useMemo(() => {
    const map = new Map();
    pastInvoices.forEach((inv) => {
      if (inv.customer_name && !map.has(inv.customer_name)) {
        map.set(inv.customer_name, { name: inv.customer_name, address: inv.customer_address || '', email: inv.customer_email || '' });
      }
    });
    return [...map.values()];
  }, [pastInvoices]);

  const subtotal = items.reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.price) || 0), 0);
  const tax = subtotal * (TAX_RATE / 100);
  const total = subtotal + tax;

  const save = async (status) => {
    if (!customer.name.trim()) { toast({ title: 'Client manquant', description: 'Renseignez le nom du client.', variant: 'destructive' }); return; }
    setIsSaving(true);
    await base44.entities.Invoice.create({
      store_owner_email: storeOwnerEmail,
      invoice_number: invoiceNumber,
      invoice_date: today(),
      customer_name: customer.name,
      customer_address: customer.address,
      customer_email: customer.email,
      items: JSON.stringify(items.filter((i) => i.description)),
      subtotal, tax_amount: tax, total, status,
    });
    setIsSaving(false);
    queryClient.invalidateQueries({ queryKey: ['invoices', storeOwnerEmail] });
    toast({ title: status === 'draft' ? 'Brouillon enregistré' : 'Facture finalisée', description: `${invoiceNumber} — ${total.toFixed(2)}€` });
  };

  if (!hasActiveSubscription(user)) return <SubscriptionGate />;

  const dateFr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#f5f4f1] text-[#242321] flex">
      <InvoiceSidebar />
      <div className="flex-1 min-w-0 px-5 lg:px-8 py-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#2a2926]">Créer une nouvelle facture</h1>
            <div className="mt-3 flex items-center gap-3 text-sm">
              <span className={`flex items-center gap-2 font-bold ${step === 1 ? 'text-[#6f5400]' : 'text-[#8b877d]'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${step === 1 ? 'bg-[#8a6500]' : 'bg-[#b7b3a8]'}`}>1</span>
                Client & Articles
              </span>
              <span className="text-[#b7b3a8]">›</span>
              <span className={`flex items-center gap-2 font-bold ${step === 2 ? 'text-[#6f5400]' : 'text-[#8b877d]'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${step === 2 ? 'bg-[#8a6500]' : 'bg-[#b7b3a8]'}`}>2</span>
                Vérification & Envoi
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => save('draft')} disabled={isSaving} className="h-10 px-5 rounded-lg border border-[#d9d2c3] bg-white text-sm font-bold text-[#4b4a46] disabled:opacity-50">Enregistrer brouillon</button>
            {step === 1 ? (
              <button onClick={() => setStep(2)} className="h-10 px-5 rounded-lg bg-[#c9a646] text-white text-sm font-bold flex items-center gap-2 shadow-sm">Étape suivante <ArrowRight className="w-4 h-4" /></button>
            ) : (
              <button onClick={() => save('final')} disabled={isSaving} className="h-10 px-5 rounded-lg bg-[#8a6500] text-white text-sm font-bold flex items-center gap-2 shadow-sm disabled:opacity-50"><Check className="w-4 h-4" /> Finaliser la facture</button>
            )}
          </div>
        </div>

        <div className="mt-7 grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          {step === 1 ? (
            <div className="space-y-6">
              <CustomerDetailsCard customer={customer} onChange={setCustomer} savedCustomers={savedCustomers} />
              <ItemsServicesCard items={items} onChange={setItems} estimatedTotal={total} />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#eee8dc] shadow-sm p-5">
              <h2 className="text-lg font-extrabold text-[#8a6500] mb-2">Vérification</h2>
              <p className="text-sm text-[#6b675e]">Vérifiez les informations de la facture ci-contre, puis cliquez sur « Finaliser la facture » pour l'enregistrer.</p>
              <button onClick={() => setStep(1)} className="mt-4 text-sm font-bold text-[#8a6500] flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Revenir aux détails</button>
            </div>
          )}
          <InvoicePreview
            invoiceNumber={invoiceNumber}
            invoiceDate={dateFr}
            storeName={user?.shop_name || user?.full_name || 'Ma boutique'}
            customer={customer}
            items={items}
            subtotal={subtotal}
            tax={tax}
            total={total}
            taxRate={TAX_RATE}
          />
        </div>
      </div>
    </div>
  );
}