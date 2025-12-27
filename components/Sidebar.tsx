
import React from 'react';
import { 
  UtensilsCrossed, 
  Croissant, 
  Soup, 
  Drumstick, 
  CupSoda, 
  Menu, 
  ChefHat, 
  Fish, 
  Percent, 
  Flame, 
  Wheat, 
  Layers, 
  IceCream, 
  Utensils, 
  LayoutGrid, 
  PartyPopper,
  Tag 
} from 'lucide-react';
import { Discount } from '../types';

interface SidebarProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  categories: string[]; 
  discounts?: Discount[]; 
  categoryOrder?: string[];
}

const DEFAULT_MENU_ORDER = [
  'Party/Pre Order',
  'Special Offers',
  'Chef Special',
  'Breakfast',
  'Combo & Thali',
  'Soup',
  'Grills & Kebabs',
  'Indo Chinese',
  'Main Course',
  'Sea Food',
  'Bread & Naan',
  'Biryani & Rice',
  'Drinks',
  'Sweets'
];

const Sidebar: React.FC<SidebarProps> = ({ activeCategory, onSelectCategory, categories, discounts = [], categoryOrder = [] }) => {
  
  const getIcon = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('party')) return <PartyPopper size={20} />;
    if (lower.includes('special offers')) return <Tag size={20} />;
    if (lower.includes('chef')) return <ChefHat size={20} />;
    if (lower.includes('breakfast')) return <Croissant size={20} />;
    if (lower.includes('combo') || lower.includes('thali')) return <LayoutGrid size={20} />;
    if (lower.includes('soup')) return <Soup size={20} />;
    if (lower.includes('grill') || lower.includes('kebab')) return <Drumstick size={20} />;
    if (lower.includes('chinese') || lower.includes('noodle')) return <Flame size={20} />;
    if (lower.includes('main')) return <UtensilsCrossed size={20} />;
    if (lower.includes('sea')) return <Fish size={20} />;
    if (lower.includes('bread') || lower.includes('naan')) return <Wheat size={20} />; 
    if (lower.includes('rice') || lower.includes('biryani')) return <Layers size={20} />; 
    if (lower.includes('drink')) return <CupSoda size={20} />;
    if (lower.includes('sweet') || lower.includes('dessert') || lower.includes('ice cream')) return <IceCream size={20} />;
    return <Menu size={20} />;
  };

  const hasDiscount = (category: string) => {
      const discount = discounts.find(d => d.category === category);
      return !!discount; 
  };

  // Determine which order list to use
  const orderList = categoryOrder.length > 0 ? categoryOrder : DEFAULT_MENU_ORDER;

  // Ensure 'Party/Pre Order' and 'Special Offers' are always available if not present in custom order but exist generally
  const allCategories = Array.from(new Set(['Party/Pre Order', 'Special Offers', ...categories]));

  const sortedCategories = [...allCategories].sort((a, b) => {
      const indexA = orderList.findIndex(cat => cat.toLowerCase() === a.toLowerCase());
      const indexB = orderList.findIndex(cat => cat.toLowerCase() === b.toLowerCase());
      
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
  });

  return (
    <div className="h-full w-20 md:w-24 bg-[#1a1a1a] flex flex-col items-center py-4 border-r border-[#2a2a2a] overflow-y-auto no-scrollbar z-10 shadow-xl">
      <div className="mb-6 p-2 bg-green-600 rounded-lg text-white">
         <Utensils size={20} />
      </div>

      <div className="flex flex-col gap-4 w-full px-2">
        <button
          onClick={() => onSelectCategory('All')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-300 w-full ${
            activeCategory === 'All' 
              ? 'bg-green-600 text-white shadow-lg shadow-green-900/50 scale-105' 
              : 'text-gray-400 hover:bg-[#252525] hover:text-white'
          }`}
        >
          <Menu size={20} />
          <span className="text-[10px] mt-1.5 font-medium leading-tight">All</span>
        </button>

        {sortedCategories.map((cat) => {
          const isDiscounted = hasDiscount(cat);
          return (
            <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`relative flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-300 w-full group ${
                activeCategory === cat 
                    ? 'bg-green-600 text-white shadow-lg shadow-green-900/50 scale-105' 
                    : 'text-gray-400 hover:bg-[#252525] hover:text-white'
                }`}
            >
                {isDiscounted && (
                    <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-[8px] font-bold px-1 py-0.5 rounded-full flex items-center shadow-sm animate-pulse">
                        <Percent size={6} />
                    </div>
                )}
                <div className={`transition-transform duration-300 ${activeCategory === cat ? 'scale-110' : 'group-hover:scale-110'}`}>
                {getIcon(cat)}
                </div>
                <span className="text-[10px] mt-1.5 font-medium text-center leading-tight line-clamp-2">
                {cat.replace(' and ', ' & ').replace('Combo Meals', 'Combo')}
                </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
