import React, { useState, useEffect } from 'react';
import { Home, Utensils, Info, MessageSquare, Globe, ChevronUp, Lock, X, Delete, ChevronRight } from 'lucide-react';
import { Language } from '../types';

interface FooterNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentLang: Language;
  onSetLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LANGUAGES: Language[] = ['English', 'Arabic', 'Chinese', 'French', 'Russian'];

const FooterNav: React.FC<FooterNavProps> = ({ currentView, onNavigate, currentLang, onSetLang, t }) => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  
  // Login State
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleNumClick = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleSubmit = () => {
    if (pin === '1234') {
      onNavigate('ADMIN');
      setIsLoginOpen(false);
      setPin('');
      setError(false);
    } else {
      setError(true);
      setPin('');
      // Vibrate on error if supported
      if (navigator.vibrate) navigator.vibrate(200);
    }
  };

  // Auto-submit when 4 digits reached (optional, but snappy)
  useEffect(() => {
    if (pin.length === 4) {
        // Small delay to let user see the 4th dot
        const timer = setTimeout(() => handleSubmit(), 200);
        return () => clearTimeout(timer);
    }
  }, [pin]);

  return (
    <>
      <div className="h-16 bg-[#1a1a1a] border-t border-[#2a2a2a] flex items-center justify-between px-4 md:px-8 relative z-30 shadow-lg">
        
        {/* Navigation Buttons */}
        <div className="flex gap-2 md:gap-4 overflow-x-auto no-scrollbar flex-1">
          {[
              { id: 'LANDING', icon: Home, label: t('home') },
              { id: 'MENU', icon: Utensils, label: t('menu') },
              { id: 'ABOUT', icon: Info, label: t('about') },
              { id: 'FEEDBACK', icon: MessageSquare, label: t('feedback') },
          ].map((item) => (
              <button 
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                      currentView === item.id 
                      ? 'bg-green-600 text-white' 
                      : 'text-gray-400 hover:bg-[#252525] hover:text-white'
                  }`}
              >
                  <item.icon size={18} />
                  <span className="text-sm font-medium hidden md:inline">{item.label}</span>
              </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Admin Link (Protected) */}
          <button 
              onClick={() => setIsLoginOpen(true)}
              className="text-gray-600 hover:text-red-500 p-2 transition-colors"
              title="Admin Login"
          >
              <Lock size={16} />
          </button>

          {/* Language Selector */}
          <div className="relative flex-shrink-0">
              <button 
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-lg bg-[#252525] border border-[#333]"
              >
                  <Globe size={16} />
                  <span className="text-sm font-medium hidden sm:inline">{currentLang}</span>
                  <ChevronUp size={14} className={`transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangOpen && (
                  <div className="absolute bottom-full right-0 mb-2 w-32 bg-[#252525] rounded-xl border border-[#333] shadow-xl overflow-hidden animate-fade-in-up">
                      {LANGUAGES.map((lang) => (
                          <button
                              key={lang}
                              onClick={() => {
                                  onSetLang(lang);
                                  setIsLangOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-[#333] ${currentLang === lang ? 'text-green-500 font-bold' : 'text-gray-300'}`}
                          >
                              {lang}
                          </button>
                      ))}
                  </div>
              )}
          </div>
        </div>
      </div>

      {/* Admin PIN Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#1e1e1e] w-full max-w-xs rounded-3xl border border-[#333] shadow-2xl p-6 animate-fade-in-up">
            
            <div className="flex justify-between items-center mb-6">
              <div className="text-white font-bold text-lg flex items-center gap-2">
                <Lock className="text-green-500" size={18} /> Admin Access
              </div>
              <button 
                onClick={() => {
                    setIsLoginOpen(false);
                    setPin('');
                    setError(false);
                }} 
                className="text-gray-500 hover:text-white bg-[#252525] p-1 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            {/* PIN Display */}
            <div className={`bg-[#121212] h-14 rounded-xl mb-6 flex items-center justify-center gap-4 border ${error ? 'border-red-500' : 'border-[#333]'}`}>
               {[0, 1, 2, 3].map((idx) => (
                   <div 
                     key={idx} 
                     className={`w-3 h-3 rounded-full transition-all duration-200 ${
                         idx < pin.length 
                         ? error ? 'bg-red-500' : 'bg-green-500 scale-125' 
                         : 'bg-gray-700'
                     }`}
                   />
               ))}
            </div>
            
            {error && <p className="text-red-500 text-xs text-center -mt-4 mb-4 font-bold">Incorrect PIN</p>}

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                        key={num}
                        onClick={() => handleNumClick(num.toString())}
                        className="h-14 bg-[#252525] hover:bg-[#333] active:bg-green-600 rounded-xl text-white font-bold text-xl transition-colors flex items-center justify-center border border-[#333]"
                    >
                        {num}
                    </button>
                ))}
                
                <button
                    onClick={handleBackspace}
                    className="h-14 bg-[#252525] hover:bg-red-900/30 active:bg-red-900/50 rounded-xl text-red-400 flex items-center justify-center border border-[#333]"
                >
                    <Delete size={20} />
                </button>
                
                <button
                    onClick={() => handleNumClick('0')}
                    className="h-14 bg-[#252525] hover:bg-[#333] active:bg-green-600 rounded-xl text-white font-bold text-xl transition-colors flex items-center justify-center border border-[#333]"
                >
                    0
                </button>

                <button
                    onClick={handleSubmit}
                    className="h-14 bg-green-600 hover:bg-green-500 active:scale-95 rounded-xl text-white flex items-center justify-center shadow-lg shadow-green-900/40"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default FooterNav;