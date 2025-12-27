import React, { useState, useEffect } from 'react';
import { MenuItem, AddonCategory, SelectedAddon, AddonItem } from '../types';
import { MENU_DATA } from '../data';
import { X, Clock, Flame, Users, PlayCircle, Plus, Award, Activity, Check, Sparkles } from 'lucide-react';

interface ProductModalProps {
  item: MenuItem | null;
  originalPrice?: number;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItem, size: 'Single' | 'Regular' | 'Large', adjustedPrice: number, originalPrice?: number, addons?: SelectedAddon[]) => void;
  addonCategories: AddonCategory[];
  t: (key: string) => string;
}

const ProductModal: React.FC<ProductModalProps> = ({ item, originalPrice, isOpen, onClose, onAddToCart, addonCategories, t }) => {
  const [selectedSize, setSelectedSize] = useState<'Single' | 'Regular' | 'Large' | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, AddonItem[]>>({});
  const [recommendedItems, setRecommendedItems] = useState<MenuItem[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const getPricingType = (option: string | number | undefined) => {
      const opt = String(option || '1');
      if (opt === '3' || opt.toLowerCase().includes('single')) return 3;
      if (opt === '2' || opt.toLowerCase().includes('half') || opt.toLowerCase().includes('regular')) return 2;
      return 1;
  };

  const pricingType = item ? getPricingType(item.pricing_option) : 1;

  useEffect(() => {
    if (isOpen && item) {
      setSelectedSize(pricingType === 1 ? 'Large' : null);
      setSelectedAddons({});
      const others = MENU_DATA.filter(i => i.category === item.category && i.dish_name !== item.dish_name);
      setRecommendedItems(others.sort(() => 0.5 - Math.random()).slice(0, 3));
      setIsPlaying(false);
    }
  }, [isOpen, item, pricingType]);

  if (!isOpen || !item) return null;

  const applicableAddonCats = addonCategories.filter(cat => item.addon_category_ids?.includes(cat.id));

  const toggleAddon = (catId: string, addon: AddonItem) => {
      setSelectedAddons(prev => {
          const currentInCat = prev[catId] || [];
          const isSelected = currentInCat.some(i => i.id === addon.id);
          const updatedInCat = isSelected 
              ? currentInCat.filter(i => i.id !== addon.id) 
              : [...currentInCat, addon];
          
          return { ...prev, [catId]: updatedInCat };
      });
  };

  const calculateAddonsPrice = () => {
      return Object.values(selectedAddons).flat().reduce((sum, item) => sum + item.price, 0);
  };

  const getPriceMultiplier = (size: string) => {
    switch (size) {
      case 'Single': return 0.4;
      case 'Regular': return 0.7;
      case 'Large': return 1.0;
      default: return 1.0;
    }
  };

  const currentBasePrice = selectedSize ? item.price * getPriceMultiplier(selectedSize) : item.price;
  const addonsTotal = calculateAddonsPrice();
  const totalPrice = currentBasePrice + addonsTotal;
  
  const currentOriginalPrice = originalPrice 
    ? ((selectedSize ? originalPrice * getPriceMultiplier(selectedSize) : originalPrice) + addonsTotal) 
    : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative bg-[#1a1a1a] w-full max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-[#333] animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-500 transition-colors"><X size={20} /></button>

        <div className="w-full md:w-[45%] bg-black relative flex flex-col h-64 md:h-auto overflow-y-auto no-scrollbar">
            <div className="h-64 md:h-80 relative flex-shrink-0 bg-gray-800">
                {isPlaying && item.video_link ? (
                    <video src={item.video_link} className="w-full h-full object-cover" controls autoPlay />
                ) : (
                    <>
                        <img src={item.photo_link} alt={item.dish_name} className="w-full h-full object-cover opacity-90" onError={(e) => { e.currentTarget.src = "https://placehold.co/600x400/252525/444444?text=No+Image"; }} />
                        {item.video_link && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[#1a1a1a] to-transparent">
                                <button onClick={() => setIsPlaying(true)} className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:scale-110 transition-transform"><PlayCircle size={32} fill="white" className="ml-1" /></button>
                            </div>
                        )}
                    </>
                )}
            </div>
            <div className="p-6 bg-[#181818] flex-1 hidden md:block">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2"><Award size={18} className="text-yellow-500" /> Recommended</h4>
                <div className="flex flex-col gap-3">
                    {recommendedItems.map((rec, i) => (
                        <div key={i} className="flex gap-3 items-center bg-[#252525] p-2 rounded-xl border border-[#333]">
                            <img src={rec.photo_link} className="w-12 h-12 rounded-lg object-cover" alt="" onError={(e) => {e.currentTarget.src = "https://placehold.co/100";}}/>
                            <div>
                                <h5 className="text-white text-sm font-medium line-clamp-1">{rec.dish_name}</h5>
                                <span className="text-green-500 text-xs font-bold">Đ {rec.price.toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="w-full md:w-[55%] p-6 md:p-8 flex flex-col overflow-y-auto h-[calc(90vh-16rem)] md:h-auto no-scrollbar">
            <div className="flex justify-between items-start mb-2">
                 <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight flex-1 mr-4">{item.dish_name}</h2>
                 <div className="flex flex-col items-end">
                    <span className="text-2xl md:text-3xl font-bold text-green-500">Đ {totalPrice.toFixed(2)}</span>
                    {currentOriginalPrice && currentOriginalPrice > totalPrice && (
                      <span className="text-lg text-gray-500 line-through decoration-red-500">Đ {currentOriginalPrice.toFixed(2)}</span>
                    )}
                 </div>
            </div>

            {pricingType > 1 && (
                <div className="mb-4 bg-[#252525] p-2 rounded-xl border border-[#333] flex gap-2">
                    {pricingType === 3 && <button onClick={() => setSelectedSize('Single')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${selectedSize === 'Single' ? 'bg-green-600 text-white' : 'text-gray-400'}`}>Single</button>}
                    {(pricingType === 2 || pricingType === 3) && <button onClick={() => setSelectedSize('Regular')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${selectedSize === 'Regular' ? 'bg-green-600 text-white' : 'text-gray-400'}`}>Regular</button>}
                    <button onClick={() => setSelectedSize('Large')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${selectedSize === 'Large' ? 'bg-green-600 text-white' : 'text-gray-400'}`}>Full</button>
                </div>
            )}

            {applicableAddonCats.length > 0 && (
                <div className="mb-6 space-y-4">
                    <h4 className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <Sparkles size={14} className="text-blue-500"/> Customize your order
                    </h4>
                    {applicableAddonCats.map(cat => (
                        <div key={cat.id} className="bg-[#252525] rounded-2xl border border-[#333] overflow-hidden">
                            <div className="bg-[#2a2a2a] px-4 py-2 border-b border-[#333] text-[10px] font-black uppercase text-gray-400">{cat.name}</div>
                            <div className="p-3 grid grid-cols-2 gap-2">
                                {cat.items.map(addon => (
                                    <button 
                                        key={addon.id} 
                                        onClick={() => toggleAddon(cat.id, addon)}
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-left ${selectedAddons[cat.id]?.some(i => i.id === addon.id) ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-[#1a1a1a] border-white/5 text-gray-400 hover:border-white/20'}`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold truncate">{addon.name}</span>
                                            <span className="text-[10px] text-gray-500">+Đ {addon.price}</span>
                                        </div>
                                        {selectedAddons[cat.id]?.some(i => i.id === addon.id) && <Check size={14} className="text-blue-400" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button 
                disabled={!selectedSize}
                onClick={() => { 
                    if (selectedSize) {
                        const addonPayload: SelectedAddon[] = Object.entries(selectedAddons)
                            .filter(([_, items]) => items.length > 0)
                            .map(([catId, items]) => ({
                                categoryId: catId,
                                categoryName: applicableAddonCats.find(c => c.id === catId)?.name || 'Extra',
                                items
                            }));
                        onAddToCart(item, selectedSize, totalPrice, currentOriginalPrice, addonPayload); 
                        onClose(); 
                    }
                }}
                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg font-bold text-sm mb-6 ${!selectedSize ? 'bg-[#333] text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/50'}`}
            >
                <Plus size={18} />
                {!selectedSize ? 'Choose Size' : `${t('add_to_cart')} - Đ ${totalPrice.toFixed(2)}`}
            </button>

            <div className="grid grid-cols-4 gap-2 mb-6">
                <div className="bg-[#252525] p-2 rounded-xl flex flex-col items-center justify-center text-center">
                    <Clock size={16} className="text-green-500 mb-1" />
                    <span className="text-[10px] font-bold text-white">{(item.cook_time || 1) * 15} min</span>
                </div>
                <div className="bg-[#252525] p-2 rounded-xl flex flex-col items-center justify-center text-center">
                    <Activity size={16} className="text-pink-500 mb-1" />
                    <span className="text-[10px] font-bold text-white">{Math.floor(totalPrice * 15)} kcal</span>
                </div>
                <div className="bg-[#252525] p-2 rounded-xl flex flex-col items-center justify-center text-center">
                    <Flame size={16} className="text-orange-500 mb-1" />
                    <span className="text-[10px] font-bold text-white">{item.spicy_level || 'Normal'}</span>
                </div>
                <div className="bg-[#252525] p-2 rounded-xl flex flex-col items-center justify-center text-center">
                    <Users size={16} className="text-blue-500 mb-1" />
                    <span className="text-[10px] font-bold text-white">{item.serves_how_many} pp</span>
                </div>
            </div>
            <p className="text-gray-400 text-sm italic leading-relaxed">{item.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;