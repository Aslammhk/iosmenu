import React from 'react';
import { MenuItem } from '../types';
import { Plus, Video } from 'lucide-react';

interface FoodCardProps {
  item: MenuItem;
  originalPrice?: number;
  onSelect: (item: MenuItem) => void;
  onAdd: (item: MenuItem) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  quantity?: number;
}

// Custom Chef Special Icon (Cloche style)
const ChefSpecialIcon = ({ size = 18 }: { size?: number }) => (
  <div className="bg-[#1a1a1a] p-1.5 rounded-full border border-white/10 shadow-lg flex items-center justify-center">
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4C7.58172 4 4 7.58172 4 12H20C20 7.58172 16.4183 4 12 4Z" fill="white" />
      <path d="M2 14H22V15C22 15.5523 21.5523 16 21 16H3C24.4477 16 2 15.5523 2 15V14Z" fill="white" />
      <circle cx="12" cy="3" r="1.5" fill="white" />
      <path d="M6 18C6 19.1046 8.68629 20 12 20C15.3137 20 18 19.1046 18 18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </div>
);

// Custom Bestseller Icon (Thumbs up badge style)
const BestsellerIcon = ({ size = 18 }: { size?: number }) => (
  <div className="bg-red-600 p-1.5 rounded-lg border border-white/20 shadow-lg flex flex-col items-center justify-center -space-y-0.5">
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 9V5C14 4.20435 13.6839 3.44129 13.1213 2.87868C12.5587 2.31607 11.7956 2 11 2C10.45 2 10 2.45 10 3V8H4C2.9 8 2 8.9 2 10V12C2 12.26 2.05 12.5 2.14 12.72L5.14 19.72C5.32 20.14 5.74 20.44 6.22 20.44H17C18.1 20.44 19 19.54 19 18.44V10.44C19 9.89 18.78 9.39 18.41 9.03L14 4.62V9H14Z" />
    </svg>
    <span className="text-[6px] font-black text-white leading-none uppercase">Best</span>
  </div>
);

// Improved Spicy Icon System
const SpicyIcon = ({ level, size = 18 }: { level: string; size?: number }) => {
  const normalizedLevel = level.toLowerCase();
  
  let color = "text-orange-500";
  let flames = 1;

  if (normalizedLevel.includes('mild')) {
    color = "text-green-500";
    flames = 1;
  } else if (normalizedLevel.includes('extra hot')) {
    color = "text-red-600";
    flames = 3;
  } else if (normalizedLevel.includes('hot')) {
    color = "text-red-500";
    flames = 2;
  }

  return (
    <div className="bg-black/60 backdrop-blur-md px-1.5 py-1 rounded-full border border-white/10 flex items-center gap-1 shadow-xl">
      <div className="flex -space-x-1">
        {/* Chili SVG */}
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={color} xmlns="http://www.w3.org/2000/svg">
          <path d="M19.64 4.36C18.89 3.61 17.89 3.22 16.84 3.27C16.34 3.29 15.9 3.66 15.82 4.15C15.7 4.93 15.1 5.53 14.32 5.65C13.83 5.73 13.46 6.17 13.44 6.67C13.39 7.72 13.78 8.72 14.53 9.47C15.28 10.22 16.28 10.61 17.33 10.56C17.83 10.54 18.27 10.17 18.35 9.68C18.47 8.9 19.07 8.3 19.85 8.18C20.34 8.1 20.71 7.66 20.73 7.16C20.78 6.11 20.39 5.11 19.64 4.36Z" transform="rotate(-15 12 12)"/>
          <path d="M12.44 18.56C7.3 18.56 3.12 14.38 3.12 9.24C3.12 8.58 3.19 7.94 3.32 7.32C3.42 6.84 3.14 6.36 2.67 6.22C2.19 6.08 1.69 6.34 1.54 6.81C1.36 7.58 1.27 8.39 1.27 9.24C1.27 15.4 6.28 20.41 12.44 20.41C13.11 20.41 13.77 20.35 14.41 20.24C14.89 20.15 15.21 19.68 15.12 19.2C15.03 18.72 14.56 18.4 14.08 18.49C13.55 18.54 13 18.56 12.44 18.56Z" transform="rotate(-15 12 12)"/>
        </svg>
        
        {/* Flames Indicator */}
        <div className="flex items-center -mb-0.5">
          {[...Array(flames)].map((_, i) => (
            <svg key={i} width={size/1.8} height={size/1.8} viewBox="0 0 24 24" fill="currentColor" className={`${color} ${i > 0 ? '-ml-0.5' : ''}`} xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C12 2 7 7 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 7 12 2 12 2Z" />
            </svg>
          ))}
        </div>
      </div>
    </div>
  );
};

const FoodCard: React.FC<FoodCardProps> = ({ item, originalPrice, onSelect, onAdd, quantity = 0 }) => {
  const spicyLevel = item.spicy_level || 'None';
  const hasSpicy = !['Normal', 'None', '', 'Mild (No Chilli)'].includes(spicyLevel);

  return (
    <div 
        className={`relative h-48 md:h-64 rounded-3xl overflow-hidden shadow-lg group cursor-pointer border transition-all duration-300 ${quantity > 0 ? 'border-green-500 border-2 shadow-green-500/20' : 'border-[#333]'}`}
        onClick={() => onSelect(item)}
    >
      {/* Background Image */}
      <img 
          src={item.photo_link} 
          alt={item.dish_name} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://placehold.co/400x300/252525/444444?text=No+Image";
          }}
      />
      
      {/* Gradient Overlay - Top and Bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90" />

      {/* Top Left: Names */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start max-w-[75%]">
          <h3 className="text-white font-bold text-sm md:text-base leading-tight drop-shadow-md bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/10">
            {item.dish_name}
          </h3>
          
          {item.arabic_name && (
              <p className="text-green-400 font-arabic text-[10px] md:text-xs drop-shadow-md tracking-wide bg-black/40 px-2 py-0.5 rounded-lg backdrop-blur-sm border border-white/10">
                {item.arabic_name}
              </p>
          )}
      </div>

      {/* Add Button / Quantity Badge - Top Right */}
      {quantity > 0 ? (
          <div className="absolute top-3 right-3 z-20 w-9 h-9 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg font-bold border-2 border-white animate-bounce">
              {quantity}
          </div>
      ) : (
          <button 
              onClick={(e) => { e.stopPropagation(); onAdd(item); }}
              className="absolute top-3 right-3 z-20 w-9 h-9 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:bg-green-500 hover:text-white transition-all active:scale-95"
          >
              <Plus size={18} strokeWidth={3} />
          </button>
      )}

      {/* Bottom Area */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-end z-10">
          
          {/* Icons Group - Bottom Left */}
          <div className="flex flex-wrap items-center gap-2 max-w-[70%] drop-shadow-lg">
            {item.chef_special && (
                <div title="Chef Special">
                    <ChefSpecialIcon />
                </div>
            )}
            {item.bestseller && (
                <div title="Bestseller">
                    <BestsellerIcon />
                </div>
            )}
            {hasSpicy && (
                <SpicyIcon level={spicyLevel} />
            )}
            {item.video_link && (
                <div className="bg-blue-600/90 p-1.5 rounded-full backdrop-blur-sm border border-blue-400/50 shadow-xl animate-pulse text-white">
                    <Video size={16} />
                </div>
            )}
          </div>

          {/* Price - Bottom Right */}
          <div className="flex flex-col items-end">
              {originalPrice && (
                 <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full mb-1 animate-pulse shadow-sm whitespace-nowrap uppercase tracking-widest">
                    Offer
                 </span>
              )}
              <div className="bg-black/60 px-2 py-1 rounded-xl backdrop-blur-md border border-white/5 flex flex-col items-end">
                <span className="text-white font-black text-sm md:text-base leading-none">
                    Đ {item.price.toFixed(2)}
                </span>
                {originalPrice && (
                    <span className="text-gray-400 text-[10px] font-bold line-through decoration-red-500/50 -mt-0.5 whitespace-nowrap opacity-70">
                        Đ {originalPrice.toFixed(2)}
                    </span>
                )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default FoodCard;