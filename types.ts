// Type definitions for the application

export type Language = 'English' | 'Arabic' | 'Chinese' | 'French' | 'Russian';

export type TranslationMap = Record<Language, Record<string, string>>;

export interface AddonItem {
  id: string;
  name: string;
  price: number;
}

export interface AddonCategory {
  id: string;
  name: string;
  items: AddonItem[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Chef {
  id: number;
  name: string;
  role: string;
  image: string;
  bio: string;
}

export interface Event {
  id: string | number;
  title: string;
  date: string;
  image: string;
  description: string;
}

export interface Review {
  id: string | number;
  name: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
  source: string;
  photo?: string;
}

export interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  map_image: string;
}

export interface Award {
  id: string | number;
  title: string;
  organization: string;
  year: string;
}

export interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface Discount {
  id: string;
  category: string;
  percentage: number;
  type: 'HAPPY_HOUR' | 'FLAT';
  startTime?: string;
  endTime?: string;
}

export interface MenuItem {
  id: string;
  dish_name: string;
  description: string;
  price: number;
  category: string;
  photo_link: string;
  video_link: string;
  is_veg: boolean;
  bestseller: boolean;
  spicy_level: string;
  
  arabic_name?: string;
  chef_special?: boolean;
  todays_special?: boolean;
  timing?: string;
  ingredients?: string[];
  customization_options?: string[];
  cook_time?: number;
  calories?: number;
  pricing_option?: string;
  tag_name?: string;
  serves_how_many?: number;
  addon_category_ids?: string[];
}

export interface SelectedAddon {
  categoryId: string;
  categoryName: string;
  items: AddonItem[];
}

export interface CartItem extends MenuItem {
  cartId: string;
  quantity: number;
  size: 'Single' | 'Regular' | 'Large';
  adjustedPrice: number;
  originalPrice?: number;
  // Fixing property 'selectedAddons' does not exist on type 'CartItem'
  selectedAddons?: SelectedAddon[];
}
