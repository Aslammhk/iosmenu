import React, { useState, useEffect, useRef } from 'react';
import { MenuItem } from '../types';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Image, Video, Folder, Camera as CameraIcon, X, Tag, Clock, Users, Activity, Flame } from 'lucide-react';

interface MenuItemFormProps {
  onSubmit: (item: Omit<MenuItem, 'id'> | MenuItem) => void;
  onCancel: () => void;
  initialData?: MenuItem | null;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error || new Error("Unknown error reading file"));
  });
};

export const MenuItemForm: React.FC<MenuItemFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Omit<MenuItem, 'id'>>({
    dish_name: '', category: 'Main Course', price: 0, description: '', photo_link: '', video_link: '', 
    is_veg: true, bestseller: false, todays_special: false, chef_special: false, 
    spicy_level: 'Normal', ingredients: [], customization_options: [], cook_time: 1, 
    calories: 0, pricing_option: '1', tag_name: '', serves_how_many: 1, arabic_name: '', timing: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Video selection state
  const [showVideoOptions, setShowVideoOptions] = useState(false);
  const videoGalleryRef = useRef<HTMLInputElement>(null);
  const videoCameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
          dish_name: initialData.dish_name,
          category: initialData.category,
          price: initialData.price,
          description: initialData.description,
          photo_link: initialData.photo_link,
          video_link: initialData.video_link,
          is_veg: initialData.is_veg,
          bestseller: initialData.bestseller,
          todays_special: initialData.todays_special || false,
          chef_special: initialData.chef_special || false,
          spicy_level: initialData.spicy_level,
          ingredients: initialData.ingredients || [],
          customization_options: initialData.customization_options || [],
          cook_time: initialData.cook_time || 1,
          calories: initialData.calories || 0,
          pricing_option: initialData.pricing_option || '1',
          tag_name: initialData.tag_name || '',
          serves_how_many: initialData.serves_how_many || 1,
          arabic_name: initialData.arabic_name || '',
          timing: initialData.timing || ''
      });
    }
  }, [initialData]);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'photo_link' | 'video_link') => {
    const file = e.target.files?.[0];
    if (file) {
      if (fileType === 'video_link' && file.size > 50 * 1024 * 1024) {
          setErrorMsg("Video is too large. Please choose a video under 50MB.");
          return;
      }

      setIsProcessing(true);
      setErrorMsg("Processing file...");
      try {
        const base64 = await fileToBase64(file);
        setFormData(prev => ({ ...prev, [fileType]: base64 }));
        setErrorMsg('');
      } catch (error) {
        console.error(error);
        setErrorMsg("Error processing file. Try a smaller file.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const takePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90, 
        allowEditing: false, 
        resultType: CameraResultType.DataUrl, 
        source: CameraSource.Prompt
      });
      
      if (image.dataUrl) {
          setFormData(prev => ({ ...prev, photo_link: image.dataUrl! }));
          setErrorMsg('');
      }
    } catch (error) { 
        console.log('Camera cancelled or failed', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    if(initialData && initialData.id) onSubmit({ ...formData, id: initialData.id } as MenuItem);
    else onSubmit(formData);
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-2 max-h-[75vh] overflow-y-auto no-scrollbar">
        
        {/* Media Row */}
        <div className="flex flex-col md:flex-row gap-4">
            <div 
                onClick={takePhoto}
                className={`relative flex-1 h-32 rounded-2xl flex flex-col items-center justify-center cursor-pointer border-2 transition-all overflow-hidden group ${formData.photo_link ? 'border-green-500' : 'bg-green-600 border-transparent hover:bg-green-500'}`}
            >
                {formData.photo_link ? (
                    <img src={formData.photo_link} className="absolute inset-0 w-full h-full object-cover" alt="Item"/>
                ) : (
                    <>
                        <Image size={24} className="text-white mb-1" />
                        <span className="text-white font-bold text-xs uppercase tracking-wider">Item Image</span>
                    </>
                )}
            </div>

            <div 
                onClick={() => setShowVideoOptions(true)}
                className={`relative flex-1 h-32 rounded-2xl flex flex-col items-center justify-center cursor-pointer border-2 transition-all overflow-hidden group ${formData.video_link ? 'border-blue-500 bg-black' : 'bg-white border-transparent hover:bg-gray-100'}`}
            >
                {formData.video_link ? (
                    <video src={formData.video_link} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                    <>
                        <Video size={24} className="text-green-600 mb-1" />
                        <span className="text-green-600 font-bold text-xs uppercase tracking-wider">Preparation Video</span>
                    </>
                )}
            </div>
        </div>

        {/* Essential Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Item Name</label>
                <input type="text" value={formData.dish_name} onChange={e => setFormData({...formData, dish_name: e.target.value})} className="w-full bg-[#f8f8f8] border border-gray-200 rounded-xl px-4 py-3 text-black focus:border-green-600 outline-none transition-colors font-bold" placeholder="e.g. Butter Chicken" required />
            </div>
            <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Arabic Name</label>
                <input type="text" value={formData.arabic_name} onChange={e => setFormData({...formData, arabic_name: e.target.value})} className="w-full bg-[#f8f8f8] border border-gray-200 rounded-xl px-4 py-3 text-black font-arabic focus:border-green-600 outline-none text-right" placeholder="دجاج بالزبدة" dir="rtl" />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Base Price (Đ)</label>
                <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full bg-[#f8f8f8] border border-gray-200 rounded-xl px-4 py-3 text-black focus:border-green-600 outline-none font-bold" required />
            </div>
            <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Category</label>
                <input type="text" list="categories" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-[#f8f8f8] border border-gray-200 rounded-xl px-4 py-3 text-black focus:border-green-600 outline-none font-bold" required />
            </div>
        </div>

        {/* Status Toggles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f0f0f0] p-3 rounded-2xl border border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-gray-200">
                <input type="checkbox" className="w-4 h-4 accent-green-600" checked={formData.is_veg} onChange={e => setFormData({...formData, is_veg: e.target.checked})} />
                <span className="text-[10px] font-black uppercase text-green-700">Veg</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-gray-200">
                <input type="checkbox" className="w-4 h-4 accent-red-600" checked={formData.bestseller} onChange={e => setFormData({...formData, bestseller: e.target.checked})} />
                <span className="text-[10px] font-black uppercase text-red-700">Best</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-gray-200">
                <input type="checkbox" className="w-4 h-4 accent-orange-600" checked={formData.todays_special} onChange={e => setFormData({...formData, todays_special: e.target.checked})} />
                <span className="text-[10px] font-black uppercase text-orange-700">Today</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-gray-200">
                <input type="checkbox" className="w-4 h-4 accent-purple-600" checked={formData.chef_special} onChange={e => setFormData({...formData, chef_special: e.target.checked})} />
                <span className="text-[10px] font-black uppercase text-purple-700">Chef</span>
            </label>
        </div>

        {/* Detail Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Clock size={10}/> Cook (Units)</label>
                <input type="number" value={formData.cook_time} onChange={e => setFormData({...formData, cook_time: parseInt(e.target.value)})} className="w-full bg-[#f8f8f8] border border-gray-200 rounded-xl px-4 py-2 text-sm" />
            </div>
            <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Activity size={10}/> Calories</label>
                <input type="number" value={formData.calories} onChange={e => setFormData({...formData, calories: parseInt(e.target.value)})} className="w-full bg-[#f8f8f8] border border-gray-200 rounded-xl px-4 py-2 text-sm" />
            </div>
            <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Users size={10}/> Serves</label>
                <input type="number" value={formData.serves_how_many} onChange={e => setFormData({...formData, serves_how_many: parseInt(e.target.value)})} className="w-full bg-[#f8f8f8] border border-gray-200 rounded-xl px-4 py-2 text-sm" />
            </div>
            <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Flame size={10}/> Spice Level</label>
                <select value={formData.spicy_level} onChange={e => setFormData({...formData, spicy_level: e.target.value})} className="w-full bg-[#f8f8f8] border border-gray-200 rounded-xl px-4 py-2 text-sm appearance-none outline-none">
                    <option value="None">None</option>
                    <option value="Mild">Mild</option>
                    <option value="Spicy">Spicy</option>
                    <option value="Hot">Hot</option>
                    <option value="Extra Hot">Extra Hot</option>
                </select>
            </div>
        </div>

        {/* Pricing Options & Tags */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Pricing Logic</label>
                <select value={formData.pricing_option} onChange={e => setFormData({...formData, pricing_option: e.target.value})} className="w-full bg-[#f8f8f8] border border-gray-200 rounded-xl px-4 py-2 text-sm">
                    <option value="1">1 Option (Full Only)</option>
                    <option value="2">2 Options (Regular, Full)</option>
                    <option value="3">3 Options (Single, Regular, Full)</option>
                </select>
            </div>
            <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Tag size={10}/> Tag Label</label>
                <input type="text" value={formData.tag_name} onChange={e => setFormData({...formData, tag_name: e.target.value})} className="w-full bg-[#f8f8f8] border border-gray-200 rounded-xl px-4 py-2 text-sm" placeholder="e.g. New Launch" />
            </div>
            <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Available Time</label>
                <input type="text" value={formData.timing} onChange={e => setFormData({...formData, timing: e.target.value})} className="w-full bg-[#f8f8f8] border border-gray-200 rounded-xl px-4 py-2 text-sm" placeholder="e.g. 10AM - 4PM" />
            </div>
        </div>

        {/* Lists & Description */}
        <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Description</label>
            <textarea rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[#f8f8f8] border border-gray-200 rounded-xl px-4 py-3 text-black focus:border-green-600 outline-none resize-none text-sm" placeholder="A brief description of the dish..."></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Ingredients (Comma Separated)</label>
                <input type="text" value={(formData.ingredients || []).join(', ')} onChange={e => setFormData({...formData, ingredients: e.target.value.split(',').map(s=>s.trim())})} className="w-full bg-[#f8f8f8] border border-gray-200 rounded-xl px-4 py-2 text-xs" placeholder="Chicken, Butter, Garlic..." />
            </div>
            <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Customization (Comma Separated)</label>
                <input type="text" value={(formData.customization_options || []).join(', ')} onChange={e => setFormData({...formData, customization_options: e.target.value.split(',').map(s=>s.trim())})} className="w-full bg-[#f8f8f8] border border-gray-200 rounded-xl px-4 py-2 text-xs" placeholder="Extra Cheese, No Onion..." />
            </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onCancel} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-400 font-bold hover:bg-gray-50 transition-colors uppercase tracking-widest text-[10px]">Cancel</button>
            <button type="submit" disabled={isProcessing} className="flex-[2] py-3.5 rounded-xl bg-green-600 text-white font-black hover:bg-green-500 transition-colors shadow-lg shadow-green-900/40 uppercase tracking-widest text-[10px]">
                {initialData ? 'Update Database' : 'Add to Menu'}
            </button>
        </div>

        {errorMsg && <p className="text-red-500 text-xs text-center font-bold italic">{errorMsg}</p>}
    </form>

    {/* Video Source Picker */}
    {showVideoOptions && (
        <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4" onClick={() => setShowVideoOptions(false)}>
            <div className="bg-[#1e1e1e] w-full max-w-sm rounded-2xl p-6 border border-[#333] shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowVideoOptions(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
                <h3 className="text-lg font-bold text-white text-center mb-6">Select Video Source</h3>
                
                <div className="flex flex-col gap-4">
                    <button onClick={() => { videoCameraRef.current?.click(); setShowVideoOptions(false); }} className="flex items-center gap-4 p-4 bg-[#252525] hover:bg-[#333] rounded-xl transition-all group">
                        <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors"><CameraIcon size={24} /></div>
                        <div className="text-left"><h4 className="text-white font-bold text-sm">Record Video</h4><p className="text-gray-500 text-[10px]">Capture fresh preparation</p></div>
                    </button>
                    <button onClick={() => { videoGalleryRef.current?.click(); setShowVideoOptions(false); }} className="flex items-center gap-4 p-4 bg-[#252525] hover:bg-[#333] rounded-xl transition-all group">
                        <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-500 group-hover:bg-purple-600 group-hover:text-white transition-colors"><Folder size={24} /></div>
                        <div className="text-left"><h4 className="text-white font-bold text-sm">Pick from Device</h4><p className="text-gray-500 text-[10px]">Select existing footage</p></div>
                    </button>
                </div>
                <input ref={videoCameraRef} type="file" accept="video/*" capture="environment" className="hidden" onChange={e => handleFileChange(e, 'video_link')} />
                <input ref={videoGalleryRef} type="file" accept="video/*" className="hidden" onChange={e => handleFileChange(e, 'video_link')} />
            </div>
        </div>
    )}
    </>
  );
};