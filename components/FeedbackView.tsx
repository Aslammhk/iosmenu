import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, Send, CheckCircle, ExternalLink } from 'lucide-react';

interface FeedbackViewProps {
  t: (key: string) => string;
}

const FeedbackView: React.FC<FeedbackViewProps> = ({ t }) => {
  const [submitted, setSubmitted] = useState(false);
  const [ratings, setRatings] = useState({
    food: 0,
    service: 0,
    ambiance: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleGoogleReview = () => {
      const googleReviewUrl = "https://www.google.com/search?q=Suzlon+Restro+Reviews"; 
      window.open(googleReviewUrl, '_blank');
  };

  if (submitted) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-[#121212] p-6 text-center animate-fade-in-up">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={48} className="text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Thank You!</h2>
        <p className="text-gray-400 mb-8 max-w-md">Your feedback helps us improve. We appreciate you taking the time to share your experience.</p>
        
        <div className="flex flex-col gap-4 w-full max-w-xs">
            <button onClick={handleGoogleReview} className="bg-[#1e1e1e] border border-[#333] hover:border-yellow-500 text-white px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg">
                <Star size={20} className="text-yellow-400" fill="currentColor" /> Review on Google
            </button>
        </div>
      </div>
    );
  }

  const renderStars = (category: 'food' | 'service' | 'ambiance') => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRatings(prev => ({ ...prev, [category]: star }))}
          className={`transition-transform hover:scale-110 ${star <= ratings[category] ? 'text-yellow-400' : 'text-gray-600'}`}
        >
          <Star size={28} fill={star <= ratings[category] ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex-1 h-full overflow-y-auto no-scrollbar bg-[#121212] flex items-center justify-center p-6">
      
      <div className="w-full max-w-2xl bg-[#1e1e1e] rounded-3xl p-8 shadow-2xl border border-[#333]">
        
        <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-white">We Value Your Feedback</h2>
            <button onClick={handleGoogleReview} className="text-xs flex items-center gap-1 text-yellow-500 hover:text-yellow-400 bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/30">
                <ExternalLink size={12} /> Google Review
            </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center gap-2 p-4 bg-[#121212] rounded-xl border border-[#2a2a2a]">
                    <span className="text-sm font-bold text-gray-300">{t('food_quality')}</span>
                    {renderStars('food')}
                </div>
                <div className="flex flex-col items-center gap-2 p-4 bg-[#121212] rounded-xl border border-[#2a2a2a]">
                    <span className="text-sm font-bold text-gray-300">{t('service')}</span>
                    {renderStars('service')}
                </div>
                <div className="flex flex-col items-center gap-2 p-4 bg-[#121212] rounded-xl border border-[#2a2a2a]">
                    <span className="text-sm font-bold text-gray-300">{t('ambiance')}</span>
                    {renderStars('ambiance')}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-300">Did you enjoy your meal?</label>
                <div className="flex gap-4">
                    <label className="flex-1 cursor-pointer">
                        <input type="radio" name="enjoyed" className="peer sr-only" />
                        <div className="h-12 rounded-xl bg-[#121212] border border-[#333] peer-checked:bg-green-600/20 peer-checked:border-green-500 peer-checked:text-green-500 flex items-center justify-center gap-2 text-gray-400 transition-all">
                            <ThumbsUp size={20} /> Yes, it was great!
                        </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                        <input type="radio" name="enjoyed" className="peer sr-only" />
                        <div className="h-12 rounded-xl bg-[#121212] border border-[#333] peer-checked:bg-red-600/20 peer-checked:border-red-500 peer-checked:text-red-500 flex items-center justify-center gap-2 text-gray-400 transition-all">
                            <ThumbsDown size={20} /> Not really
                        </div>
                    </label>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-300">Suggestions / Comments</label>
                <textarea 
                    rows={4} 
                    placeholder="Tell us what you liked or how we can improve..." 
                    className="w-full bg-[#121212] text-white p-4 rounded-xl border border-[#333] focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                ></textarea>
            </div>

            <button type="submit" className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/40">
                <Send size={20} /> {t('submit_feedback')}
            </button>
        </form>

      </div>
    </div>
  );
};

export default FeedbackView;