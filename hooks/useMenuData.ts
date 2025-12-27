
import { useState, useEffect, useCallback } from 'react';
import { MenuItem } from '../types';
import { Storage } from '../utils/storage';

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    dish_name: 'Classic Burger',
    description: 'A juicy beef patty with fresh lettuce, tomato, and our special sauce.',
    price: 12.99,
    category: 'Burgers',
    arabic_name: '',
    is_veg: false,
    bestseller: false,
    chef_special: false,
    timing: '',
    ingredients: [],
    customization_options: [],
    cook_time: 15,
    pricing_option: '1',
    tag_name: '',
    photo_link: '',
    spicy_level: 'Normal',
    serves_how_many: 1,
    video_link: ''
  },
  {
    id: '2',
    dish_name: 'Margherita Pizza',
    description: 'Classic pizza with fresh mozzarella, tomatoes, and basil.',
    price: 15.50,
    category: 'Pizza',
    arabic_name: '',
    is_veg: true,
    bestseller: true,
    chef_special: false,
    timing: '',
    ingredients: [],
    customization_options: [],
    cook_time: 20,
    pricing_option: '1',
    tag_name: '',
    photo_link: '',
    spicy_level: 'Normal',
    serves_how_many: 2,
    video_link: ''
  }
];

export const useMenuData = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Load from DB
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedItems = await Storage.getAll<MenuItem>();
        if (storedItems && storedItems.length > 0) {
          setMenuItems(storedItems);
        } else {
          // Initialize with defaults if empty, but don't save defaults automatically 
          // to keep DB clean for user uploads. Or we can save them:
          await Storage.clearAndBulkInsert(DEFAULT_MENU_ITEMS);
          setMenuItems(DEFAULT_MENU_ITEMS);
        }
      } catch (error) {
        console.error("Failed to load menu from storage", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const addItem = useCallback(async (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = { ...item, id: new Date().toISOString() };
    try {
        await Storage.save(newItem);
        setMenuItems(prevItems => [...prevItems, newItem]);
    } catch (error) {
        console.error("Failed to save item", error);
        alert("Failed to save item. Storage might be full.");
    }
  }, []);

  const updateItem = useCallback(async (updatedItem: MenuItem) => {
    try {
        await Storage.save(updatedItem);
        setMenuItems(prevItems =>
            prevItems.map(item => (item.id === updatedItem.id ? updatedItem : item))
        );
    } catch (error) {
        console.error("Failed to update item", error);
        alert("Failed to update item.");
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    try {
        await Storage.delete(id);
        setMenuItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (error) {
        console.error("Failed to delete item", error);
    }
  }, []);

  const downloadMenu = useCallback(() => {
    const dataStr = JSON.stringify(menuItems, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'menu.json');
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
  }, [menuItems]);

  const loadMenu = useCallback(async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result;
        if (typeof content === 'string') {
          const parsedMenu = JSON.parse(content);
          // Basic validation
          if (Array.isArray(parsedMenu) && parsedMenu.every(item => 'id' in item && 'dish_name' in item)) {
            await Storage.clearAndBulkInsert(parsedMenu);
            setMenuItems(parsedMenu);
            alert("Menu imported successfully!");
          } else {
            alert('Invalid menu.json format.');
          }
        }
      } catch (error) {
        console.error("Error parsing uploaded menu.json", error);
        alert('Failed to parse the uploaded file. Please ensure it is a valid JSON file.');
      }
    };
    reader.readAsText(file);
  }, []);

  return {
    menuItems,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    downloadMenu,
    loadMenu
  };
};
