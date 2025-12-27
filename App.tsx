import { useState, useEffect, useRef } from 'react';
import AdminView from './components/AdminView';
import LandingView from './components/LandingView';
import MenuView from './components/MenuView';
import FooterNav from './components/FooterNav';
import AboutView from './components/AboutView';
import FeedbackView from './components/FeedbackView';
import CartSidebar from './components/CartSidebar';
import EventBookingModal from './components/EventBookingModal';
import AIAssistant from './components/AIAssistant';
import { MenuItem, CartItem, Language, Chef, Branch, AddonCategory, SelectedAddon, FAQ, Discount } from './types';
import { loadExternalData, saveData, saveMediaToDevice, loadAppData, saveAppData, AppData, exportData } from './utils/externalData';
import { MENU_DATA, TRANSLATIONS, OFFERS, DISCOUNTS, EVENTS, REVIEWS, AWARDS, CHEFS, BRANCHES } from './data';
import { Loader2 } from 'lucide-react';

function App() {
  const [view, setView] = useState<string>('LANDING'); 
  const [items, setItems] = useState<MenuItem[]>([]);
  
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
      try {
          const savedCart = localStorage.getItem('cart_items');
          return savedCart ? JSON.parse(savedCart) : [];
      } catch (e) {
          return [];
      }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [backupProgress, setBackupProgress] = useState<number | null>(null);
  const [language, setLanguage] = useState<Language>('English');
  const [tableNumber, setTableNumber] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const [offers, setOffers] = useState(OFFERS);
  const [discounts, setDiscounts] = useState(DISCOUNTS);
  const [events, setEvents] = useState(EVENTS);
  const [reviews, setReviews] = useState(REVIEWS);
  const [awards, setAwards] = useState(AWARDS);
  const [chefs, setChefs] = useState<Chef[]>(CHEFS);
  const [branches, setBranches] = useState<Branch[]>(BRANCHES);
  const [addonCategories, setAddonCategories] = useState<AddonCategory[]>([]);
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  const isInitialLoad = useRef(true);

  const t = (key: string) => TRANSLATIONS[language][key] || key;

  useEffect(() => {
    loadData();
  }, []);

  // Sync cart open state - ensure it's closed when entering Admin
  useEffect(() => {
    if (view === 'ADMIN') {
        setIsCartOpen(false);
    }
  }, [view]);

  const loadData = async () => {
      const data = await loadExternalData();
      if (data && data.length > 0) {
        setItems(data);
      } else {
        setItems(MENU_DATA);
      }

      const appData = await loadAppData();
      if (appData) {
          setOffers(appData.offers || OFFERS);
          setDiscounts(appData.discounts || DISCOUNTS);
          setEvents(appData.events || EVENTS);
          setReviews(appData.reviews || REVIEWS);
          setAwards(appData.awards || AWARDS);
          setChefs(appData.chefs || CHEFS);
          setBranches(appData.branches || BRANCHES);
          setAddonCategories(appData.addonCategories || []);
          setCategoryOrder(appData.categoryOrder || []);
          setIsAiEnabled(appData.isAiEnabled !== undefined ? appData.isAiEnabled : true);
          setFaqs(appData.faqs || []);
      }

      setLoading(false);
      setTimeout(() => { isInitialLoad.current = false; }, 1000);
  };

  useEffect(() => {
      if (!loading && !isInitialLoad.current) saveData(items);
  }, [items, loading]);

  useEffect(() => {
      localStorage.setItem('cart_items', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
      if (!loading && !isInitialLoad.current) {
          const dataToSave: AppData = {
              offers, discounts, events, reviews, awards, chefs, branches, categoryOrder, isAiEnabled, addonCategories, faqs
          };
          saveAppData(dataToSave);
      }
  }, [offers, discounts, events, reviews, awards, chefs, branches, categoryOrder, isAiEnabled, addonCategories, faqs, loading]);

  const getDiscountedPrice = (item: MenuItem, currentDiscounts: Discount[]): number => {
    const discount = currentDiscounts.find(d => d.category.trim().toLowerCase() === item.category.trim().toLowerCase());
    if (!discount) return item.price;
    if (discount.type === 'HAPPY_HOUR') {
        const now = new Date();
        const currentVal = now.getHours() * 60 + now.getMinutes();
        const [startH, startM] = (discount.startTime || "00:00").split(':').map(Number);
        const [endH, endM] = (discount.endTime || "23:59").split(':').map(Number);
        if (currentVal >= (startH * 60 + startM) && currentVal <= (endH * 60 + endM)) return item.price * (1 - discount.percentage / 100);
        return item.price;
    }
    return item.price * (1 - discount.percentage / 100);
  };

  const updateCartSize = (cartId: string, newSize: 'Single' | 'Regular' | 'Large') => {
      setCartItems(prev => {
          const itemToUpdate = prev.find(i => i.cartId === cartId);
          if(!itemToUpdate) return prev;
          
          const multiplier = newSize === 'Single' ? 0.4 : newSize === 'Regular' ? 0.7 : 1.0;
          
          const addonCost = (itemToUpdate.selectedAddons || []).reduce(
              (acc, cat) => acc + cat.items.reduce((sum, ai) => sum + ai.price, 0), 
              0
          );

          const baseItem = items.find(i => String(i.id) === String(itemToUpdate.id));
          if (!baseItem) return prev;

          const discountedBaseFullPrice = getDiscountedPrice(baseItem, discounts);
          
          const newAdjustedPrice = (discountedBaseFullPrice * multiplier) + addonCost;
          const newOriginalPrice = (baseItem.price * multiplier) + addonCost;

          return prev.map(i => i.cartId === cartId 
            ? { ...i, size: newSize, adjustedPrice: newAdjustedPrice, originalPrice: newOriginalPrice } 
            : i
          );
      });
  };

  const handleAddItem = async (newItem: MenuItem) => {
      try {
          let photoPath = newItem.photo_link;
          let videoPath = newItem.video_link;

          if (newItem.photo_link && newItem.photo_link.startsWith('data:')) {
             photoPath = await saveMediaToDevice(newItem.photo_link, 'image');
          }
          if (newItem.video_link && newItem.video_link.startsWith('data:')) {
             videoPath = await saveMediaToDevice(newItem.video_link, 'video');
          }

          const item: MenuItem = {
              ...newItem,
              id: Date.now().toString(),
              photo_link: photoPath,
              video_link: videoPath
          };
          setItems(prev => [...prev, item]);
      } catch (e) {
          console.error("Error adding item:", e);
          alert("Error adding item. Please try again.");
      }
  };

  const handleEditItem = async (_originalName: string, updatedItem: MenuItem) => {
      try {
          let photoPath = updatedItem.photo_link;
          let videoPath = updatedItem.video_link;

          if (updatedItem.photo_link && updatedItem.photo_link.startsWith('data:')) {
             photoPath = await saveMediaToDevice(updatedItem.photo_link, 'image');
          }
          if (updatedItem.video_link && updatedItem.video_link.startsWith('data:')) {
             videoPath = await saveMediaToDevice(updatedItem.video_link, 'video');
          }

          const finalItem = { ...updatedItem, photo_link: photoPath, video_link: videoPath };
          setItems(prev => prev.map(i => i.id === finalItem.id ? finalItem : i));
      } catch (e) {
          console.error("Error editing item:", e);
          alert("Error updating item. Please try again.");
      }
  };

  const handleDeleteItem = (dishName: string) => {
      if(confirm("Delete this item?")) setItems(prev => prev.filter(i => i.dish_name !== dishName));
  };

  const handleImport = async (data: any) => {
      if (!confirm("This will replace current menu and settings. Continue?")) return;
      setLoading(true);
      try {
          let importedItems: MenuItem[] = [];
          let importedAppData: Partial<AppData> = {};

          if (Array.isArray(data)) {
              importedItems = data;
          } else if (data && Array.isArray(data.items)) {
              importedItems = data.items;
              if (data.appData) importedAppData = data.appData;
          } else {
              alert("Invalid format.");
              setLoading(false);
              return;
          }

          const processedItems = await Promise.all(importedItems.map(async (item) => {
              let p = item.photo_link;
              let v = item.video_link;
              if (p && p.startsWith('data:')) p = await saveMediaToDevice(p, 'image');
              if (v && v.startsWith('data:')) v = await saveMediaToDevice(v, 'video');
              return { ...item, photo_link: p, video_link: v };
          }));
          setItems(processedItems);

          if (importedAppData.chefs) {
              const chefsData = await Promise.all(importedAppData.chefs.map(async c => ({...c, image: c.image.startsWith('data:') ? await saveMediaToDevice(c.image, 'image') : c.image})));
              setChefs(chefsData);
          }
          if (importedAppData.events) {
              const ev = await Promise.all(importedAppData.events.map(async e => ({...e, image: e.image.startsWith('data:') ? await saveMediaToDevice(e.image, 'image') : e.image})));
              setEvents(ev);
          }
          if (importedAppData.offers) {
              const off = await Promise.all(importedAppData.offers.map(async o => ({...o, image: o.image.startsWith('data:') ? await saveMediaToDevice(o.image, 'image') : o.image})));
              setOffers(off);
          }
          if (importedAppData.branches) {
              const br = await Promise.all(importedAppData.branches.map(async b => ({...b, map_image: b.map_image.startsWith('data:') ? await saveMediaToDevice(b.map_image, 'image') : b.map_image})));
              setBranches(br);
          }
          
          if (importedAppData.discounts) setDiscounts(importedAppData.discounts);
          if (importedAppData.reviews) setReviews(importedAppData.reviews);
          if (importedAppData.awards) setAwards(importedAppData.awards);
          if (importedAppData.categoryOrder) setCategoryOrder(importedAppData.categoryOrder);
          if (importedAppData.addonCategories) setAddonCategories(importedAppData.addonCategories);
          if (importedAppData.isAiEnabled !== undefined) setIsAiEnabled(importedAppData.isAiEnabled);
          if (importedAppData.faqs) setFaqs(importedAppData.faqs);

          alert("Import successful!");
      } catch(err) { 
          console.error(err);
          alert("Error processing import data."); 
      } finally {
          setLoading(false);
      }
  };

  const handleExportData = async () => {
    setBackupProgress(0);
    try {
        await exportData(items, { 
            offers, discounts, events, reviews, awards, chefs, branches, categoryOrder, isAiEnabled, addonCategories, faqs
        }, (percent) => {
            setBackupProgress(percent);
        });
    } finally {
        setTimeout(() => setBackupProgress(null), 1000);
    }
  };

  const addToCart = (item: MenuItem, size: 'Single' | 'Regular' | 'Large', adjustedPrice: number, originalPrice?: number, selectedAddons?: SelectedAddon[]) => {
    setCartItems(prev => {
      const addonsKey = JSON.stringify(selectedAddons || []);
      const existing = prev.find(i => 
          i.id === item.id && 
          i.size === size && 
          JSON.stringify(i.selectedAddons || []) === addonsKey
      );

      if (existing) {
        return prev.map(cartItem => 
          cartItem.cartId === existing.cartId 
            ? { ...cartItem, quantity: cartItem.quantity + 1 } 
            : cartItem
        );
      }
      const newItem: CartItem = {
        ...item,
        cartId: Date.now().toString(),
        quantity: 1,
        size,
        adjustedPrice, 
        originalPrice: originalPrice || adjustedPrice,
        selectedAddons
      };
      return [...prev, newItem];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (cartId: string, delta: number) => {
    setCartItems(prev => prev.map(item => 
      item.cartId === cartId 
        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
        : item
    ).filter(item => item.quantity > 0));
  };

  const removeFromCart = (cartId: string) => {
    setCartItems(prev => prev.filter(item => item.cartId !== cartId));
  };

  const toggleFavorite = (dishName: string) => {
    setFavorites(prev => 
      prev.includes(dishName) 
        ? prev.filter(name => name !== dishName) 
        : [...prev, dishName]
    );
  };

  const handleResetData = () => {
      if(confirm("This will clear all custom items and reset to defaults. Continue?")) {
          localStorage.clear();
          window.location.reload();
      }
  };

  if (loading) return (
      <div className="h-screen bg-[#121212] flex items-center justify-center text-green-500 font-bold animate-pulse">
          Loading AF Restro...
      </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-white font-sans overflow-hidden">
        <div className="flex-1 overflow-hidden relative">
            {view === 'LANDING' && (
                <LandingView 
                    onNavigate={setView} 
                    t={t} 
                    offers={offers} 
                    discounts={discounts} 
                    reviews={reviews} 
                    items={items}
                    onOrderNow={() => { setActiveCategory('All'); setView('MENU'); }}
                    onPreOrder={() => { setActiveCategory('Special Offers'); setView('MENU'); }}
                    onBookEvent={() => setIsEventModalOpen(true)}
                />
            )}
            
            {view === 'MENU' && (
                <MenuView 
                    items={items}
                    cart={cartItems}
                    addToCart={addToCart}
                    setIsCartOpen={setIsCartOpen}
                    t={t}
                    tableNumber={tableNumber}
                    setTableNumber={setTableNumber}
                    favorites={favorites}
                    toggleFavorite={toggleFavorite}
                    discounts={discounts}
                    activeCategory={activeCategory}
                    onSelectCategory={setActiveCategory}
                    categoryOrder={categoryOrder}
                    addonCategories={addonCategories}
                />
            )}

            {view === 'ABOUT' && (
                <AboutView 
                    t={t} 
                    onBookEvent={() => setIsEventModalOpen(true)} 
                    events={events} 
                    awards={awards} 
                    chefs={chefs} 
                    branches={branches} 
                />
            )}

            {view === 'FEEDBACK' && <FeedbackView t={t} />}

            {view === 'ADMIN' && (
                <AdminView 
                    items={items}
                    offers={offers}
                    discounts={discounts}
                    events={events}
                    reviews={reviews}
                    awards={awards}
                    chefs={chefs}
                    branches={branches}
                    addonCategories={addonCategories}
                    categoryOrder={categoryOrder}
                    isAiEnabled={isAiEnabled}
                    setIsAiEnabled={setIsAiEnabled}
                    faqs={faqs}
                    onAddFAQ={f => setFaqs(prev => [...prev, f])}
                    onDeleteFAQ={id => setFaqs(prev => prev.filter(f => f.id !== id))}
                    onAdd={handleAddItem}
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                    onAddOffer={o => setOffers(prev => [...prev, o])}
                    onDeleteOffer={id => setOffers(prev => prev.filter(o => o.id !== id))}
                    onAddDiscount={d => setDiscounts(prev => [...prev, d])}
                    onDeleteDiscount={id => setDiscounts(prev => prev.filter(d => d.id !== id))}
                    onAddEvent={e => setEvents(prev => [...prev, e])}
                    onDeleteEvent={id => setEvents(prev => prev.filter(e => e.id !== id))}
                    onAddReview={r => setReviews(prev => [...prev, r])}
                    onDeleteReview={id => setReviews(prev => prev.filter(r => r.id !== id))}
                    onAddAward={a => setAwards(prev => [...prev, a])}
                    onDeleteAward={id => setAwards(prev => prev.filter(a => a.id !== id))}
                    onAddChef={c => setChefs(prev => [...prev, c])}
                    onDeleteChef={id => setChefs(prev => prev.filter(c => c.id !== id))}
                    onAddBranch={b => setBranches(prev => [...prev, b])}
                    onDeleteBranch={id => setBranches(prev => prev.filter(b => b.id !== id))}
                    onAddAddonCategory={c => setAddonCategories(prev => [...prev, c])}
                    onDeleteAddonCategory={id => setAddonCategories(prev => prev.filter(c => c.id !== id))}
                    onUpdateCategoryOrder={setCategoryOrder}
                    onReset={handleResetData}
                    onBack={() => setView('LANDING')}
                    onImportData={handleImport}
                    onExport={() => handleExportData()}
                />
            )}
        </div>

        {view !== 'ADMIN' && (
          <>
            <FooterNav 
                currentView={view} 
                onNavigate={setView} 
                currentLang={language} 
                onSetLang={setLanguage} 
                t={t} 
            />
            {isAiEnabled && <AIAssistant menu={items} faqs={faqs} />}
            <CartSidebar 
                isOpen={isCartOpen} 
                onClose={() => setIsCartOpen(false)}
                cartItems={cartItems}
                onUpdateQuantity={updateCartQuantity}
                onUpdateSize={updateCartSize}
                onRemoveItem={removeFromCart}
                onClearCart={() => setCartItems([])}
                tableNumber={tableNumber}
                t={t}
            />
          </>
        )}

        <EventBookingModal 
            isOpen={isEventModalOpen} 
            onClose={() => setIsEventModalOpen(false)} 
            t={t} 
        />

        {backupProgress !== null && (
            <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-8 backdrop-blur-sm">
                <div className="w-full max-sm bg-[#1e1e1e] p-6 rounded-3xl border border-[#333] shadow-2xl flex flex-col items-center">
                    <Loader2 size={48} className="text-green-500 animate-spin mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Creating Backup</h3>
                    <p className="text-gray-400 text-sm text-center mb-6">Bundling photos and videos. This may take a moment for large menus.</p>
                    
                    <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden mb-2">
                        <div 
                            className="h-full bg-green-500 transition-all duration-300 ease-out" 
                            style={{ width: `${backupProgress}%` }}
                        />
                    </div>
                    <span className="text-green-500 font-bold text-sm">{backupProgress}%</span>
                </div>
            </div>
        )}
    </div>
  );
}

export default App;