
import React, { useState } from 'react';
import { MenuItem } from '../types';
import { PlayCircle, X, Search } from 'lucide-react';

interface ViewPageProps {
  items: MenuItem[];
}

export const ViewPage: React.FC<ViewPageProps> = ({ items }) => {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category))).sort()];
  
  const filteredItems = items.filter(item => 
    (selectedCategory === 'All' || item.category === selectedCategory) &&
    item.dish_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#121212]">
      
      {/* Header */}
      <div className="p-4 bg-[#1a1a1a] border-b border-[#333] flex gap-4 items-center sticky top-0 z-20 shadow-md">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-500" size={18} />
            <input 
                type="text" 
                placeholder="Search Item" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#121212] border border-[#333] rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-green-500 outline-none text-sm"
            />
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar Categories */}
          <div className="w-24 bg-[#1a1a1a] border-r border-[#333] overflow-y-auto no-scrollbar py-4 flex flex-col gap-2 items-center">
              {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${selectedCategory === cat ? 'bg-green-600 text-white shadow-lg' : 'bg-[#252525] text-gray-400 hover:bg-[#333]'}`}
                  >
                      <div className="text-[10px] font-bold text-center leading-tight px-1">{cat}</div>
                  </button>
              ))}
          </div>

          {/* Grid Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar">
              <h2 className="text-2xl font-bold text-white mb-6">
                  {selectedCategory === 'All' ? 'Full Menu' : selectedCategory}
              </h2>
              
              {filteredItems.length === 0 ? (
                  <div className="text-gray-500 text-center mt-20">No items found.</div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                      {filteredItems.map(item => (
                          <div key={item.id} className="bg-[#1e1e1e] rounded-2xl overflow-hidden border border-[#333] hover:border-gray-500 transition-all group">
                              <div className="h-40 relative bg-gray-800">
                                  <img src={item.photo_link || 'https://placehold.co/400x300/333/666?text=No+Image'} alt={item.dish_name} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
                                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-white font-bold text-sm">
                                      ${item.price.toFixed(2)}
                                  </div>
                                  {item.video_link && (
                                      <button 
                                          onClick={() => setPlayingVideo(item.video_link)}
                                          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors group"
                                      >
                                          <PlayCircle size={40} className="text-white opacity-80 group-hover:scale-110 transition-transform" />
                                      </button>
                                  )}
                              </div>
                              <div className="p-4">
                                  <h3 className="font-bold text-white text-lg truncate">{item.dish_name}</h3>
                                  <p className="text-gray-400 text-xs mt-1 line-clamp-2 h-8">{item.description}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>

      {playingVideo && (
          <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
              <button onClick={() => setPlayingVideo(null)} className="absolute top-6 right-6 text-white p-2 bg-gray-800 rounded-full z-50">
                  <X size={24} />
              </button>
              <video src={playingVideo} controls autoPlay className="max-w-full max-h-full" />
          </div>
      )}
    </div>
  );
};
