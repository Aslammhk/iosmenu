import React, { useState } from 'react';
import { CartItem } from '../types';
import { WHATSAPP_NUMBER } from '../data';
import { X, Plus, Minus, Trash2, MessageCircle, Printer, Loader2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onUpdateSize: (cartId: string, newSize: 'Single' | 'Regular' | 'Large') => void;
  onRemoveItem: (cartId: string) => void;
  onClearCart: () => void;
  tableNumber: string;
  t: (key: string) => string;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, cartItems, onUpdateQuantity, onUpdateSize, onRemoveItem, onClearCart, tableNumber, t }) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.adjustedPrice * item.quantity), 0);
  const totalOriginalAmount = cartItems.reduce((sum, item) => sum + ((item.originalPrice || item.adjustedPrice) * item.quantity), 0);
  const totalDiscount = Math.max(0, totalOriginalAmount - totalAmount);
  
  const taxAmount = totalAmount * 0.05;
  const finalTotal = totalAmount + taxAmount;

  const handlePrintReceipt = async () => {
    if (cartItems.length === 0) return;
    
    // Validation: Ensure table number is selected before printing
    if (!tableNumber) { 
        alert(t('select_table')); 
        return; 
    }

    setIsPrinting(true);

    // Format Plain Text POS Receipt (Industry Standard)
    let text = '';
    text += '      AF RESTRO\n';
    text += ' Premium Dining Experience\n';
    text += '--------------------------\n';
    text += `Table: ${tableNumber}\n`;
    text += `Date: ${new Date().toLocaleString()}\n`;
    text += '--------------------------\n';
    text += 'ITEM            QTY  PRICE\n';

    cartItems.forEach(item => {
      const sizeAbbr = item.pricing_option === '1' ? 'F' : (item.size === 'Single' ? 'S' : item.size === 'Regular' ? 'R' : 'F');
      // Include sizeAbbr in the name to ensure it's used and clarifies the receipt
      const nameWithAbbr = `${item.dish_name.substring(0, 10)} (${sizeAbbr})`;
      const name = nameWithAbbr.padEnd(15);
      const qty = `x${item.quantity}`.padEnd(4);
      const price = (item.adjustedPrice * item.quantity).toFixed(2);
      
      text += `${name} ${qty} ${price}\n`;
      
      // Addons as sub-items
      if (item.selectedAddons) {
        item.selectedAddons.forEach(cat => {
          cat.items.forEach(ai => {
            text += ` + ${ai.name.substring(0, 10)}    +${ai.price.toFixed(2)}\n`;
          });
        });
      }
    });

    text += '--------------------------\n';
    text += `Subtotal:      ${totalAmount.toFixed(2)}\n`;
    if (totalDiscount > 0.01) text += `Discount:     -${totalDiscount.toFixed(2)}\n`;
    text += `Tax (5%):      ${taxAmount.toFixed(2)}\n`;
    text += '--------------------------\n';
    text += `TOTAL:        Đ ${finalTotal.toFixed(2)}\n`;
    text += '--------------------------\n';
    text += '  Thank you for dining!\n';
    text += '    Please visit again\n\n\n';

    try {
      // 1. Check if specialized printer plugin exists
      const win = window as any;
      if (win.cordova?.plugins?.printer) {
        win.cordova.plugins.printer.print(text, { name: 'POS Receipt', duplex: false });
      } 
      // 2. Otherwise use the Share plugin (Reliable fallback for thermal printer apps)
      else if (Capacitor.isNativePlatform()) {
        await Share.share({
          title: 'Order Receipt',
          text: text,
          dialogTitle: 'Send to Thermal Printer'
        });
      } 
      // 3. Browser fallback
      else {
        console.log("POS Receipt Text:\n", text);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`<pre style="font-family:monospace; font-size:12px;">${text}</pre>`);
          printWindow.document.close();
          printWindow.print();
        }
      }
      
      // Clear cart and close sidebar after printing intent
      onClearCart();
      onClose();
    } catch (err) {
      console.error("Print failed", err);
      alert("Print failed. Please use WhatsApp Checkout.");
    } finally {
      setIsPrinting(false);
    }
  };

  const handleCheckout = () => {
    if (!tableNumber) { alert(t('select_table')); return; }

    let message = `*AF RESTRO - NEW ORDER*\n`;
    message += `*Table:* ${tableNumber}\n`;
    message += `*Time:* ${new Date().toLocaleTimeString()}\n\n`;
    
    cartItems.forEach(item => {
        message += `▪️ ${item.quantity}x ${item.dish_name} (${item.size})\n   Amt: Đ ${(item.adjustedPrice * item.quantity).toFixed(2)}\n`;
        if (item.selectedAddons && item.selectedAddons.length > 0) {
            item.selectedAddons.forEach(a => {
                a.items.forEach(ai => {
                    message += `   + ${ai.name} (Đ ${ai.price})\n`;
                });
            });
        }
    });

    message += `\n------------------\n`;
    if (totalDiscount > 0.01) message += `Actual: Đ ${totalOriginalAmount.toFixed(2)}\nDiscount: -Đ ${totalDiscount.toFixed(2)}\n`;
    message += `Subtotal: Đ ${totalAmount.toFixed(2)}\n`;
    message += `Tax (5%): Đ ${taxAmount.toFixed(2)}\n`;
    message += `*TOTAL: Đ ${finalTotal.toFixed(2)}*`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
    
    setTimeout(() => {
        if(confirm("Order Sent! Clear cart?")) { onClearCart(); onClose(); }
    }, 1000);
  };

  const getPricingType = (opt: string | undefined) => {
      const o = String(opt || '1');
      if (o === '3' || o.toLowerCase().includes('single')) return 3;
      if (o === '2' || o.toLowerCase().includes('half') || o.toLowerCase().includes('regular')) return 2;
      return 1;
  };

  return (
    <>
      {isPrinting && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
           <div className="bg-[#1e1e1e] p-8 rounded-3xl border border-[#333] shadow-2xl flex flex-col items-center max-w-sm w-full">
              <Loader2 className="text-green-500 animate-spin mb-4" size={48} />
              <h3 className="text-white font-bold text-xl mb-2">Preparing Receipt</h3>
              <p className="text-gray-400 text-sm">Generating POS text... Send this to your thermal printer app.</p>
           </div>
        </div>
      )}

      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed top-0 right-0 h-full w-full md:w-[380px] bg-[#1a1a1a] z-50 shadow-2xl transform transition-transform duration-300 border-l border-[#333] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b border-[#333] flex items-center justify-between bg-[#1e1e1e]">
            <h2 className="text-lg font-bold text-white">{t('current_order')}</h2>
            <div className="flex items-center gap-3">
                 <div className="bg-green-600 px-2 py-0.5 rounded-full text-[10px] font-bold text-white">{t('table')} {tableNumber || '?'}</div>
                <button onClick={onClose} className="text-gray-400 p-1 hover:bg-white/5 rounded-full"><X size={20} /></button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar">
            {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                    <Plus size={48} className="mb-4" />
                    <p className="text-sm uppercase tracking-widest">{t('empty_cart')}</p>
                </div>
            ) : (
                cartItems.map((item) => {
                    const pricingType = getPricingType(item.pricing_option);
                    return (
                        <div key={item.cartId} className="bg-[#252525] rounded-2xl p-4 flex flex-col gap-3 border border-[#333] shadow-lg">
                            <div className="flex gap-3">
                                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 relative border border-white/5">
                                    <img src={item.photo_link} alt={item.dish_name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-white font-bold text-xs line-clamp-1 flex-1">{item.dish_name}</h4>
                                        {pricingType > 1 && (
                                            <select 
                                                value={item.size} 
                                                onChange={(e) => onUpdateSize(item.cartId, e.target.value as any)}
                                                className="bg-[#1a1a1a] text-white text-[10px] rounded-lg border border-[#444] outline-none py-1.5 px-1.5 font-bold"
                                            >
                                                {pricingType === 3 && <option value="Single">{t('size_single')}</option>}
                                                {(pricingType === 2 || pricingType === 3) && <option value="Regular">{t('size_regular')}</option>}
                                                <option value="Large">{t('size_large')}</option>
                                            </select>
                                        )}
                                    </div>
                                    
                                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                                        <div className="mt-1 space-y-1">
                                            {item.selectedAddons.map(addonCat => (
                                                <div key={addonCat.categoryId} className="text-[9px] text-blue-400 flex flex-col italic">
                                                    {addonCat.items.map(ai => (
                                                        <div key={ai.id} className="flex justify-between items-center bg-blue-900/10 px-1 rounded">
                                                            <span>+ {ai.name}</span>
                                                            <span className="opacity-70">Đ {ai.price.toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center mt-3">
                                        <div className="flex flex-col">
                                            <p className="text-green-500 font-bold text-sm">Đ {(item.adjustedPrice * item.quantity).toFixed(2)}</p>
                                            {(item.originalPrice && item.originalPrice > item.adjustedPrice) && (
                                                <p className="text-[10px] text-gray-500 line-through">Đ {(item.originalPrice * item.quantity).toFixed(2)}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-xl p-1 border border-[#333]">
                                            <button onClick={() => onUpdateQuantity(item.cartId, -1)} className="w-8 h-8 bg-[#333] rounded-lg flex items-center justify-center hover:bg-red-900/40 transition-colors text-white"><Minus size={14}/></button>
                                            <span className="text-xs font-bold w-6 text-center text-white">{item.quantity}</span>
                                            <button onClick={() => onUpdateQuantity(item.cartId, 1)} className="w-8 h-8 bg-[#333] rounded-lg flex items-center justify-center hover:bg-green-900/40 transition-colors text-white"><Plus size={14}/></button>
                                        </div>
                                        <button onClick={() => onRemoveItem(item.cartId)} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>

        <div className="p-4 bg-[#1e1e1e] border-t border-[#333] space-y-4">
            <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-gray-400"><span>Subtotal</span><span className="text-white font-bold">Đ {totalAmount.toFixed(2)}</span></div>
                <div className="flex justify-between items-center text-xs text-gray-400"><span>Tax (5%)</span><span className="text-white font-bold">Đ {taxAmount.toFixed(2)}</span></div>
                
                {totalDiscount > 0.01 && (
                    <div className="flex justify-between items-center text-xs text-red-500 font-bold bg-red-500/5 p-2 rounded-lg border border-red-500/20">
                        <span className="uppercase tracking-tighter">Savings</span>
                        <span>-Đ {totalDiscount.toFixed(2)}</span>
                    </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-dashed border-[#444] font-bold">
                    <span className="text-white uppercase tracking-widest text-xs">Final Total</span>
                    <span className="text-green-500 text-2xl tracking-tighter">Đ {finalTotal.toFixed(2)}</span>
                </div>
            </div>

            <div className="flex gap-2">
                <button 
                    onClick={handlePrintReceipt}
                    disabled={cartItems.length === 0 || isPrinting}
                    className="flex-1 py-4 rounded-2xl bg-[#333] text-white font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-[#444] disabled:opacity-50 transition-all shadow-lg active:scale-95 border border-[#444]"
                >
                    {isPrinting ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
                    Print POS
                </button>
                <button 
                    onClick={handleCheckout} 
                    disabled={cartItems.length === 0}
                    className="flex-[2] py-4 rounded-2xl bg-green-600 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-xl shadow-green-900/40 active:scale-95 transition-all hover:bg-green-500 disabled:opacity-50"
                >
                    <MessageCircle size={16} /> WhatsApp Checkout
                </button>
            </div>
        </div>
      </div>
    </>
  );
};

export default CartSidebar;