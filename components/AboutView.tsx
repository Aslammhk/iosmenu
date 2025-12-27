
import React from 'react';
import { MapPin, Phone, Calendar, Clock, Trophy } from 'lucide-react';
import { Event, Award, Chef, Branch } from '../types';

interface AboutViewProps {
  t: (key: string) => string;
  onBookEvent: () => void;
  events: Event[];
  awards: Award[];
  chefs: Chef[];
  branches: Branch[];
}

const AboutView: React.FC<AboutViewProps> = ({ t, onBookEvent, events, awards, chefs, branches }) => {
  return (
    <div className="flex-1 h-full overflow-y-auto no-scrollbar bg-[#121212] p-6 md:p-12">
      
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">{t('about_title')} <span className="text-green-500">AF Restro</span></h1>
        <p className="text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Founded in 2010, AF Restro brings the authentic flavors of India to your plate. 
            We believe in using fresh, locally sourced ingredients combined with traditional cooking 
            techniques to create a culinary experience that stays with you.
        </p>
      </div>

      {/* Chefs Section */}
      {chefs && chefs.length > 0 && (
        <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-green-500 pl-4">{t('meet_chefs')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {chefs.map(chef => (
                    <div key={chef.id} className="bg-[#1e1e1e] rounded-2xl overflow-hidden group">
                        <div className="h-64 overflow-hidden">
                            <img src={chef.image} alt={chef.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => e.currentTarget.src="https://placehold.co/400"} />
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-white">{chef.name}</h3>
                            <p className="text-green-500 text-sm font-medium mb-3">{chef.role}</p>
                            <p className="text-gray-400 text-sm">{chef.bio}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
      
      {/* Awards Section */}
      {awards && awards.length > 0 && (
          <div className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-green-500 pl-4">Our Accolades</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {awards.map(award => (
                      <div key={award.id} className="bg-[#1e1e1e] p-6 rounded-2xl flex flex-col items-center text-center border border-[#333] hover:border-yellow-500/50 transition-colors">
                          <Trophy size={32} className="text-yellow-500 mb-3" />
                          <h4 className="text-white font-bold text-md">{award.title}</h4>
                          <p className="text-gray-400 text-sm">{award.organization}</p>
                          <p className="text-gray-500 text-xs mt-1">{award.year}</p>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Events Section */}
      {events && events.length > 0 && (
        <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-green-500 pl-4">{t('upcoming_events')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map(event => (
                    <div key={event.id} className="bg-[#1e1e1e] rounded-2xl p-4 flex gap-4 border border-[#333] hover:bg-[#252525] transition-colors cursor-pointer" onClick={onBookEvent}>
                        <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                            <img src={event.image} alt={event.title} className="w-full h-full object-cover" onError={(e) => e.currentTarget.src="https://placehold.co/400"} />
                        </div>
                        <div className="flex flex-col justify-center">
                            <h3 className="text-lg font-bold text-white mb-1">{event.title}</h3>
                            <div className="flex items-center gap-2 text-green-500 text-sm mb-2">
                                <Calendar size={14} /> {event.date}
                            </div>
                            <p className="text-gray-400 text-sm line-clamp-2">{event.description}</p>
                            <button className="mt-2 text-white text-xs font-bold uppercase tracking-wide bg-green-600 w-fit px-3 py-1 rounded-md">{t('book_now')}</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Locations Section */}
      {branches && branches.length > 0 && (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-green-500 pl-4">{t('locations')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {branches.map(branch => (
                    <div key={branch.id} className="bg-[#1e1e1e] rounded-2xl overflow-hidden border border-[#333]">
                        <div className="h-48 relative">
                            <img src={branch.map_image} alt="Map" className="w-full h-full object-cover opacity-60" onError={(e) => e.currentTarget.src="https://placehold.co/600x400"} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-red-500 p-2 rounded-full animate-bounce shadow-lg">
                                    <MapPin size={24} fill="white" className="text-white" />
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-2">{branch.name}</h3>
                            <div className="flex items-start gap-3 text-gray-400 mb-2">
                                <MapPin size={18} className="mt-1 flex-shrink-0 text-green-500" />
                                <p>{branch.address}</p>
                            </div>
                            <div className="flex items-center gap-3 text-gray-400 mb-4">
                                <Phone size={18} className="text-green-500" />
                                <p>{branch.phone}</p>
                            </div>
                            <div className="flex items-center gap-3 text-gray-400">
                                <Clock size={18} className="text-green-500" />
                                <p>Open: 10:00 AM - 11:00 PM</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

    </div>
  );
};

export default AboutView;
