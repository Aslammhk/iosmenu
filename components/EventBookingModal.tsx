import React, { useState } from 'react';
import { X, Calendar, Users, Clock, Phone, User, MessageSquare, CheckCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../data';

interface EventBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
}

const EventBookingModal: React.FC<EventBookingModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    guests: '',
    eventType: 'Birthday',
    requests: ''
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const message = `*🎉 New Event Booking Request*\n\n` +
      `*Name:* ${formData.name}\n` +
      `*Phone:* ${formData.phone}\n` +
      `*Date:* ${formData.date}\n` +
      `*Time:* ${formData.time}\n` +
      `*Guests:* ${formData.guests}\n` +
      `*Type:* ${formData.eventType}\n` +
      `*Notes:* ${formData.requests || 'None'}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-[#1e1e1e] w-full max-w-lg rounded-2xl border border-[#333] shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-[#333] flex items-center justify-between bg-[#252525]">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="text-green-500" /> Book an Event
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto no-scrollbar flex flex-col gap-4">
          
          {/* Name & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-500" size={16} />
                <input 
                  type="text" 
                  name="name" 
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#121212] border border-[#333] rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-green-500 focus:outline-none"
                  placeholder="Your Name"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-500" size={16} />
                <input 
                  type="tel" 
                  name="phone" 
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-[#121212] border border-[#333] rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-green-500 focus:outline-none"
                  placeholder="Contact Number"
                />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Date</label>
              <div className="relative">
                <input 
                  type="date" 
                  name="date" 
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full bg-[#121212] border border-[#333] rounded-lg py-2.5 px-4 text-white focus:border-green-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 text-gray-500" size={16} />
                <input 
                  type="time" 
                  name="time" 
                  required
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full bg-[#121212] border border-[#333] rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-green-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Guests & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">No. of Guests</label>
              <div className="relative">
                <Users className="absolute left-3 top-3 text-gray-500" size={16} />
                <input 
                  type="number" 
                  name="guests" 
                  required
                  min="1"
                  value={formData.guests}
                  onChange={handleChange}
                  className="w-full bg-[#121212] border border-[#333] rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-green-500 focus:outline-none"
                  placeholder="e.g. 20"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Event Type</label>
              <select 
                name="eventType" 
                value={formData.eventType}
                onChange={handleChange}
                className="w-full bg-[#121212] border border-[#333] rounded-lg py-2.5 px-4 text-white focus:border-green-500 focus:outline-none appearance-none"
              >
                <option>Birthday Party</option>
                <option>Anniversary</option>
                <option>Corporate Dinner</option>
                <option>Wedding Reception</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          {/* Special Requests */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Special Requests</label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 text-gray-500" size={16} />
              <textarea 
                name="requests" 
                rows={3}
                value={formData.requests}
                onChange={handleChange}
                className="w-full bg-[#121212] border border-[#333] rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-green-500 focus:outline-none resize-none"
                placeholder="Dietary restrictions, decorations, etc."
              ></textarea>
            </div>
          </div>

          <button 
            type="submit" 
            className="mt-2 w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/40 active:scale-95"
          >
            <CheckCircle size={20} /> Request Booking via WhatsApp
          </button>

        </form>
      </div>
    </div>
  );
};

export default EventBookingModal;