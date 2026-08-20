import React from 'react';

export default function InvoicePreview({ invoiceNumber, invoiceDate, storeName, customer, items, subtotal, tax, total, taxRate }) {
  return (
    <div className="bg-white rounded-2xl border border-[#eee8dc] shadow-sm p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold tracking-wide text-[#8a6500] uppercase">Facture</p>
          <p className="text-sm text-[#4b4a46] mt-1">{invoiceNumber}</p>
          <p className="text-sm text-[#4b4a46]">Date : {invoiceDate}</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-extrabold text-[#2a2926]">{storeName}</p>
          <p className="text-[#6b675e]">TrackSmart Retail</p>
        </div>
      </div>
      <div className="border-t-2 border-[#c9a646]/50 my-5" />
      <p className="text-[11px] font-bold tracking-wider text-[#8a6500] uppercase">Facturé à :</p>
      <p className="mt-1 font-extrabold text-[#2a2926]">{customer.name || '—'}</p>
      {customer.address && <p className="text-sm text-[#4b4a46]">{customer.address}</p>}
      {customer.email && <p className="text-sm text-[#4b4a46]">{customer.email}</p>}

      <table className="w-full mt-6 text-sm">
        <thead>
          <tr className="text-left text-[11px] font-extrabold tracking-wide text-[#2a2926] uppercase border-b-2 border-[#8a6500]/60">
            <th className="pb-2">Description</th>
            <th className="pb-2 text-center">Qté</th>
            <th className="pb-2 text-right">Prix unit.</th>
            <th className="pb-2 text-right">Montant</th>
          </tr>
        </thead>
        <tbody>
          {items.filter((item) => item.description).map((item, index) => {
            const qty = Number(item.qty) || 0;
            const price = Number(item.price) || 0;
            return (
              <tr key={index} className="border-b border-[#eee8dc]">
                <td className="py-3 pr-2 text-[#2a2926]">{item.description}</td>
                <td className="py-3 text-center">{qty}</td>
                <td className="py-3 text-right">{price.toFixed(2)}€</td>
                <td className="py-3 text-right font-semibold">{(qty * price).toFixed(2)}€</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-4 ml-auto w-56 space-y-1.5 text-sm">
        <div className="flex justify-between text-[#4b4a46]"><span>Sous-total :</span><span>{subtotal.toFixed(2)}€</span></div>
        <div className="flex justify-between text-[#4b4a46] border-b-2 border-[#8a6500]/40 pb-2"><span>TVA ({taxRate}%) :</span><span>{tax.toFixed(2)}€</span></div>
        <div className="flex justify-between font-extrabold text-[#8a6500] text-base pt-1"><span>Total :</span><span>{total.toFixed(2)}€</span></div>
      </div>

      <div className="border-t border-[#eee8dc] mt-6 pt-4">
        <p className="text-[11px] font-bold tracking-wider text-[#2a2926] uppercase">Conditions de paiement</p>
        <p className="text-sm text-[#6b675e] mt-1">Merci de régler cette facture sous 30 jours. Merci de votre confiance.</p>
      </div>
    </div>
  );
}