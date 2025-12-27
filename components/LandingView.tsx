import React, { useState, useEffect } from 'react';
import { Utensils, Calendar, Tag, ChevronRight, Facebook, Instagram, Youtube, Video, Star, Quote } from 'lucide-react';
import { SpecialOffer, Discount, Review, MenuItem } from '../types';

interface LandingViewProps {
  onNavigate: (view: string) => void;
  t: (key: string) => string;
  offers: SpecialOffer[];
  discounts: Discount[];
  reviews: Review[];
  items: MenuItem[];
  onPreOrder: () => void; 
  onOrderNow: () => void;
  onBookEvent: () => void;
}

const IMAGES = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", 
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
];

const LandingView: React.FC<LandingViewProps> = ({ offers, discounts, reviews, items, onPreOrder, onOrderNow, onBookEvent, t }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const todaysSpecials = items.filter(item => item.todays_special);
  
  const hasOffers = todaysSpecials.length > 0 || discounts.length > 0 || offers.length > 0;

  return (
    <div className="flex-1 h-full w-full overflow-y-auto no-scrollbar bg-[#121212] relative">
      
      {/* Hero Section */}
      <div className="relative w-full h-[85vh] flex flex-col">
        {/* Background Slider */}
        <div className="absolute inset-0 z-0">
            {IMAGES.map((img, index) => (
            <div 
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            >
                <img src={img} alt="Hero" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 bg-gradient-to-t from-[#121212] via-black/40 to-transparent"></div>
            </div>
            ))}
        </div>

        {/* Action Icons - Socials Only */}
        <div className="absolute top-6 right-6 z-30">
            <div className="flex gap-2 bg-black/30 backdrop-blur-md p-1 rounded-full border border-white/10">
                <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors"><Facebook size={16} /></a>
                <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-pink-600 transition-colors"><Instagram size={16} /></a>
                <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"><Youtube size={16} /></a>
                <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-cyan-500 transition-colors" title="TikTok"><Video size={16} /></a>
            </div>
        </div>

        {/* Content */}
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 text-center mt-10">
            <div className="animate-fade-in-up">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-2 tracking-tight drop-shadow-2xl font-serif">
                AF <span className="text-green-500">RESTRO</span>
                </h1>
                <p className="text-gray-200 text-lg md:text-xl mb-12 max-w-xl mx-auto font-light tracking-wide opacity-90">
                Experience the authentic flavors of culinary excellence.
                </p>
            </div>
            
            {/* Buttons */}
            <div className="w-full max-w-md md:max-w-4xl flex flex-col md:flex-row gap-4 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <button 
                    onClick={onOrderNow}
                    className="w-full bg-green-600 hover:bg-green-500 text-white text-lg md:text-xl font-bold py-4 md:py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-green-900/40 hover:scale-105 active:scale-95 border border-green-500/50"
                >
                    <Utensils size={24} className="animate-pulse" />
                    ORDER NOW
                </button>
                
                <button 
                    onClick={onPreOrder}
                    className="w-full bg-[#1e1e1e]/80 hover:bg-[#252525] backdrop-blur-md text-yellow-400 text-lg font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg border border-yellow-500/30 hover:border-yellow-500/60"
                >
                    <Tag size={22} />
                    TODAY'S SPECIAL
                </button>
                
                <button 
                    onClick={onBookEvent}
                    className="w-full bg-[#1e1e1e]/80 hover:bg-[#252525] backdrop-blur-md text-blue-400 text-lg font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg border border-blue-500/30 hover:border-blue-500/60"
                >
                    <Calendar size={22} />
                    PARTY / PRE ORDER
                </button>
            </div>
        </div>
      </div>

      {/* Unified Offers & Specials Section */}
      {hasOffers && (
        <div className="bg-[#1a1a1a] py-8 border-t border-[#333]">
           <div className="px-6 mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Tag className="text-yellow-500" size={20}/> Offers & Specials
                </h3>
           </div>
           <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-4">
              {todaysSpecials.map((item, idx) => (
                  <div key={`ts-${idx}`} className="min-w-[200px] bg-[#1e1e1e] rounded-xl overflow-hidden relative group cursor-pointer border border-[#333] shadow-lg flex-shrink-0" onClick={onPreOrder}>
                      <div className="h-32 overflow-hidden relative">
                        <img src={item.photo_link} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.dish_name} onError={(e) => e.currentTarget.src="https://placehold.co/200"}/>
                        <div className="absolute top-2 left-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md">Today's Special</div>
                      </div>
                      <div className="p-3">
                          <h4 className="text-white font-bold text-sm leading-tight truncate">{item.dish_name}</h4>
                          <div className="flex justify-between items-center mt-1">
                             <span className="text-green-500 font-bold text-sm">Đ {item.price.toFixed(2)}</span>
                          </div>
                      </div>
                  </div>
              ))}
              {discounts.map((discount, idx) => (
                  <div key={`d-${idx}`} className="min-w-[220px] bg-[#252525] rounded-xl p-4 border border-[#333] relative flex flex-col justify-between shadow-lg hover:border-purple-500 transition-colors flex-shrink-0" onClick={onOrderNow}>
                      <div className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">
                          {discount.percentage}% OFF
                      </div>
                      <div className="mt-2">
                          <h4 className="text-white font-bold text-lg">{discount.category}</h4>
                          <p className="text-gray-400 text-xs mt-1">
                              {discount.type === 'HAPPY_HOUR' 
                                ? `Happy Hour: ${discount.startTime} - ${discount.endTime}`
                                : 'Flat discount on all items'}
                          </p>
                      </div>
                      <button className="mt-4 w-full py-2 bg-[#1a1a1a] hover:bg-[#333] text-purple-400 text-xs font-bold rounded-lg transition-colors border border-[#333]">
                          View Items
                      </button>
                  </div>
              ))}
              {offers.map((offer, idx) => (
                  <div key={`o-${idx}`} className="min-w-[280px] h-44 rounded-xl overflow-hidden relative group cursor-pointer border border-[#333] shadow-lg flex-shrink-0" onClick={onOrderNow}>
                      <img src={offer.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={offer.title}/>
                      <div className="absolute top-2 left-2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded shadow-md z-10">Exclusive</div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-4 flex flex-col justify-end">
                          <h4 className="text-white font-bold text-lg leading-tight">{offer.title}</h4>
                          <p className="text-gray-300 text-xs line-clamp-1">{offer.description}</p>
                      </div>
                  </div>
              ))}
           </div>
        </div>
      )}

      {/* Reviews Section */}
      {reviews.length > 0 && (
          <div className="bg-[#121212] py-8 border-t border-[#333]">
              <div className="px-6 mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><Quote className="text-green-500" size={20}/> {t('what_people_say')}</h3>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-4">
                  {reviews.map((review, idx) => (
                      <div key={idx} className="min-w-[280px] max-w-[280px] bg-[#1e1e1e] p-4 rounded-xl border border-[#333] relative flex-shrink-0 flex flex-col">
                          {review.source === 'google' && (
                              <div className="absolute top-4 right-4 bg-white p-1 rounded-full w-5 h-5 flex items-center justify-center z-10 shadow-md">
                                  <span className="text-[10px] font-bold text-blue-500">G</span>
                              </div>
                          )}
                          <div className="flex items-center gap-3 mb-3">
                              <img src={review.avatar || 'https://placehold.co/100/333/eee?text=U'} className="w-12 h-12 rounded-full object-cover border-2 border-[#333]" alt={review.name} onError={(e)=>e.currentTarget.src="https://placehold.co/100/333/eee?text=U"} />
                              <div>
                                  <h4 className="text-white font-bold text-sm truncate">{review.name}</h4>
                                  <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{review.date}</span>
                              </div>
                          </div>
                          {review.photo && (
                              <div className="w-full h-32 rounded-lg overflow-hidden mb-3 border border-white/5">
                                  <img src={review.photo} className="w-full h-full object-cover" alt="Review photo" />
                              </div>
                          )}
                          <div className="flex gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={14} className={i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-700"} />
                              ))}
                          </div>
                          <p className="text-gray-300 text-xs italic leading-relaxed">"{review.comment}"</p>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Upcoming Events Section */}
      <div className="bg-[#1a1a1a] py-8 border-t border-[#333]">
           <div className="px-6 mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Calendar className="text-blue-500" size={20}/> Upcoming Events</h3>
           </div>
           <div className="px-6 flex flex-col gap-4">
               <div className="bg-[#1e1e1e] p-4 rounded-xl border border-[#333] flex items-center gap-4 cursor-pointer hover:border-blue-500/50 transition-colors" onClick={onBookEvent}>
                   <div className="w-16 h-16 bg-blue-900/20 rounded-lg flex flex-col items-center justify-center text-blue-400 border border-blue-500/20">
                       <span className="text-xs font-bold uppercase">NOV</span>
                       <span className="text-xl font-bold">12</span>
                   </div>
                   <div className="flex-1">
                       <h4 className="text-white font-bold">Diwali Gala Dinner</h4>
                       <p className="text-gray-400 text-xs">Live Music & Grand Buffet</p>
                   </div>
                   <ChevronRight className="text-gray-500" size={20} />
               </div>
               
               <div className="bg-[#1e1e1e] p-4 rounded-xl border border-[#333] flex items-center gap-4 cursor-pointer hover:border-purple-500/50 transition-colors" onClick={onBookEvent}>
                   <div className="w-16 h-16 bg-purple-900/20 rounded-lg flex flex-col items-center justify-center text-purple-400 border border-purple-500/20">
                       <span className="text-xs font-bold uppercase">FRI</span>
                       <span className="text-xl font-bold">ALL</span>
                   </div>
                   <div className="flex-1">
                       <h4 className="text-white font-bold">Sufi Night</h4>
                       <p className="text-gray-400 text-xs">Live Performance & Kebabs</p>
                   </div>
                   <ChevronRight className="text-gray-500" size={20} />
               </div>
           </div>
      </div>

    </div>
  );
};

export default LandingView;