import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Loader2, Utensils } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { MenuItem, FAQ } from '../types';
import { BRANCHES } from '../data';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIAssistantProps {
  menu: MenuItem[];
  faqs?: FAQ[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ menu, faqs = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const QUICK_QUESTIONS = [
    "Recommend something spicy!",
    "What's good for kids?",
    "Do you have vegan options?",
    "Where are you located?",
    "Opening hours?"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleSendMessage = async (customMessage?: string) => {
    const userMessage = customMessage || input;
    if (!userMessage.trim()) return;

    const newMessage: Message = { role: 'user', text: userMessage };
    const updatedHistory = [...chatHistory, newMessage];
    setChatHistory(updatedHistory);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const menuSummary = menu
        .slice(0, 80) // Increased limit for Pro model
        .map(item => `- ${item.dish_name} (${item.category}): ${item.description || 'No description'}. Price: Đ ${item.price}. Veg: ${item.is_veg}. Spice: ${item.spicy_level || 'None'}`)
        .join("\n");

      const branchInfo = BRANCHES.map(b => `- ${b.name}: ${b.address} (Phone: ${b.phone})`).join("\n");
      const customFAQContext = faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");

      const systemInstruction = `You are "Executive Chef Gemini", the elite digital concierge and culinary expert for AF Restro.
        
        GOAL:
        Provide a world-class, premium dining consultation. Use your deep reasoning to suggest pairings, explain flavors, and handle dietary needs with grace.

        KNOWLEDGE BASE:
        ${customFAQContext}

        RESTAURANT CONTEXT:
        - Cuisine: Premium Indian and International fusion with a focus on authentic spices.
        - Detailed Menu Items:
        ${menuSummary}
        - Branch Locations:
        ${branchInfo}
        - Standard Hours: Open daily 10:00 AM - 11:00 PM.

        DIETARY CONSULTATION RULES:
        1. FOR CHILDREN: Prioritize items labeled "Mild" or "None" in spice. Focus on safety and simple, satisfying flavors.
        2. SPICE SENSITIVITY: If a guest requests low spice, strictly filter out "Medium", "Spicy", or "Hot" items.
        3. VEGETARIAN/VEGAN: Respect the "Veg: true" property.
        4. ALLERGENS: If an ingredient is listed, warn the user if they mention an allergy.

        TONE & STYLE:
        - Persona: Elite, professional, highly knowledgeable, yet warm and welcoming.
        - Formatting: Use Markdown for **Strong Emphasis** and bullet points.
        - Response Length: Concise (under 100 words), but meaningful.
        - Closing: Always include a sophisticated closing (e.g., "Wishing you a grand culinary experience.").

        INSTRUCTIONS:
        - Use the gemini-3-pro-preview advanced reasoning capabilities to analyze the user's intent.
        - If you don't know an answer based on context, gracefully offer to connect them with our human staff via phone.`;

      const promptString = updatedHistory
        .map(m => `${m.role === 'user' ? 'Customer' : 'Chef'}: ${m.text}`)
        .join('\n') + '\nChef:';

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: promptString,
        config: {
          systemInstruction,
          temperature: 0.8,
          // Using maximum thinking budget for the Pro model to ensure high quality reasoning as requested
          thinkingConfig: { thinkingBudget: 32768 }
        }
      });

      const modelText = response.text || "I apologize, my culinary focus was momentarily broken. How else may I serve you today?";
      setChatHistory(prev => [...prev, { role: 'model', text: modelText }]);
    } catch (error) {
      console.error("AI Error:", error);
      setChatHistory(prev => [...prev, { role: 'model', text: "A small kitchen incident has occurred. Please forgive me and try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 z-40 w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-800 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group"
      >
        <Sparkles className="group-hover:animate-pulse" size={24} />
        <div className="absolute -top-1 -right-1 bg-red-500 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-[#121212] animate-bounce">
          AI PRO
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] w-full max-w-md h-[80vh] md:h-[650px] md:rounded-3xl border border-[#333] shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
            
            <div className="p-4 bg-[#222] border-b border-[#333] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center text-green-500">
                  <Utensils size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Executive Chef Gemini</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Pro Concierge</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-2">
                <X size={20} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-[#121212]/50">
              {chatHistory.length === 0 && (
                <div className="flex flex-col items-center text-center py-10 space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-green-500 mb-2">
                    <Sparkles size={32} />
                  </div>
                  <h4 className="text-white font-bold tracking-tight">A Taste of Excellence Awaits</h4>
                  <p className="text-gray-400 text-xs px-10 leading-relaxed">I am your expert AI host, powered by the latest Gemini 3 technology. How may I refine your dining experience today?</p>
                </div>
              )}

              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-green-600 text-white rounded-tr-none' 
                      : 'bg-[#252525] text-gray-200 border border-[#333] rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#252525] p-3 rounded-2xl rounded-tl-none border border-[#333] flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-green-500" />
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Chef is crafting a response...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#1e1e1e] border-t border-[#333] space-y-4">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSendMessage(q)}
                    className="flex-shrink-0 bg-[#252525] hover:bg-[#333] border border-[#444] text-gray-300 px-3 py-1.5 rounded-full text-[10px] font-bold transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask your concierge..."
                  className="flex-1 bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-white text-sm focus:border-green-500 outline-none transition-all"
                />
                <button 
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !input.trim()}
                  className="bg-green-600 hover:bg-green-500 disabled:bg-[#333] text-white p-3 rounded-xl transition-all shadow-lg"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;