import React, { useState, useRef, useEffect } from 'react';
import { MenuItem, SpecialOffer, Discount, Event, Review, Award, Chef, Branch, AddonCategory, AddonItem, FAQ } from '../types';
import { Trash2, Plus, Search, LogOut, Utensils, Settings, X, Percent, Users, Calendar, Trophy, MessageSquare, MapPin, Download, Upload, Star, FolderOpen, ShieldCheck, Sparkles, Camera as CameraIcon, Clock, Activity, Flame, Tag as TagIcon, Hash, Globe, Image as ImageIcon, Video as VideoIcon, Layout, Search as GoogleIcon, HelpCircle } from 'lucide-react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import MenuBoardGenerator from './MenuBoardGenerator';

interface AdminViewProps {
  items: MenuItem[];
  offers: SpecialOffer[];
  discounts: Discount[];
  events: Event[];
  reviews: Review[];
  awards: Award[];
  chefs: Chef[];
  branches: Branch[];
  addonCategories: AddonCategory[];
  categoryOrder: string[];
  isAiEnabled: boolean;
  setIsAiEnabled: (enabled: boolean) => void;
  faqs: FAQ[];
  onAddFAQ: (faq: FAQ) => void;
  onDeleteFAQ: (id: string) => void;
  onAdd: (item: MenuItem) => void;
  onEdit: (originalName: string, updatedItem: MenuItem) => void;
  onDelete: (dishName: string) => void;
  onAddOffer: (offer: SpecialOffer) => void;
  onDeleteOffer: (id: string) => void;
  onAddDiscount: (discount: Discount) => void;
  onDeleteDiscount: (id: string) => void;
  onAddEvent: (event: Event) => void;
  onDeleteEvent: (id: string | number) => void;
  onAddReview: (review: Review) => void;
  onDeleteReview: (id: string | number) => void;
  onAddAward: (award: Award) => void;
  onDeleteAward: (id: string | number) => void;
  onAddChef: (chef: Chef) => void;
  onDeleteChef: (id: number) => void;
  onAddBranch: (branch: Branch) => void;
  onDeleteBranch: (id: number) => void;
  onAddAddonCategory: (category: AddonCategory) => void;
  onDeleteAddonCategory: (id: string) => void;
  onUpdateCategoryOrder: (order: string[]) => void;
  onReset: () => void;
  onBack: () => void;
  onImportData: (data: any) => void;
  onExport: () => void;
}

const AdminView: React.FC<AdminViewProps> = (props) => {
  const [activeTab, setActiveTab] = useState<'MENU' | 'ADDONS' | 'FAQ' | 'OFFERS' | 'DISCOUNTS' | 'EVENTS' | 'CHEFS' | 'REVIEWS' | 'AWARDS' | 'LOCATIONS' | 'BOARD' | 'SETTINGS'>('MENU');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalName, setOriginalName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [categoryOrderText, setCategoryOrderText] = useState('');

  const [newAddonCatName, setNewAddonCatName] = useState('');
  const [newAddonItemName, setNewAddonItemName] = useState('');
  const [newAddonItemPrice, setNewAddonItemPrice] = useState('0');

  const [mediaPicker, setMediaPicker] = useState<{ type: 'photo' | 'video', target: 'item' | 'entity' | 'reviewer', isOpen: boolean }>({ type: 'photo', target: 'item', isOpen: false });

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newEntityData, setNewEntityData] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);
  const videoCameraInputRef = useRef<HTMLInputElement>(null);

  const categoriesList = Array.from(new Set(props.items.map(i => i.category))).sort();
  const filteredItems = props.items.filter(item => 
    item.dish_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setCategoryOrderText(props.categoryOrder.join(', '));
  }, [props.categoryOrder]);

  const handleMediaPick = async (source: 'camera' | 'gallery' | 'file' | 'url') => {
    if (source === 'url') {
      const url = prompt(`Enter ${mediaPicker.type} URL:`);
      if (url) updateMediaState(url);
      setMediaPicker({ ...mediaPicker, isOpen: false });
      return;
    }

    if (source === 'file') {
      mediaFileInputRef.current?.click();
      return;
    }

    if (mediaPicker.type === 'video') {
        if (source === 'camera') {
            videoCameraInputRef.current?.click();
        } else {
            mediaFileInputRef.current?.setAttribute('accept', 'video/*');
            mediaFileInputRef.current?.click();
        }
        setMediaPicker({ ...mediaPicker, isOpen: false });
        return;
    }

    try {
      const image = await Camera.getPhoto({
        quality: 60,
        width: 800,
        height: 800,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
        correctOrientation: true
      });
      if (image.dataUrl) updateMediaState(image.dataUrl);
    } catch (e) {
      console.log('User cancelled picker');
    }
    setMediaPicker({ ...mediaPicker, isOpen: false });
  };

  const updateMediaState = (value: string) => {
    if (mediaPicker.target === 'item' && editingItem) {
      const key = mediaPicker.type === 'photo' ? 'photo_link' : 'video_link';
      setEditingItem({ ...editingItem, [key]: value });
    } else if (mediaPicker.target === 'entity' && newEntityData) {
      const key = activeTab === 'LOCATIONS' ? 'map_image' : (activeTab === 'REVIEWS' ? 'photo' : 'image');
      setNewEntityData({ ...newEntityData, [key]: value });
    } else if (mediaPicker.target === 'reviewer' && newEntityData) {
      setNewEntityData({ ...newEntityData, avatar: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      const limit = isVideo ? 200 * 1024 * 1024 : 20 * 1024 * 1024;
      
      if (file.size > limit) {
          alert(`File is too large. Max allowed: ${isVideo ? '200MB' : '20MB'}`);
          return;
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) updateMediaState(evt.target.result as string);
        setMediaPicker({ ...mediaPicker, isOpen: false });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.dish_name || !editingItem.category) {
        return alert("Item Name and Category are required.");
    }
    setIsSaving(true);
    setTimeout(async () => {
        try {
            if (isEditMode) await props.onEdit(originalName, editingItem);
            else await props.onAdd(editingItem);
            setEditingItem(null);
            setIsEditMode(false);
        } catch (err) { alert("Error saving item: " + err); } finally { setIsSaving(false); }
    }, 50);
  };

  const handleSaveGeneric = () => {
      if (!newEntityData) return;
      const id = Date.now().toString();
      
      if (activeTab === 'OFFERS') {
          if (!newEntityData.title || !newEntityData.description || !newEntityData.image) return alert("Title, Description and Image are required for Offers.");
          props.onAddOffer({ ...newEntityData, id });
      } else if (activeTab === 'CHEFS') {
          if (!newEntityData.name || !newEntityData.role || !newEntityData.bio || !newEntityData.image) return alert("Name, Role, Bio and Image are required for Chefs.");
          props.onAddChef({ ...newEntityData, id: parseInt(id) });
      } else if (activeTab === 'AWARDS') {
          if (!newEntityData.title || !newEntityData.organization || !newEntityData.year) return alert("Title, Organization and Year are required for Awards.");
          props.onAddAward({ ...newEntityData, id });
      } else if (activeTab === 'REVIEWS') {
          if (!newEntityData.name || !newEntityData.comment || !newEntityData.rating) return alert("Name, Rating and Comment are required for Reviews.");
          props.onAddReview({ 
              ...newEntityData, 
              id, 
              date: newEntityData.date || 'Today', 
              avatar: newEntityData.avatar || 'https://placehold.co/100/333/eee?text=U', 
              source: newEntityData.source || 'app' 
          });
      } else if (activeTab === 'LOCATIONS') {
          if (!newEntityData.name || !newEntityData.address || !newEntityData.phone || !newEntityData.map_image) return alert("Branch Name, Address, Phone and Map Image are all required.");
          props.onAddBranch({ ...newEntityData, id: parseInt(id) });
      } else if (activeTab === 'EVENTS') {
          if (!newEntityData.title || !newEntityData.date || !newEntityData.description || !newEntityData.image) return alert("All fields are required for Events.");
          props.onAddEvent({ ...newEntityData, id });
      } else if (activeTab === 'DISCOUNTS') {
          if (!newEntityData.category || !newEntityData.percentage) return alert("Category and Percentage are required.");
          const discountType = (newEntityData.startTime && newEntityData.endTime) ? 'HAPPY_HOUR' : 'FLAT';
          props.onAddDiscount({ ...newEntityData, id, type: discountType });
      } else if (activeTab === 'FAQ') {
          if (!newEntityData.question || !newEntityData.answer) return alert("Question and Answer are required.");
          props.onAddFAQ({ ...newEntityData, id });
      }
      
      setShowAddModal(false);
      setNewEntityData(null);
  };

  const simulateGoogleReview = () => {
      const names = ["Ayesha Khan", "Rahul Sharma", "John Wick", "Sarah J.", "Ahmed M.", "Priya V."];
      const randomName = names[Math.floor(Math.random() * names.length)];
      setNewEntityData({
          ...newEntityData,
          name: randomName,
          source: 'google',
          rating: 5,
          date: 'Posted on Google Maps'
      });
  };

  const handleCreateAddonCategory = () => {
      if (!newAddonCatName.trim()) return;
      props.onAddAddonCategory({ id: Date.now().toString(), name: newAddonCatName, items: [] });
      setNewAddonCatName('');
  };

  const handleAddAddonItem = (catId: string) => {
      if (!newAddonItemName.trim()) return;
      const category = props.addonCategories.find(c => c.id === catId);
      if (category) {
          const newItem: AddonItem = { id: Date.now().toString(), name: newAddonItemName, price: parseFloat(newAddonItemPrice) || 0 };
          const updated = { ...category, items: [...category.items, newItem] };
          props.onDeleteAddonCategory(catId);
          props.onAddAddonCategory(updated);
          setNewAddonItemName('');
          setNewAddonItemPrice('0');
      }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = JSON.parse(evt.target?.result as string);
                props.onImportData(data);
                if (fileInputRef.current) fileInputRef.current.value = '';
            } catch (err) {
                alert("Failed to parse JSON file.");
            }
        };
        reader.readAsText(file);
    }
  };

  const handleSaveCategoryOrder = () => {
    const order = categoryOrderText.split(',').map(s => s.trim()).filter(s => s !== '');
    props.onUpdateCategoryOrder(order);
    alert("Category order updated!");
  };

  const TABS = [
      { id: 'MENU', icon: Utensils, label: 'Menu' },
      { id: 'ADDONS', icon: Sparkles, label: 'Add-ons' },
      { id: 'FAQ', icon: HelpCircle, label: 'AI FAQ' },
      { id: 'OFFERS', icon: TagIcon, label: 'Offers' },
      { id: 'DISCOUNTS', icon: Percent, label: 'Disc' },
      { id: 'EVENTS', icon: Calendar, label: 'Events' },
      { id: 'CHEFS', icon: Users, label: 'Chefs' },
      { id: 'REVIEWS', icon: MessageSquare, label: 'Reviews' },
      { id: 'AWARDS', icon: Trophy, label: 'Awards' },
      { id: 'LOCATIONS', icon: MapPin, label: 'Loc' },
      { id: 'BOARD', icon: Layout, label: 'Board' },
      { id: 'SETTINGS', icon: Settings, label: 'Set' },
  ];

  return (
    <div className="flex-1 h-full overflow-hidden bg-[#121212] flex flex-col relative">
        <div className="bg-[#1e1e1e] p-2 md:p-4 border-b border-[#333] flex flex-col gap-4 z-20 shadow-md">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={props.onBack} className="bg-[#333] hover:bg-[#444] p-2 rounded-full text-white"><LogOut size={18} /></button>
                    <h2 className="text-lg font-bold text-white">Admin Panel</h2>
                </div>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${activeTab === tab.id ? 'bg-green-600 border-green-500 text-white' : 'bg-[#252525] border-[#333] text-gray-400 hover:text-white'}`}>
                        <tab.icon size={14} /> {tab.label}
                    </button>
                ))}
            </div>
        </div>

        <input type="file" ref={mediaFileInputRef} className="hidden" onChange={handleFileChange} />
        <input type="file" ref={videoCameraInputRef} accept="video/*" capture="environment" className="hidden" onChange={handleFileChange} />
        <datalist id="cats">{categoriesList.map(cat => <option key={cat} value={cat} />)}</datalist>

        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
            {activeTab === 'MENU' && (
                <>
                    <div className="mb-4 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                            <input type="text" placeholder="Search menu..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#1e1e1e] text-white pl-9 pr-4 py-2 rounded-xl border border-[#333] focus:border-green-500 outline-none text-sm" />
                        </div>
                        <button onClick={() => { setEditingItem({ id: '', category: '', dish_name: '', price: 0, is_veg: true, bestseller: false, chef_special: false, todays_special: false, photo_link: '', video_link: '', description: '', spicy_level: 'Normal', serves_how_many: 1, cook_time: 1, calories: 0, arabic_name: '', ingredients: [], customization_options: [], pricing_option: '1', tag_name: '', timing: '', addon_category_ids: [] } as MenuItem); setIsEditMode(false); }} className="bg-green-600 text-white px-4 rounded-xl font-bold flex items-center gap-1 shadow-lg hover:bg-green-500"><Plus size={18} /> Add</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-20">
                        {filteredItems.map((item, idx) => (
                            <div key={idx} className="bg-[#1e1e1e] p-3 rounded-xl border border-[#333] flex gap-3">
                                <img src={item.photo_link} className="w-16 h-16 bg-gray-800 rounded-lg object-cover" alt={item.dish_name} onError={(e)=>e.currentTarget.src="https://placehold.co/100"} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between font-bold text-sm text-white"><span>{item.dish_name}</span><span className="text-green-500">Đ {item.price}</span></div>
                                    <p className="text-gray-500 text-[10px]">{item.category}</p>
                                    <div className="flex gap-2 mt-2">
                                        <button onClick={() => { setEditingItem(item); setOriginalName(item.dish_name); setIsEditMode(true); }} className="flex-1 bg-blue-900/30 text-blue-400 py-1 rounded text-[10px] font-bold">Edit</button>
                                        <button onClick={() => props.onDelete(item.dish_name)} className="px-2 bg-red-900/30 text-red-400 rounded"><Trash2 size={12} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'BOARD' && (
                <MenuBoardGenerator 
                  items={props.items} 
                  categories={categoriesList} 
                  branches={props.branches} 
                  onClose={() => setActiveTab('MENU')}
                />
            )}

            {activeTab === 'FAQ' && (
                <div className="space-y-4 pb-20">
                    <div className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-2xl">
                        <h4 className="text-blue-400 font-bold text-xs flex items-center gap-2 mb-2"><Sparkles size={14}/> AI Knowledge Training</h4>
                        <p className="text-[10px] text-gray-400 leading-relaxed">Enter common questions and their exact answers. The AI Assistant will use these to answer customers more accurately (e.g., about kids menus, parking, or allergens).</p>
                    </div>
                    <button onClick={() => { setShowAddModal(true); setNewEntityData({ question: '', answer: '' }); }} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg">
                        <Plus size={18}/> Add FAQ Rule
                    </button>
                    <div className="space-y-3">
                        {props.faqs.map(f => (
                            <div key={f.id} className="bg-[#1e1e1e] p-4 rounded-2xl border border-[#333] space-y-2 relative group">
                                <h4 className="text-white font-bold text-sm pr-8">Q: {f.question}</h4>
                                <p className="text-gray-400 text-xs italic">A: {f.answer}</p>
                                <button onClick={() => props.onDeleteFAQ(f.id)} className="absolute top-4 right-4 text-red-500 opacity-50 hover:opacity-100"><Trash2 size={16}/></button>
                            </div>
                        ))}
                        {props.faqs.length === 0 && <p className="text-gray-600 text-center py-10 italic text-sm">No custom AI rules added yet.</p>}
                    </div>
                </div>
            )}

            {['CHEFS', 'EVENTS', 'OFFERS', 'DISCOUNTS', 'REVIEWS', 'AWARDS', 'LOCATIONS'].includes(activeTab) && (
              <div className="pb-20 space-y-4">
                 <button onClick={() => { 
                   setShowAddModal(true); 
                   setNewEntityData(activeTab === 'CHEFS' ? { name: '', role: '', bio: '', image: '' } : 
                                   activeTab === 'EVENTS' ? { title: '', date: '', description: '', image: '' } : 
                                   activeTab === 'OFFERS' ? { title: '', description: '', image: '' } :
                                   activeTab === 'REVIEWS' ? { name: '', rating: 5, comment: '', source: 'google', avatar: '', photo: '' } :
                                   activeTab === 'AWARDS' ? { title: '', organization: '', year: '', image: '' } :
                                   activeTab === 'LOCATIONS' ? { name: '', address: '', phone: '', map_image: '' } :
                                   { category: '', percentage: 10, startTime: '', endTime: '' });
                 }} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg">
                   <Plus size={18}/> Add New {activeTab.slice(0, -1)}
                 </button>
                 <div className="grid grid-cols-1 gap-3">
                    {activeTab === 'CHEFS' && props.chefs.map(c => (
                      <div key={c.id} className="bg-[#1e1e1e] p-3 rounded-xl border border-[#333] flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <img src={c.image} className="w-10 h-10 rounded-full object-cover" alt={c.name} />
                          <div><h4 className="text-white font-bold text-sm">{c.name}</h4><p className="text-gray-500 text-[10px]">{c.role}</p></div>
                        </div>
                        <button onClick={() => props.onDeleteChef(c.id)} className="text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                      </div>
                    ))}
                    {activeTab === 'EVENTS' && props.events.map(e => (
                      <div key={e.id} className="bg-[#1e1e1e] p-3 rounded-xl border border-[#333] flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <img src={e.image} className="w-12 h-10 rounded object-cover" />
                            <div><h4 className="text-white font-bold text-sm">{e.title}</h4><p className="text-green-500 text-[10px]">{e.date}</p></div>
                        </div>
                        <button onClick={() => props.onDeleteEvent(e.id)} className="text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                      </div>
                    ))}
                    {activeTab === 'OFFERS' && props.offers.map(o => (
                      <div key={o.id} className="bg-[#1e1e1e] p-3 rounded-xl border border-[#333] flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <img src={o.image} className="w-12 h-10 rounded object-cover" alt={o.title} />
                            <div><h4 className="text-white font-bold text-sm">{o.title}</h4><p className="text-gray-500 text-[10px] line-clamp-1">{o.description}</p></div>
                        </div>
                        <button onClick={() => props.onDeleteOffer(o.id)} className="text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                      </div>
                    ))}
                    {activeTab === 'AWARDS' && props.awards.map(a => (
                      <div key={a.id} className="bg-[#1e1e1e] p-3 rounded-xl border border-[#333] flex justify-between items-center">
                        <div><h4 className="text-white font-bold text-sm">{a.title}</h4><p className="text-yellow-500 text-[10px]">{a.organization} ({a.year})</p></div>
                        <button onClick={() => props.onDeleteAward(a.id)} className="text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                      </div>
                    ))}
                    {activeTab === 'LOCATIONS' && props.branches.map(b => (
                      <div key={b.id} className="bg-[#1e1e1e] p-3 rounded-xl border border-[#333] flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <img src={b.map_image} className="w-12 h-10 rounded object-cover" alt={b.name} />
                            <div><h4 className="text-white font-bold text-sm">{b.name}</h4><p className="text-gray-500 text-[10px] line-clamp-1">{b.address}</p></div>
                        </div>
                        <button onClick={() => props.onDeleteBranch(b.id)} className="text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                      </div>
                    ))}
                    {activeTab === 'REVIEWS' && props.reviews.map(r => (
                        <div key={r.id} className="bg-[#1e1e1e] p-3 rounded-xl border border-[#333] flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <img src={r.avatar} className="w-10 h-10 rounded-full object-cover" />
                                <div><h4 className="text-white font-bold text-sm">{r.name}</h4><p className="text-yellow-500 text-[10px] flex items-center gap-1"><Star size={8}/> {r.rating} Stars - {r.source}</p></div>
                            </div>
                            <button onClick={() => props.onDeleteReview(r.id)} className="text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                        </div>
                    ))}
                    {activeTab === 'DISCOUNTS' && props.discounts.map(d => (
                      <div key={d.id} className="bg-[#1e1e1e] p-3 rounded-xl border border-[#333] flex justify-between items-center">
                        <div>
                          <h4 className="text-white font-bold text-sm">{d.category}</h4>
                          <p className="text-purple-500 text-[10px]">{d.percentage}% OFF {d.startTime ? `(${d.startTime}-${d.endTime})` : '(All Day)'}</p>
                        </div>
                        <button onClick={() => props.onDeleteDiscount(d.id)} className="text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {activeTab === 'ADDONS' && (
                <div className="space-y-6 pb-20">
                    <div className="bg-[#1e1e1e] p-4 rounded-2xl border border-[#333] space-y-4 shadow-lg">
                        <h3 className="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2"><Sparkles size={16} className="text-blue-400"/> New Add-on Category</h3>
                        <div className="flex gap-2">
                            <input value={newAddonCatName} onChange={e=>setNewAddonCatName(e.target.value)} className="flex-1 bg-[#121212] border border-[#333] rounded-xl p-3 text-sm text-white focus:border-blue-500 outline-none" placeholder="e.g. Extra Toppings" />
                            <button onClick={handleCreateAddonCategory} className="bg-blue-600 px-4 rounded-xl text-white font-bold hover:bg-blue-500"><Plus size={20}/></button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {props.addonCategories.length === 0 ? (
                            <p className="text-gray-500 text-center py-10">No addon categories yet.</p>
                        ) : props.addonCategories.map(cat => (
                            <div key={cat.id} className="bg-[#1e1e1e] p-4 rounded-2xl border border-[#333] space-y-4 shadow-md">
                                <div className="flex justify-between items-center border-b border-[#333] pb-2">
                                    <h4 className="text-green-500 font-bold">{cat.name}</h4>
                                    <button onClick={()=>props.onDeleteAddonCategory(cat.id)} className="text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                                </div>
                                <div className="space-y-2">
                                    {cat.items.map(item => (
                                        <div key={item.id} className="flex justify-between items-center bg-[#121212] p-2 rounded-lg text-xs border border-white/5">
                                            <span className="text-white">{item.name}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-gray-400 font-bold">Đ {item.price}</span>
                                                <button onClick={() => {
                                                    const updated = { ...cat, items: cat.items.filter(i => i.id !== item.id) };
                                                    props.onDeleteAddonCategory(cat.id);
                                                    props.onAddAddonCategory(updated);
                                                }} className="text-gray-600 hover:text-red-500 transition-colors"><X size={14}/></button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="grid grid-cols-5 gap-2 pt-2 border-t border-white/5">
                                        <input className="col-span-3 bg-[#121212] border border-[#333] rounded-lg p-2 text-[10px] text-white focus:border-green-500 outline-none" placeholder="Item name" value={newAddonItemName} onChange={e=>setNewAddonItemName(e.target.value)} />
                                        <input className="col-span-1 bg-[#121212] border border-[#333] rounded-lg p-2 text-[10px] text-white focus:border-green-500 outline-none" type="number" value={newAddonItemPrice} onChange={e=>setNewAddonItemPrice(e.target.value)} />
                                        <button onClick={()=>handleAddAddonItem(cat.id)} className="col-span-1 bg-green-600 text-white rounded-lg flex items-center justify-center hover:bg-green-500"><Plus size={14}/></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'SETTINGS' && (
                <div className="bg-[#1e1e1e] p-4 rounded-xl border border-[#333] space-y-6 pb-20 shadow-lg">
                    <h3 className="text-white font-bold text-lg">System Settings</h3>
                    
                    <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-xl space-y-2">
                        <h4 className="text-green-500 font-bold text-xs flex items-center gap-2 uppercase tracking-wider"><FolderOpen size={16} /> Storage Folder Location</h4>
                        <div className="bg-black/40 p-2 rounded border border-white/5 font-mono text-[9px] text-gray-400 break-all select-all">Android/data/com.suzlon.restro/files/Documents/MenuManager</div>
                    </div>

                    <div className="bg-[#252525] p-3 rounded-xl border border-[#333] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center text-purple-500"><Sparkles size={18}/></div>
                            <div>
                                <h4 className="text-white font-bold text-xs">AI Taste Guide</h4>
                                <p className="text-[9px] text-gray-500">Gemini AI Assistant</p>
                            </div>
                        </div>
                        <button onClick={() => props.setIsAiEnabled(!props.isAiEnabled)} className={`w-12 h-6 rounded-full transition-colors relative ${props.isAiEnabled ? 'bg-green-600' : 'bg-gray-700'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${props.isAiEnabled ? 'right-1' : 'left-1'}`}></div></button>
                    </div>

                    <div className="bg-[#252525] p-3 rounded-xl border border-[#333] space-y-2">
                        <label className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Category Order (Comma Separated)</label>
                        <textarea value={categoryOrderText} onChange={e=>setCategoryOrderText(e.target.value)} className="w-full bg-[#121212] border border-[#333] rounded p-2 text-xs text-white" rows={2} placeholder="Starter, Main Course..." />
                        <button onClick={handleSaveCategoryOrder} className="w-full bg-yellow-600 text-black py-2 rounded font-bold text-xs hover:bg-yellow-500">Update Order</button>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-white font-bold text-sm flex items-center gap-2 uppercase tracking-widest"><ShieldCheck size={16} className="text-green-500" /> Backup & Restore</h4>
                        <button onClick={() => props.onExport()} className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg"><Download size={20}/><div className="text-left"><div className="text-sm">Safe Backup</div><div className="text-[9px] opacity-70 uppercase tracking-widest">Fast • No Crash • Text Only</div></div></button>
                        <button onClick={() => fileInputRef.current?.click()} className="w-full bg-[#333] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-xs border border-[#444] hover:bg-[#444]"><Upload size={14}/> Restore from JSON file</button>
                        <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileImport} />
                    </div>
                    <button onClick={props.onReset} className="w-full border border-red-900 text-red-500 py-3 rounded-xl font-bold hover:bg-red-900/10">Factory Reset App</button>
                </div>
            )}
        </div>

        {mediaPicker.isOpen && (
            <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-[#1e1e1e] w-full max-w-sm rounded-3xl p-6 border border-[#333] shadow-2xl shadow-black/50 space-y-6 animate-fade-in-up">
                    <h3 className="text-white font-bold text-center">Pick {mediaPicker.type} source</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => handleMediaPick('camera')} className="bg-[#252525] p-6 rounded-2xl flex flex-col items-center gap-2 text-white hover:bg-green-600 transition-colors shadow-lg"><CameraIcon size={24}/> <span className="text-[10px] font-bold uppercase tracking-widest">Camera</span></button>
                        <button onClick={() => handleMediaPick('gallery')} className="bg-[#252525] p-6 rounded-2xl flex flex-col items-center gap-2 text-white hover:bg-purple-600 transition-colors shadow-lg"><ImageIcon size={24}/> <span className="text-[10px] font-bold uppercase tracking-widest">Gallery</span></button>
                        <button onClick={() => handleMediaPick('file')} className="bg-[#252525] p-6 rounded-2xl flex flex-col items-center gap-2 text-white hover:bg-blue-600 transition-colors shadow-lg"><FolderOpen size={24}/> <span className="text-[10px] font-bold uppercase tracking-widest">Device/Drive</span></button>
                        <button onClick={() => handleMediaPick('url')} className="bg-[#252525] p-6 rounded-2xl flex flex-col items-center gap-2 text-white hover:bg-yellow-600 transition-colors shadow-lg"><Globe size={24}/> <span className="text-[10px] font-bold uppercase tracking-widest">Web Link</span></button>
                    </div>
                    <button onClick={() => setMediaPicker({ ...mediaPicker, isOpen: false })} className="w-full py-4 text-gray-500 font-bold text-sm uppercase tracking-widest">Cancel</button>
                </div>
            </div>
        )}

        {editingItem && activeTab === 'MENU' && (
            <div className="absolute inset-0 z-50 bg-[#1a1a1a] flex flex-col">
                <div className="p-4 border-b border-[#333] flex justify-between bg-[#222]">
                    <h3 className="text-white font-bold">{isEditMode?'Edit':'New'} Menu Item</h3>
                    <button onClick={()=>setEditingItem(null)}><X size={24} className="text-gray-400 hover:text-white"/></button>
                </div>
                <form onSubmit={handleSaveItem} className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar pb-20">
                    <div className="grid grid-cols-2 gap-3">
                      <div onClick={() => setMediaPicker({ type: 'photo', target: 'item', isOpen: true })} className="h-32 bg-[#121212] border border-dashed border-[#333] rounded-xl flex flex-col items-center justify-center text-gray-500 cursor-pointer overflow-hidden relative hover:border-green-500 transition-colors">
                        {editingItem.photo_link ? <img src={editingItem.photo_link} className="w-full h-full object-cover" alt="preview" /> : <><CameraIcon size={24}/><span className="text-[8px] font-bold mt-1 uppercase tracking-widest">PHOTO</span></>}
                      </div>
                      <div onClick={() => setMediaPicker({ type: 'video', target: 'item', isOpen: true })} className="h-32 bg-[#121212] border border-dashed border-[#333] rounded-xl flex flex-col items-center justify-center text-gray-500 cursor-pointer overflow-hidden relative hover:border-blue-500 transition-colors">
                        {editingItem.video_link ? <div className="bg-blue-600 p-2 rounded text-white text-[8px] font-bold uppercase tracking-widest">Video Attached</div> : <><VideoIcon size={24}/><span className="text-[8px] font-bold mt-1 uppercase tracking-widest">VIDEO</span></>}
                      </div>
                    </div>

                    <input className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl text-white font-bold focus:border-green-500 outline-none" placeholder="Dish Name (EN)" value={editingItem.dish_name} onChange={e=>setEditingItem({...editingItem!, dish_name:e.target.value})} required />
                    <input className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl text-white font-arabic text-right focus:border-green-500 outline-none" dir="rtl" placeholder="الاسم بالعربي" value={editingItem.arabic_name} onChange={e=>setEditingItem({...editingItem!, arabic_name:e.target.value})} />
                    
                    <div className="grid grid-cols-2 gap-3">
                        <input className="w-full bg-[#121212] border border-[#333] p-3 rounded-xl text-white focus:border-green-500 outline-none" placeholder="Category" list="cats" value={editingItem.category} onChange={e=>setEditingItem({...editingItem!, category:e.target.value})} required />
                        <input className="w-full bg-[#121212] border border-[#333] p-3 rounded-xl text-white font-bold focus:border-green-500 outline-none" type="number" step="0.01" value={editingItem.price} onChange={e=>setEditingItem({...editingItem!, price:parseFloat(e.target.value)})} required />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] font-bold uppercase tracking-widest">
                        <div className="space-y-1"><label className="text-gray-500 flex items-center gap-1"><Flame size={10}/> Spicy</label><select className="w-full bg-[#121212] border border-[#333] p-2 rounded text-white outline-none" value={editingItem.spicy_level} onChange={e=>setEditingItem({...editingItem!, spicy_level:e.target.value})}><option>None</option><option>Mild</option><option>Medium</option><option>Hot</option></select></div>
                        <div className="space-y-1"><label className="text-gray-500 flex items-center gap-1"><Users size={10}/> Serves</label><input type="number" className="w-full bg-[#121212] border border-[#333] p-2 rounded text-white outline-none" value={editingItem.serves_how_many} onChange={e=>setEditingItem({...editingItem!, serves_how_many:parseInt(e.target.value)})} /></div>
                        <div className="space-y-1"><label className="text-gray-500 flex items-center gap-1"><Clock size={10}/> Cook (min)</label><input type="number" className="w-full bg-[#121212] border border-[#333] p-2 rounded text-white outline-none" value={editingItem.cook_time} onChange={e=>setEditingItem({...editingItem!, cook_time:parseInt(e.target.value)})} /></div>
                        <div className="space-y-1"><label className="text-gray-500 flex items-center gap-1"><Activity size={10}/> Calories</label><input type="number" className="w-full bg-[#121212] border border-[#333] p-2 rounded text-white outline-none" value={editingItem.calories} onChange={e=>setEditingItem({...editingItem!, calories:parseInt(e.target.value)})} /></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center gap-2 cursor-pointer bg-[#252525] p-3 rounded-xl border border-[#333]"><input type="checkbox" checked={editingItem.is_veg} onChange={e=>setEditingItem({...editingItem!, is_veg:e.target.checked})}/><span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Vegetarian</span></label>
                        <label className="flex items-center gap-2 cursor-pointer bg-[#252525] p-3 rounded-xl border border-[#333]"><input type="checkbox" checked={editingItem.bestseller} onChange={e=>setEditingItem({...editingItem!, bestseller:e.target.checked})}/><span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Bestseller</span></label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-[9px] text-gray-500 uppercase flex items-center gap-1 tracking-widest"><TagIcon size={10}/> Custom Tag</label><input type="text" className="w-full bg-[#121212] border border-[#333] p-3 rounded text-white text-xs outline-none" value={editingItem.tag_name} onChange={e=>setEditingItem({...editingItem!, tag_name:e.target.value})} placeholder="e.g. New" /></div>
                        <div className="space-y-1"><label className="text-[9px] text-gray-500 uppercase flex items-center gap-1 tracking-widest"><Hash size={10}/> Pricing Option</label><select className="w-full bg-[#121212] border border-[#333] p-3 rounded text-white text-xs outline-none" value={editingItem.pricing_option} onChange={e=>setEditingItem({...editingItem!, pricing_option:e.target.value})}><option value="1">Full</option><option value="2">Reg, Full</option><option value="3">Single, Reg, Full</option></select></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-[9px] text-gray-500 uppercase tracking-widest">Ingredients (Comma separated)</label><input type="text" className="w-full bg-[#121212] border border-[#333] p-3 rounded text-white text-xs outline-none focus:border-green-500" value={editingItem.ingredients?.join(', ') || ''} onChange={e=>setEditingItem({...editingItem!, ingredients: e.target.value.split(',').map(s=>s.trim())})} placeholder="e.g. Tomato, Basil" /></div>
                        <div className="space-y-1"><label className="text-[9px] text-gray-500 uppercase tracking-widest">Customizations (Comma separated)</label><input type="text" className="w-full bg-[#121212] border border-[#333] p-3 rounded text-white text-xs outline-none focus:border-green-500" value={editingItem.customization_options?.join(', ') || ''} onChange={e=>setEditingItem({...editingItem!, customization_options: e.target.value.split(',').map(s=>s.trim())})} placeholder="e.g. Extra Cheese, No Onions" /></div>
                    </div>

                    <div className="space-y-1"><label className="text-[9px] text-gray-500 uppercase tracking-widest">Available Timing</label><input type="text" className="w-full bg-[#121212] border border-[#333] p-3 rounded text-white text-xs outline-none focus:border-green-500" value={editingItem.timing || ''} onChange={e=>setEditingItem({...editingItem!, timing:e.target.value})} placeholder="e.g. 10:00 AM - 11:00 PM" /></div>

                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-black uppercase mb-1 block tracking-widest">Supported Add-ons</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {props.addonCategories.map(cat => (
                                <label key={cat.id} className="flex items-center gap-2 bg-[#252525] p-2 rounded-lg border border-[#333] cursor-pointer hover:border-green-500 transition-colors">
                                    <input type="checkbox" checked={editingItem.addon_category_ids?.includes(cat.id)} onChange={(e) => {
                                            const current = editingItem.addon_category_ids || [];
                                            const updated = e.target.checked ? [...current, cat.id] : current.filter(id => id !== cat.id);
                                            setEditingItem({...editingItem!, addon_category_ids: updated});
                                    }}/>
                                    <span className="text-[10px] text-white truncate font-bold">{cat.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <textarea className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl text-white text-sm outline-none focus:border-green-500" rows={3} placeholder="Description" value={editingItem.description} onChange={e=>setEditingItem({...editingItem!, description:e.target.value})}></textarea>
                    <button type="submit" disabled={isSaving} className="w-full bg-green-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-green-900/40 mb-10 hover:bg-green-500">{isSaving ? 'Saving...' : 'Save Item'}</button>
                </form>
            </div>
        )}

        {showAddModal && (
            <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-[#1e1e1e] w-full max-w-md rounded-3xl p-6 border border-[#333] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar animate-fade-in-up">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-white font-bold uppercase tracking-widest">New {activeTab.slice(0, -1)}</h3>
                        <button onClick={() => setShowAddModal(false)}><X size={24} className="text-gray-400 hover:text-white"/></button>
                    </div>
                    
                    {activeTab === 'REVIEWS' && (
                        <div className="flex gap-2 mb-2">
                            <button onClick={simulateGoogleReview} className="flex-1 bg-white/5 border border-white/10 p-2 rounded-lg text-[10px] font-bold text-gray-400 flex items-center justify-center gap-2 hover:bg-white/10 transition-all uppercase tracking-widest"><GoogleIcon size={12} className="text-blue-500"/> Google Auto-Sim</button>
                        </div>
                    )}

                    {activeTab === 'FAQ' && (
                        <>
                            <input className="w-full bg-[#121212] border border-[#333] p-3 rounded-xl text-white outline-none focus:border-green-500" placeholder="User Question (e.g. Kids Menu?)" value={newEntityData.question} onChange={e=>setNewEntityData({...newEntityData, question:e.target.value})} />
                            <textarea className="w-full bg-[#121212] border border-[#333] p-3 rounded-xl text-white text-sm outline-none focus:border-green-500" placeholder="AI's Response" rows={4} value={newEntityData.answer} onChange={e=>setNewEntityData({...newEntityData, answer:e.target.value})} />
                        </>
                    )}

                    {['CHEFS', 'EVENTS', 'OFFERS', 'AWARDS', 'REVIEWS', 'LOCATIONS'].includes(activeTab) && (
                      <div className="grid grid-cols-2 gap-3">
                         <div onClick={() => setMediaPicker({ type: 'photo', target: 'entity', isOpen: true })} className="h-28 bg-[#121212] border border-dashed border-[#333] rounded-xl flex flex-col items-center justify-center text-gray-500 cursor-pointer overflow-hidden hover:border-green-500 transition-colors">
                            {(activeTab === 'LOCATIONS' ? newEntityData?.map_image : (activeTab === 'REVIEWS' ? newEntityData?.photo : newEntityData?.image)) ? <img src={activeTab === 'LOCATIONS' ? newEntityData.map_image : (activeTab === 'REVIEWS' ? newEntityData.photo : newEntityData.image)} className="w-full h-full object-cover" alt="preview" /> : <><ImageIcon size={20}/><span className="text-[8px] font-bold mt-1 uppercase tracking-widest">Media</span></>}
                         </div>
                         {activeTab === 'REVIEWS' && (
                             <div onClick={() => setMediaPicker({ type: 'photo', target: 'reviewer', isOpen: true })} className="h-28 bg-[#121212] border border-dashed border-[#333] rounded-xl flex flex-col items-center justify-center text-gray-500 cursor-pointer overflow-hidden hover:border-blue-500 transition-colors">
                                {newEntityData?.avatar ? <img src={newEntityData.avatar} className="w-full h-full object-cover" alt="icon" /> : <><Users size={20}/><span className="text-[8px] font-bold mt-1 uppercase tracking-widest">Person Icon</span></>}
                             </div>
                         )}
                      </div>
                    )}

                    {activeTab === 'CHEFS' && (
                        <>
                          <input className="w-full bg-[#121212] border border-[#333] p-3 rounded-xl text-white outline-none focus:border-green-500" placeholder="Name" value={newEntityData.name} onChange={e=>setNewEntityData({...newEntityData, name:e.target.value})} />
                          <input className="w-full bg-[#121212] border border-[#333] p-3 rounded-xl text-white outline-none focus:border-green-500" placeholder="Role" value={newEntityData.role} onChange={e=>setNewEntityData({...newEntityData, role:e.target.value})} />
                          <textarea className="w-full bg-[#121212] border border-[#333] p-3 rounded-xl text-white text-sm outline-none focus:border-green-500" placeholder="Bio" rows={3} value={newEntityData.bio} onChange={e=>setNewEntityData({...newEntityData, bio:e.target.value})} />
                        </>
                    )}

                    {activeTab === 'EVENTS' && (
                        <>
                          <input className="w-full bg-[#121212] border border-[#333] p-3 rounded-xl text-white outline-none focus:border-green-500" placeholder="Title" value={newEntityData.title} onChange={e=>setNewEntityData({...newEntityData, title:e.target.value})} />
                          <input className="w-full bg-[#121212] border border-[#333] p-3 rounded-xl text-white outline-none focus:border-green-500" placeholder="Date (e.g. Dec 25)" value={newEntityData.date} onChange={e=>setNewEntityData({...newEntityData, date:e.target.value})} />
                          <textarea className="w-full bg-[#121212] border border-[#333] p-3 rounded-xl text-white text-sm outline-none focus:border-green-500" placeholder="Description" rows={3} value={newEntityData.description} onChange={e=>setNewEntityData({...newEntityData, description:e.target.value})} />
                        </>
                    )}

                    {activeTab === 'OFFERS' && (
                        <>
                          <input className="w-full bg-[#121212] border border-[#333] p-3 rounded-xl text-white outline-none focus:border-green-500" placeholder="Offer Title" value={newEntityData.title} onChange={e=>setNewEntityData({...newEntityData, title:e.target.value})} />
                          <textarea className="w-full bg-[#121212] border border-[#333] p-3 rounded-xl text-white text-sm outline-none focus:border-green-500" placeholder="Description" rows={3} value={newEntityData.description} onChange={e=>setNewEntityData({...newEntityData, description:e.target.value})} />
                        </>
                    )}

                    {activeTab === 'AWARDS' && (
                        <>
                          <input className="w-full bg-[#121212] border border-[#333] p-3 rounded-xl text-white outline-none focus:border-green-500" placeholder="Award Title" value={newEntityData.title} onChange={e=>setNewEntityData({...newEntityData, title:e.target.value})} />
                          <input className="w-full bg-[#121212] border border-[#333] p-3 rounded-xl text-white outline-none focus:border-green-500" placeholder="Organization" value={newEntityData.organization} onChange={e=>setNewEntityData({...newEntityData, organization:e.target.value})} />
                          <input className="w-full bg-[#121212] border border-[#333] p-3 rounded-xl text-white outline-none focus:border-green-500" placeholder="Year (e.g. 2024)" value={newEntityData.year} onChange={e=>setNewEntityData({...newEntityData, year:e.target.value})} />
                        </>
                    )}

                    {activeTab === 'LOCATIONS' && (
                        <>
                          <input className="w-full bg-[#121212] border border-[#333] p-3 rounded-xl text-white outline-none focus:border-green-500" placeholder="Branch Name" value={newEntityData.name} onChange={e=>setNewEntityData({...newEntityData, name:e.target.value})} />
                          <input className="w-full bg-[#121212] border border-[#333] p-3 rounded-xl text-white outline-none focus:border-green-500" placeholder="Address" value={newEntityData.address} onChange={e=>setNewEntityData({...newEntityData, address:e.target.value})} />
                          <input className="w-full bg-[#121212] border border-[#333] p-3 rounded-xl text-white outline-none focus:border-green-500" placeholder="Phone" value={newEntityData.phone} onChange={e=>setNewEntityData({...newEntityData, phone:e.target.value})} />
                        </>
                    )}

                    {activeTab === 'REVIEWS' && (
                        <>
                          <input className="w-full bg-[#121212] border border-[#333] p-3 rounded-xl text-white outline-none focus:border-green-500" placeholder="Reviewer Name" value={newEntityData.name} onChange={e=>setNewEntityData({...newEntityData, name:e.target.value})} />
                          <div className="grid grid-cols-2 gap-2">
                             <select className="bg-[#121212] border border-[#333] p-3 rounded-xl text-white outline-none focus:border-green-500" value={newEntityData.rating} onChange={e=>setNewEntityData({...newEntityData, rating:parseInt(e.target.value)})}>
                                {[1,2,3,4,5].map(n=><option key={n} value={n}>{n} Stars</option>)}
                             </select>
                             <select className="bg-[#121212] border border-[#333] p-3 rounded-xl text-white outline-none focus:border-green-500" value={newEntityData.source} onChange={e=>setNewEntityData({...newEntityData, source:e.target.value})}>
                                <option value="google">Google Map</option>
                                <option value="app">Internal App</option>
                             </select>
                          </div>
                          <textarea className="w-full bg-[#121212] border border-[#333] p-3 rounded-xl text-white text-sm outline-none focus:border-green-500" placeholder="Comment" rows={3} value={newEntityData.comment} onChange={e=>setNewEntityData({...newEntityData, comment:e.target.value})} />
                        </>
                    )}

                    {activeTab === 'DISCOUNTS' && (
                      <div className="space-y-4">
                        <select className="w-full bg-[#121212] border border-[#333] p-3 rounded-xl text-white outline-none focus:border-green-500" value={newEntityData.category} onChange={e=>setNewEntityData({...newEntityData, category:e.target.value})}>
                            <option value="">Select Category</option>
                            {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <div className="flex items-center gap-3">
                          <label className="text-gray-500 text-xs font-bold uppercase tracking-widest">Value %</label>
                          <input type="number" className="flex-1 bg-[#121212] border border-[#333] p-3 rounded-xl text-white outline-none focus:border-green-500" value={newEntityData.percentage} onChange={e=>setNewEntityData({...newEntityData, percentage:parseInt(e.target.value)})} />
                        </div>
                        <div className="bg-[#252525] p-3 rounded-xl border border-[#333] space-y-2">
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Happy Hour Timing (Leave empty for Flat Discount)</p>
                           <div className="grid grid-cols-2 gap-2">
                             <input type="time" className="bg-[#121212] border border-[#333] p-2 rounded text-white text-xs outline-none" value={newEntityData.startTime || ''} onChange={e=>setNewEntityData({...newEntityData, startTime:e.target.value})} />
                             <input type="time" className="bg-[#121212] border border-[#333] p-2 rounded text-white text-xs outline-none" value={newEntityData.endTime || ''} onChange={e=>setNewEntityData({...newEntityData, endTime:e.target.value})} />
                           </div>
                        </div>
                      </div>
                    )}

                    <button onClick={handleSaveGeneric} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg hover:bg-green-500">Confirm & Add</button>
                </div>
            </div>
        )}
    </div>
  );
};

export default AdminView;