import React, { useState, useRef, useMemo } from 'react';
import { MenuItem, Branch } from '../types';
import {
  Palette, X, Loader2, Share2, AlertCircle,
  FileText, List as ListIcon, Circle, Grid3X3, LayoutTemplate, Coffee, Zap,
  Utensils, Layout, BookOpen, MapPin, Phone, Building2
} from 'lucide-react';

import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

// @ts-ignore
import { jsPDF } from 'jspdf';
// @ts-ignore
import html2canvas from 'html2canvas';

interface MenuBoardGeneratorProps {
  items: MenuItem[];
  categories: string[];
  branches: Branch[];
  onClose?: () => void;
}

type LayoutType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

const PAGE_WIDTH = 800;
const PAGE_HEIGHT = 1131;

const MenuBoardGenerator: React.FC<MenuBoardGeneratorProps> = ({
  items,
  categories,
  branches,
  onClose
}) => {
  const [layoutType, setLayoutType] = useState<LayoutType>(8);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(branches[0] || null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categories.slice(0, 3));

  const [isPreparing, setIsPreparing] = useState(false);
  const [prepProgress, setPrepProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  
  const [capturePageIndex, setCapturePageIndex] = useState<number | null>(null);
  const captureRef = useRef<HTMLDivElement>(null);

  // Scoped CSS for the PDF Renderer to ensure fonts and layouts aren't "lost"
  const rendererCss = `
    .pdf-render-root { font-family: 'Poppins', sans-serif; -webkit-font-smoothing: antialiased; }
    .pdf-arabic { font-family: 'Noto Naskh Arabic', serif !important; line-height: 1.5; }
    .pdf-page { box-sizing: border-box; }
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  `;

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const chunkArray = <T,>(arr: T[], size: number): T[][] =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );

  const menuPages = useMemo(() => {
    const chunkSizeMap: Record<number, number> = {
      1: 4, 2: 3, 3: 6, 4: 1, 5: 3, 6: 9, 7: 9, 8: 6, 9: 9, 10: 8, 11: 6
    };
    const size = chunkSizeMap[layoutType] || 6;
    const pages: { category: string; chunk: MenuItem[] }[] = [];
    const sortedCats = categories.filter(c => selectedCategories.includes(c));

    sortedCats.forEach(cat => {
      const catItems = items.filter(i => i.category === cat);
      if (catItems.length > 0) {
        const chunks = chunkArray(catItems, size);
        chunks.forEach(chunk => {
          pages.push({ category: cat, chunk });
        });
      }
    });
    return pages;
  }, [items, selectedCategories, layoutType, categories]);

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const savePdf = async (blob: Blob) => {
    const fileName = `AF_Menu_${Date.now()}.pdf`;
    if (Capacitor.isNativePlatform()) {
      try {
        const base64 = await blobToBase64(blob);
        const res = await Filesystem.writeFile({
          path: `MenuManager/${fileName}`,
          data: base64,
          directory: Directory.Documents,
          recursive: true
        });
        await Share.share({
          title: 'Menu Catalogue',
          text: 'Premium Menu PDF generated.',
          url: res.uri
        });
      } catch (e: any) {
        setErrorMessage(`Save failed: ${e.message}`);
      }
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleDownloadPDF = async () => {
    setIsPreparing(true);
    setPrepProgress(5);
    setErrorMessage(null);

    try {
      const totalPages = menuPages.length;
      if (totalPages === 0) throw new Error('No content available for PDF');

      const doc = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [PAGE_WIDTH, PAGE_HEIGHT],
        hotfixes: ["px_scaling"]
      });

      for (let i = 0; i < totalPages; i++) {
        setPrepProgress(Math.floor(10 + (i / totalPages) * 85));
        setCapturePageIndex(i);
        await new Promise(r => setTimeout(r, 800)); // Increased wait for font stability
        await document.fonts.ready;

        if (!captureRef.current) continue;

        const scale = Capacitor.isNativePlatform() ? 1.5 : 2.0; 
        const canvas = await html2canvas(captureRef.current, {
          scale,
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.85);
        if (i > 0) doc.addPage([PAGE_WIDTH, PAGE_HEIGHT], 'p');
        doc.addImage(imgData, 'JPEG', 0, 0, PAGE_WIDTH, PAGE_HEIGHT, undefined, 'FAST');
        canvas.width = 0;
        canvas.height = 0;
        setCapturePageIndex(null);
        await new Promise(r => setTimeout(r, 200));
      }

      setPrepProgress(98);
      const pdfBlob = doc.output('blob');
      await savePdf(pdfBlob);
      setIsPreparing(false);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Memory or Rendering Error');
      setIsPreparing(false);
    }
  };

  const Page: React.FC<{ children: React.ReactNode; bg?: string; className?: string }> = ({ children, bg = '#fdfaf5', className = "" }) => (
    <div
      className={`pdf-page pdf-render-root ${className}`}
      style={{
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        padding: '64px',
        background: bg,
        color: '#000',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {children}
    </div>
  );

  const renderLayoutContent = (specificIndex?: number | null) => {
    const pagesToRender = specificIndex !== undefined && specificIndex !== null 
      ? [menuPages[specificIndex]].filter(Boolean)
      : menuPages;

    return pagesToRender.map((pageData, pIdx) => {
      const { category, chunk } = pageData;
      const globalIdx = specificIndex !== undefined && specificIndex !== null ? specificIndex : pIdx;

      // -- LAYOUT 8: CATERING (Image Ref 1) --
      if (layoutType === 8) {
        return (
          <Page key={globalIdx} bg="#d9bc9b" className="!p-0 font-sans">
            <div className="bg-[#5c3e34] h-56 flex flex-col items-center justify-center relative shadow-inner">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-10 h-10 bg-[#d9bc9b] rounded-full flex items-center justify-center text-[#5c3e34] font-black">AF</div>
                 <span className="text-white text-xl font-bold tracking-[0.2em] uppercase">AF Restro</span>
              </div>
              <h2 className="text-[#d9bc9b] text-4xl font-serif italic mb-1 opacity-90">{category}</h2>
              <h1 className="text-white text-5xl font-black uppercase tracking-tighter">PREMIUM MENU</h1>
              <div className="absolute bottom-4 w-1/4 h-0.5 bg-[#d9bc9b]/30 rounded-full" />
            </div>
            <div className="p-12 grid grid-cols-2 gap-x-12 gap-y-10 flex-1">
              {chunk.map(item => (
                <div key={item.id} className="flex gap-4 items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black text-[#5c3e34] leading-tight mb-0.5 uppercase">{item.dish_name}</h3>
                    {item.arabic_name && <p className="text-xs font-arabic pdf-arabic text-[#5c3e34] font-bold mb-1" dir="rtl">{item.arabic_name}</p>}
                    <span className="text-md font-bold text-[#5c3e34] block mb-2 underline decoration-[#5c3e34]/20 underline-offset-4">Đ {item.price.toFixed(0)}</span>
                    <p className="text-[10px] text-[#5c3e34]/70 leading-relaxed line-clamp-2 italic">{item.description}</p>
                  </div>
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-2xl overflow-hidden flex-shrink-0 bg-gray-100 ring-2 ring-[#5c3e34]/10">
                    <img src={item.photo_link} crossOrigin="anonymous" className="w-full h-full object-cover" />
                  </div>
                </div>
              ))}
            </div>
            <div className="h-28 bg-[#5c3e34] p-8 flex justify-between items-center text-[#d9bc9b]">
               <div className="flex flex-col gap-1">
                  <div className="flex gap-2 items-center"><Phone size={14}/> <span className="text-[10px] font-bold uppercase tracking-widest">{selectedBranch?.phone}</span></div>
                  <div className="flex gap-2 items-center"><MapPin size={14}/> <span className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[200px]">{selectedBranch?.address}</span></div>
               </div>
               <div className="text-right">
                  <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.4em]">Section: {category}</span>
                  <p className="text-[8px] font-bold opacity-30 mt-1">Page {globalIdx + 1}</p>
               </div>
            </div>
          </Page>
        );
      }

      // -- LAYOUT 9: YELLOW POP (Image Ref 2) --
      if (layoutType === 9) {
        return (
          <Page key={globalIdx} bg="#1a1a1a" className="!p-0 font-sans">
            <div className="h-48 bg-[#ffd100] flex items-center justify-center relative overflow-hidden">
               <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 size={16} className="text-black" />
                    <span className="text-black font-black uppercase text-[10px] tracking-[0.5em]">AF RESTRO</span>
                  </div>
                  <h1 className="text-7xl font-black text-black italic tracking-tighter uppercase leading-none">Menu</h1>
                  <span className="text-black/60 font-bold uppercase text-[10px] tracking-widest mt-1">Section: {category}</span>
               </div>
               <div className="absolute -bottom-10 left-0 w-[150%] h-24 bg-[#1a1a1a] rounded-[100%] transform -rotate-2 -translate-x-1/4"></div>
            </div>
            <div className="flex-1 p-10 grid grid-cols-3 gap-x-6 gap-y-12">
              {chunk.map(item => (
                <div key={item.id} className="flex flex-col items-center relative">
                   <div className="w-full aspect-square rounded-full border-8 border-white overflow-hidden shadow-2xl bg-white ring-4 ring-[#ffd100]/20">
                      <img src={item.photo_link} crossOrigin="anonymous" className="w-full h-full object-cover" />
                   </div>
                   <div className="bg-[#ffd100] text-black px-3 py-1.5 rounded-xl -mt-5 z-10 shadow-lg font-black text-[9px] min-w-[90%] text-center uppercase truncate border-2 border-white">
                      {item.dish_name}
                   </div>
                   {item.arabic_name && (
                      <div className="mt-1 font-arabic pdf-arabic text-white/40 text-[10px] text-center" dir="rtl">{item.arabic_name}</div>
                   )}
                   <div className="mt-2 bg-white px-3 py-0.5 rounded-full border-2 border-black shadow-md transform -rotate-3">
                      <span className="text-[10px] font-black text-black">Đ {item.price.toFixed(0)}</span>
                   </div>
                </div>
              ))}
            </div>
            <div className="h-24 bg-[#ffd100] flex items-center justify-between px-10">
               <div className="flex flex-col">
                  <span className="text-black font-black uppercase text-[10px] tracking-widest">{selectedBranch?.phone}</span>
                  <span className="text-black/60 text-[8px] font-bold truncate max-w-[250px]">{selectedBranch?.address}</span>
               </div>
               <span className="text-black/40 font-black text-6xl italic tracking-tighter">0{globalIdx+1}</span>
            </div>
          </Page>
        );
      }

      // -- LAYOUT 10: CHALKBOARD (Image Ref 3) --
      if (layoutType === 10) {
        return (
          <Page key={globalIdx} bg="#121212" className="!p-0 border-[28px] border-[#252525]">
            <div className="flex-1 flex flex-col p-12 relative">
               <div className="bg-[#c41e3a] text-white px-10 py-5 rounded-md shadow-2xl mx-auto -mt-20 mb-10 flex flex-col items-center border-x-8 border-[#8b0000] transform rotate-1 min-w-[280px]">
                  <span className="text-[10px] uppercase font-bold tracking-[0.4em] opacity-80 mb-1">AF Restro Premium</span>
                  <h1 className="text-4xl font-serif font-black uppercase italic tracking-[0.2em]">{category}</h1>
               </div>
               <div className="flex-1 flex gap-12">
                  <div className="flex-1 flex flex-col gap-5">
                    {chunk.map(item => (
                      <div key={item.id} className="flex flex-col gap-1 border-b border-dashed border-white/10 pb-3">
                         <div className="flex justify-between items-baseline">
                            <div className="flex flex-col">
                               <h3 className="text-lg font-bold text-[#f8f8f8] uppercase tracking-wide leading-none">{item.dish_name}</h3>
                               {item.arabic_name && <p className="text-xs font-arabic pdf-arabic text-[#fcd34d]/60 mt-1" dir="rtl">{item.arabic_name}</p>}
                            </div>
                            <span className="text-xl font-black text-[#fcd34d] ml-4">Đ {item.price.toFixed(0)}</span>
                         </div>
                         <p className="text-[9px] text-gray-500 italic leading-relaxed line-clamp-2 max-w-[85%]">{item.description}</p>
                      </div>
                    ))}
                  </div>
                  <div className="w-36 flex flex-col gap-6 pt-4">
                     {chunk.slice(0, 4).map(item => (
                        <div key={item.id} className="w-full aspect-square rounded-full border-4 border-white/20 overflow-hidden shadow-2xl bg-black/40 relative">
                           <img src={item.photo_link} crossOrigin="anonymous" className="w-full h-full object-cover grayscale-[0.3]" />
                        </div>
                     ))}
                  </div>
               </div>
               <div className="bg-[#c41e3a] text-white px-10 py-3 rounded-md shadow-xl mx-auto -mb-16 mt-6 flex flex-col items-center gap-1 border-x-8 border-[#8b0000] min-w-[320px]">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em]">{selectedBranch?.address}</span>
                  <div className="flex items-center gap-4 border-t border-white/20 pt-1 mt-1 w-full justify-center">
                    <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1"><Phone size={10}/> {selectedBranch?.phone}</span>
                    <span className="text-[9px] font-bold opacity-50 uppercase">Page {globalIdx+1}</span>
                  </div>
               </div>
            </div>
          </Page>
        );
      }

      // -- LAYOUT 11: MODERN CARD (Image Ref 4) --
      if (layoutType === 11) {
        return (
          <Page key={globalIdx} bg="#e8e4db" className="font-sans">
            <div className="text-center mb-12">
               <div className="flex items-center justify-center gap-3 mb-2">
                 <div className="w-12 h-0.5 bg-[#4a3228]/20"></div>
                 <span className="text-sm font-black text-[#4a3228] uppercase tracking-[0.4em]">AF Restro</span>
                 <div className="w-12 h-0.5 bg-[#4a3228]/20"></div>
               </div>
               <h1 className="text-6xl font-serif font-black uppercase text-[#4a3228] mb-1">{category}</h1>
               <span className="text-[10px] font-bold text-[#4a3228]/50 uppercase tracking-[0.3em]">Signature Collection • {selectedBranch?.name}</span>
            </div>
            <div className="grid grid-cols-3 gap-8 flex-1">
              {chunk.map(item => (
                <div key={item.id} className="bg-[#f2efe9] rounded-[48px] overflow-hidden flex flex-col shadow-xl border border-[#4a3228]/10 relative">
                   <div className="h-44 w-full relative">
                      <img src={item.photo_link} crossOrigin="anonymous" className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-[#e8e4db] px-5 py-2 rounded-full border-2 border-[#4a3228]/20 shadow-lg">
                         <span className="text-sm font-black text-[#4a3228]">Đ {item.price.toFixed(0)}</span>
                      </div>
                   </div>
                   <div className="p-5 pt-10 flex-1 flex flex-col items-center text-center">
                      <div className="bg-[#4a3228]/5 px-3 py-1.5 rounded-xl mb-2 border border-[#4a3228]/10 w-full">
                         <h3 className="text-[10px] font-black uppercase text-[#4a3228] tracking-widest truncate">{item.dish_name}</h3>
                      </div>
                      {item.arabic_name && (
                        <p className="text-xs font-arabic pdf-arabic text-[#4a3228]/70 mb-2 font-bold" dir="rtl">{item.arabic_name}</p>
                      )}
                      <p className="text-[8px] text-[#4a3228]/50 italic leading-relaxed line-clamp-3 px-1">{item.description}</p>
                   </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-[#4a3228]/10 flex justify-between items-center opacity-60">
               <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-[#4a3228] uppercase tracking-[0.2em] flex items-center gap-2"><MapPin size={10}/> {selectedBranch?.address}</span>
                  <span className="text-[10px] font-bold text-[#4a3228] uppercase tracking-[0.2em] flex items-center gap-2"><Phone size={10}/> {selectedBranch?.phone}</span>
               </div>
               <div className="flex items-baseline gap-2">
                  <span className="text-[10px] font-black text-[#4a3228] uppercase tracking-widest">Section {category}</span>
                  <span className="text-2xl font-serif italic text-[#4a3228]/20">0{globalIdx+1}</span>
               </div>
            </div>
          </Page>
        );
      }

      // Legacy fallback
      return (
        <Page key={globalIdx}>
          <div className="flex justify-between items-center mb-10 border-b border-black/10 pb-6">
            <div>
              <h2 className="text-3xl font-serif font-black italic">AF Restro</h2>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{selectedBranch?.name} • {category}</p>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2 justify-end"><Phone size={12}/> {selectedBranch?.phone}</p>
               <p className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2 justify-end"><MapPin size={12}/> {selectedBranch?.address}</p>
            </div>
          </div>
          <div className="flex-1">
            {chunk.map(item => (
              <div key={item.id} className="flex gap-6 border-b border-black/5 pb-6 mb-6 last:border-0">
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={item.photo_link} crossOrigin="anonymous" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-xl font-bold uppercase">{item.dish_name}</h3>
                    <span className="text-xl font-black">Đ{item.price.toFixed(0)}</span>
                  </div>
                  {item.arabic_name && <p className="text-lg font-arabic pdf-arabic text-gray-400 mb-2" dir="rtl">{item.arabic_name}</p>}
                  <p className="text-xs text-gray-500 italic leading-relaxed line-clamp-2">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto pt-6 text-[10px] font-bold opacity-30 text-center uppercase tracking-[0.5em]">Page {globalIdx + 1}</div>
        </Page>
      );
    });
  };

  const LAYOUT_BUTTONS = [
    { type: 8, icon: Utensils, label: 'Catering' },
    { type: 9, icon: Zap, label: 'Pop' },
    { type: 10, icon: BookOpen, label: 'Chalk' },
    { type: 11, icon: Layout, label: 'Card' },
    { type: 4, icon: FileText, label: 'Magazine' },
    { type: 1, icon: Grid3X3, label: 'Grid' },
    { type: 3, icon: ListIcon, label: 'List' },
    { type: 5, icon: Circle, label: 'Round' },
    { type: 6, icon: Coffee, label: 'Artisan' },
    { type: 7, icon: LayoutTemplate, label: 'Street' },
    { type: 2, icon: LayoutTemplate, label: 'Panels' },
  ];

  return (
    <div className="flex flex-col gap-6" onClick={e => e.stopPropagation()}>
      {isPreparing && (
        <div className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center p-8 backdrop-blur-lg">
          <div className="bg-[#1e1e1e] p-8 rounded-3xl w-full max-w-sm border border-[#333] shadow-2xl text-center">
            {errorMessage ? (
              <>
                <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
                <h3 className="text-white font-bold text-xl mb-2">Export Failed</h3>
                <p className="text-gray-400 text-sm mb-6">{errorMessage}</p>
                <button onClick={() => setIsPreparing(false)} className="w-full bg-[#333] text-white py-3 rounded-xl font-bold uppercase tracking-widest text-xs">Close</button>
              </>
            ) : (
              <>
                <Loader2 className="animate-spin text-green-500 mx-auto mb-4" size={48} />
                <h3 className="text-white font-bold text-xl mb-2">Safe Exporting</h3>
                <p className="text-gray-400 text-sm mb-6">Processing {menuPages.length} pages by category to prevent mobile memory errors. This may take 30-60 seconds.</p>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-2">
                  <div className="bg-green-500 h-full transition-all duration-300" style={{ width: `${prepProgress}%` }} />
                </div>
                <p className="text-xs text-green-400 font-bold uppercase tracking-widest">{prepProgress}% Complete</p>
              </>
            )}
          </div>
        </div>
      )}

      <div className="bg-[#1e1e1e] p-6 rounded-3xl border border-[#333] shadow-2xl space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex gap-3 items-center">
            <Palette className="text-green-500" /> Catalogue Designer
          </h2>
          <div className="flex gap-2 bg-[#252525] p-1 rounded-xl border border-[#333] overflow-x-auto no-scrollbar max-w-[300px] md:max-w-none">
            {LAYOUT_BUTTONS.map(btn => (
              <button
                key={btn.type}
                title={btn.label}
                onClick={(e) => { e.stopPropagation(); setLayoutType(btn.type as any); }}
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${layoutType === btn.type ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                <btn.icon size={18} />
              </button>
            ))}
          </div>
          {onClose && <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 text-gray-500 hover:text-white"><X size={24} /></button>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Selected Categories</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto no-scrollbar bg-[#121212] p-3 rounded-2xl border border-[#333]">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={(e) => { e.stopPropagation(); toggleCategory(cat); }}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all ${selectedCategories.includes(cat) ? 'bg-green-600 text-white shadow-md' : 'bg-[#333] text-gray-500 hover:text-gray-300'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Branch Profile</label>
            <select
              value={selectedBranch?.id || ''}
              onChange={e => { e.stopPropagation(); setSelectedBranch(branches.find(b => String(b.id) === e.target.value) || null); }}
              className="w-full bg-[#121212] border border-[#333] p-4 rounded-2xl text-white font-bold outline-none focus:border-green-500"
            >
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); handleDownloadPDF(); }}
          disabled={isPreparing}
          className="w-full bg-green-600 hover:bg-green-500 py-5 rounded-2xl text-white font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-xl shadow-green-900/40 active:scale-95 transition-all"
        >
          {isPreparing ? <Loader2 className="animate-spin" /> : <Share2 size={20} />}
          {isPreparing ? 'Processing PDF...' : 'Download Category Grouped PDF'}
        </button>
      </div>

      <div className="bg-black/30 rounded-[40px] p-6 border border-[#333] overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.5em]">A4 Layout Preview ({menuPages.length} Pages)</p>
          <button onClick={(e) => { e.stopPropagation(); setIsPreviewExpanded(!isPreviewExpanded); }} className="text-green-500 font-bold text-[10px] uppercase tracking-widest bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">{isPreviewExpanded ? 'Collapse' : 'Expand'}</button>
        </div>
        <div className={`w-full flex flex-col items-center gap-10 pb-10 transition-all duration-500 ${isPreviewExpanded ? 'h-auto' : 'h-[500px]'}`}>
          <div className="origin-top flex flex-col gap-10" style={{ transform: isPreviewExpanded ? 'scale(0.8)' : 'scale(0.4)', marginBottom: isPreviewExpanded ? '0' : '-800px' }}>
            {renderLayoutContent()}
          </div>
        </div>
      </div>

      <div
        id="pdf-capture-container"
        ref={captureRef}
        style={{
          position: 'absolute',
          top: '-15000px',
          left: '-15000px',
          width: `${PAGE_WIDTH}px`,
          height: `${PAGE_HEIGHT}px`,
          backgroundColor: '#fff',
          overflow: 'hidden'
        }}
      >
        <style>{rendererCss}</style>
        {capturePageIndex !== null && renderLayoutContent(capturePageIndex)}
      </div>
    </div>
  );
};

export default MenuBoardGenerator;