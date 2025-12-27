import React, { useState, useMemo } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import FoodCard from './FoodCard';
import ProductModal from './ProductModal';
import { MenuItem, CartItem, Discount, AddonCategory, SelectedAddon } from '../types';

interface MenuViewProps {
  items: MenuItem[];
  cart: CartItem[];
  addToCart: (item: MenuItem, size: 'Single' | 'Regular' | 'Large', adjustedPrice: number, originalPrice?: number, selectedAddons?: SelectedAddon[]) => void;
  setIsCartOpen: (isOpen: boolean) => void;
  t: (key: string) => string;
  tableNumber: string;
  setTableNumber: (num: string) => void;
  favorites: string[];
  toggleFavorite: (dishName: string) => void;
  discounts: Discount[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  categoryOrder: string[];
  addonCategories: AddonCategory[];
}

const MenuView: React.FC<MenuViewProps> = ({ 
  items,
  cart, 
  addToCart, 
  setIsCartOpen, 
  t, 
  tableNumber, 
  setTableNumber,
  favorites,
  toggleFavorite,
  discounts,
  activeCategory,
  onSelectCategory,
  categoryOrder,
  addonCategories,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isVegOnly, setIsVegOnly] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedItemOriginalPrice, setSelectedItemOriginalPrice] = useState<number | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const getDiscountedPrice = (item: MenuItem): number => {
    const discount = discounts.find(d => d.category === item.category);
    if (!discount) return item.price;
    if (discount.type === 'HAPPY_HOUR') {
        const now = new Date();
        const currentVal = now.getHours() * 60 + now.getMinutes();
        const [startH, startM] = (discount.startTime || "00:00").split(':').map(Number);
        const [endH, endM] = (discount.endTime || "23:59").split(':').map(Number);
        if (currentVal >= (startH * 60 + startM) && currentVal <= (endH * 60 + endM)) return item.price * (1 - discount.percentage / 100);
        return item.price;
    }
    return item.price * (1 - discount.percentage / 100);
  };

  const getItemQuantity = (itemId: string) => {
      return cart.filter(cartItem => cartItem.id === itemId).reduce((sum, item) => sum + item.quantity, 0);
  };

  const categories = useMemo(() => Array.from(new Set(items.map(item => item.category))), [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (activeCategory === 'Special Offers') return item.todays_special === true && item.dish_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch = item.dish_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVeg = !isVegOnly || item.is_veg;
      return matchesCategory && matchesSearch && matchesVeg;
    });
  }, [items, activeCategory, searchQuery, isVegOnly, discounts]);

  const handleItemClick = (item: MenuItem) => {
    const discounted = getDiscountedPrice(item);
    setSelectedItem({ ...item, price: discounted }); 
    setSelectedItemOriginalPrice(discounted < item.price ? item.price : undefined);
    setIsModalOpen(true);
  };

  const handleQuickAdd = (item: MenuItem) => {
     const discountedBase = getDiscountedPrice(item);
     addToCart(item, 'Large', discountedBase, item.price);
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] text-white overflow-hidden relative">
      <Header 
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          isVegOnly={isVegOnly} setIsVegOnly={setIsVegOnly}
          cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
          onOpenCart={() => setIsCartOpen(true)}
          tableNumber={tableNumber} setTableNumber={setTableNumber}
          t={t}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
            activeCategory={activeCategory} 
            onSelectCategory={onSelectCategory} 
            categories={categories} 
            discounts={discounts}
            categoryOrder={categoryOrder} 
        />
        <main className="flex-1 overflow-y-auto p-3 md:p-6 bg-[#121212] no-scrollbar">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-white">
                {activeCategory === 'All' ? 'Full Menu' : activeCategory}
            </h2>
            {discounts.length > 0 && (
                <div className="bg-purple-600/20 text-purple-400 px-2 py-1 rounded-lg border border-purple-500/30 text-[10px] font-black uppercase tracking-widest animate-pulse">
                    Live Offers
                </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-24 md:pb-20">
            {filteredItems.map((item, idx) => {
                const discPrice = getDiscountedPrice(item);
                return (
                    <FoodCard 
                        key={idx}
                        item={{ ...item, price: discPrice }} 
                        originalPrice={discPrice < item.price ? item.price : undefined}
                        onSelect={() => handleItemClick(item)}
                        onAdd={() => handleQuickAdd(item)}
                        isFavorite={favorites.includes(item.dish_name)}
                        onToggleFavorite={() => toggleFavorite(item.dish_name)}
                        quantity={getItemQuantity(item.id)}
                    />
                );
            })}
          </div>
        </main>
      </div>
      <ProductModal 
        item={selectedItem} 
        originalPrice={selectedItemOriginalPrice}
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddToCart={addToCart} 
        addonCategories={addonCategories}
        t={t} 
      />
    </div>
  );
};

export default MenuView;