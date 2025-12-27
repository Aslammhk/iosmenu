import React from 'react';
import { Search, ShoppingCart, Leaf } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isVegOnly: boolean;
  setIsVegOnly: (isVeg: boolean) => void;
  cartCount: number;
  onOpenCart: () => void;
  tableNumber: string;
  setTableNumber: (num: string) => void;
  t: (key: string) => string;
}

const ForkSpoonLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 2h2v10h-2z" />
    <path d="M11 12v8c0 1.1-.9 2-2 2H9c-1.1 0-2-.9-2-2v-8h4z" /> 
    <path d="M3 2v7c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V2" />
    <path d="M3 2v5" /><path d="M7 2v5" /><path d="M11 2v5" />
    <path d="M14.5 12.5C14.5 9 16 2 19 2s4.5 7 4.5 10.5a4.5 4.5 0 0 1-9 0z" />
    <path d="M19 12.5v9.5" />
  </svg>
);

const Header: React.FC<HeaderProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  isVegOnly, 
  setIsVegOnly, 
  cartCount, 
  onOpenCart, 
  tableNumber, 
  setTableNumber,
  t
}) => {
  return (
    <div className="bg-[#1a1a1a] px-3 py-2 border-b border-[#2a2a2a] z-20 shadow-lg sticky top-0 flex flex-col md:flex-row gap-2 md:items-center">
      
      {/* Mobile: Top Row */}
      <div className="flex items-center justify-between w-full md:w-auto">
          {/* Logo & Name */}
          <div className="flex items-center gap-2 md:mr-6">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                  <ForkSpoonLogo />
              </div>
              <div className="flex flex-col">
                  <h1 className="text-sm font-bold text-white leading-none tracking-tight">AF RESTRO</h1>
                  <span className="text-[8px] text-green-500 font-bold tracking-widest uppercase">FINE DINING</span>
              </div>
          </div>

          {/* Controls - Mobile Right Side */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex items-center gap-1 bg-[#252525] border border-[#333] px-2 py-1 rounded-lg">
                <span className="text-gray-400 text-[8px] uppercase font-bold">#</span>
                <input 
                    type="text" 
                    value={tableNumber} 
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-6 bg-transparent text-white font-bold text-center focus:outline-none text-xs"
                    placeholder="Tb"
                />
            </div>
            
            <button 
                onClick={onOpenCart}
                className="relative bg-[#252525] text-white p-2 rounded-lg border border-[#333]"
            >
                <ShoppingCart size={16} />
                {cartCount > 0 && (
                <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-[#1a1a1a]">
                    {cartCount}
                </div>
                )}
            </button>
          </div>
      </div>

      {/* Search & Veg Toggle Row */}
      <div className="flex flex-1 gap-2 items-center">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input 
            type="text" 
            placeholder={t('search_placeholder')} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#252525] text-white pl-9 pr-4 py-2 rounded-lg border border-[#333] focus:border-green-600 focus:outline-none transition-colors text-xs"
            />
        </div>

        <button 
          onClick={() => setIsVegOnly(!isVegOnly)}
          className={`flex items-center gap-1 px-2 py-2 rounded-lg border transition-all whitespace-nowrap ${
            isVegOnly 
              ? 'bg-green-900/30 border-green-500 text-green-500' 
              : 'bg-[#252525] border-[#333] text-gray-400 hover:border-gray-500'
          }`}
        >
          <Leaf size={14} fill={isVegOnly ? "currentColor" : "none"} />
          <span className="text-[10px] font-bold">{t('veg_only')}</span>
        </button>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-3">
             <div className="flex items-center gap-1 bg-[#252525] border border-[#333] px-2 py-1.5 rounded-lg">
                <span className="text-gray-400 text-[10px] uppercase font-bold">{t('table')}</span>
                <input 
                    type="text" 
                    value={tableNumber} 
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-8 bg-transparent text-white font-bold text-center focus:outline-none text-xs"
                    placeholder="#"
                />
            </div>
            <button 
                onClick={onOpenCart}
                className="relative bg-green-600 text-white p-2 rounded-lg shadow-lg hover:bg-green-500 transition-all active:scale-95"
            >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#1a1a1a]">
                    {cartCount}
                    </div>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Header;