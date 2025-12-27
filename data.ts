
import { MenuItem, TranslationMap, Chef, Event, Review, Branch, Award, SpecialOffer, Discount } from './types';

// REPLACE THIS WITH YOUR RESTAURANT'S WHATSAPP NUMBER (International Format without +)
export const WHATSAPP_NUMBER = "971506380007"; 

export const TRANSLATIONS: TranslationMap = {
  English: {
    home: "Home", menu: "Menu", about: "About", feedback: "Feedback", search_placeholder: "Search items...",
    veg_only: "Veg Only", table: "Table", order_now: "Order Now", book_event: "Book Event", google_reviews: "Google Reviews",
    about_title: "About", meet_chefs: "Meet Our Chefs", upcoming_events: "Upcoming Events", locations: "Our Locations",
    book_now: "Book Now", food_quality: "Food Quality", service: "Service", ambiance: "Ambiance", submit_feedback: "Submit Feedback",
    current_order: "Current Order", subtotal: "Subtotal", tax: "Tax", total: "Total", checkout: "Checkout on WhatsApp",
    add_to_cart: "Add to Cart", cook_time: "Cook Time", spicy_level: "Spicy Level", serves: "Serves", ingredients: "Ingredients",
    calories: "Calories", recommended: "Recommended", size_single: "Single", size_regular: "Regular", size_large: "Full",
    bestseller: "Bestseller", chef_special: "Chef Special", select_table: "Select Table First", empty_cart: "Cart is empty",
    what_people_say: "What people say", select_size: "Select Size"
  },
  Arabic: {
    home: "الرئيسية", menu: "القائمة", about: "من نحن", feedback: "رأيك يهمنا", search_placeholder: "بحث عن صنف...",
    veg_only: "نباتي فقط", table: "طاولة", order_now: "اطلب الآن", book_event: "حجز مناسبة", google_reviews: "تقييمات جوجل",
    about_title: "من نحن", meet_chefs: "طغاتنا", upcoming_events: "الفعاليات القادمة", locations: "فروعنا",
    book_now: "احجز الآن", food_quality: "جودة الطعام", service: "الخدمة", ambiance: "الأجواء", submit_feedback: "إرسال الرأي",
    current_order: "الطلب الحالي", subtotal: "المجموع الفرعي", tax: "الضريبة", total: "الإجمالي", checkout: "إتمام الطلب عبر واتساب",
    add_to_cart: "أضف للسلة", cook_time: "وقت الطهي", spicy_level: "مستوى الحرارة", serves: "يكفي لـ", ingredients: "المكونات",
    calories: "سعرات حرارية", recommended: "موصى به لك", size_single: "فردي", size_regular: "وسط", size_large: "كامل",
    bestseller: "الأكثر مبيعاً", chef_special: "توصية الشيف", select_table: "اختر الطاولة أولاً", empty_cart: "السلة فارغة",
    what_people_say: "ماذا يقول الناس", select_size: "اختر الحجم"
  },
  Chinese: {
    home: "主页", menu: "菜单", about: "关于我们", feedback: "反馈", search_placeholder: "搜索菜品...",
    veg_only: "仅限素食", table: "桌号", order_now: "立即点餐", book_event: "预订活动", google_reviews: "谷歌评论",
    about_title: "关于", meet_chefs: "认识我们的厨师", upcoming_events: "即将举办的活动", locations: "我们的位置",
    book_now: "立即预订", food_quality: "食品质量", service: "服务", ambiance: "环境", submit_feedback: "提交反馈",
    current_order: "当前订单", subtotal: "小计", tax: "税费", total: "总计", checkout: "WhatsApp 结账",
    add_to_cart: "加入购物车", cook_time: "烹饪时间", spicy_level: "辣度", serves: "份量", ingredients: "配料",
    calories: "卡路里", recommended: "为您推荐", size_single: "单人份", size_regular: "普通份", size_large: "大份",
    bestseller: "畅销", chef_special: "厨师推荐", select_table: "请先选择桌号", empty_cart: "购物车为空",
    what_people_say: "大家怎么说", select_size: "选择份量"
  },
  French: {
    home: "Accueil", menu: "Menu", about: "À propos", feedback: "Avis", search_placeholder: "Rechercher...",
    veg_only: "Végétarien", table: "Table", order_now: "Commander", book_event: "Réserver", google_reviews: "Avis Google",
    about_title: "À propos", meet_chefs: "Nos Chefs", upcoming_events: "Événements", locations: "Nos Adresses",
    book_now: "Réserver", food_quality: "Qualité", service: "Service", ambiance: "Ambiance", submit_feedback: "Envoyer",
    current_order: "Commande", subtotal: "Sous-total", tax: "Taxe", total: "Total", checkout: "Commander sur WhatsApp",
    add_to_cart: "Ajouter", cook_time: "Cuisson", spicy_level: "Épicé", serves: "Personnes", ingredients: "Ingrédients",
    calories: "Calories", recommended: "Recommandé", size_single: "Solo", size_regular: "Moyen", size_large: "Grand",
    bestseller: "Best-seller", chef_special: "Spécial Chef", select_table: "Choisir table", empty_cart: "Panier vide",
    what_people_say: "Avis clients", select_size: "Choisir la taille"
  },
  Russian: {
    home: "Главная", menu: "Меню", about: "О нас", feedback: "Отзывы", search_placeholder: "Поиск...",
    veg_only: "Вегетарианское", table: "Стол", order_now: "Заказать", book_event: "Бронь", google_reviews: "Отзывы Google",
    about_title: "О нас", meet_chefs: "Наши повара", upcoming_events: "Мероприятия", locations: "Адреса",
    book_now: "Забронировать", food_quality: "Качество еды", service: "Сервис", ambiance: "Атмосфера", submit_feedback: "Отправить",
    current_order: "Ваш заказ", subtotal: "Подытог", tax: "Налог", total: "Итого", checkout: "Заказать через WhatsApp",
    add_to_cart: "В корзину", cook_time: "Время", spicy_level: "Острота", serves: "Порций", ingredients: "Ингредиенты",
    calories: "Калории", recommended: "Рекомендуем", size_single: "Малая", size_regular: "Средняя", size_large: "Большая",
    bestseller: "Хит", chef_special: "От шефа", select_table: "Выберите стол", empty_cart: "Пусто",
    what_people_say: "Отзывы", select_size: "Выберите размер"
  }
};

export const MENU_DATA: MenuItem[] = [
  // Using a subset for brevity. The app can load more from local files.
  {
    id: "1",
    category: "Chef Special", dish_name: "Veg Platter", arabic_name: "", price: 59.99, is_veg: true, bestseller: true, chef_special: false,
    description: "A generous vegetarian platter featuring three types of Paneer Tikka (3 pieces each), Veg Seekh Kabab, Soya Chaap Tikka (3 pcs), 2 Butter Naan, and Dal Fry.",
    timing: "", ingredients: ["Paneer", "Soya Chaap", "Potatoes", "Onions", "Spices", "Yogurt", "Butter", "Naan", "Dal"], customization_options: [],
    cook_time: 1, pricing_option: "1", tag_name: "", photo_link: "https://images.unsplash.com/photo-1603133172100-6fe3e52239b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    spicy_level: "Mild", serves_how_many: 2, video_link: ""
  },
  {
    id: "2",
    category: "Chef Special", dish_name: "Non Veg Platter", arabic_name: "", price: 69.99, is_veg: false, bestseller: true, chef_special: false,
    description: "A hearty non-vegetarian feast with three types of Chicken Tikka (3 pcs each), half Tandoori Chicken, Seekh Kabab, 2 Butter Naan, and Dal Fry.",
    timing: "", ingredients: ["Chicken", "Seekh Kabab", "Naan", "Dal", "Yogurt", "Spices", "Butter"], customization_options: [],
    cook_time: 1, pricing_option: "1", tag_name: "", photo_link: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    spicy_level: "Medium", serves_how_many: 2, video_link: ""
  },
];

export const CHEFS: Chef[] = [
  { id: 1, name: 'Sanjeev Kapoor', role: 'Executive Chef', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', bio: 'Master of Indian spices with over 20 years of experience.' },
  { id: 2, name: 'Vikas Khanna', role: 'Head of Pastry', image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', bio: 'Award-winning pastry chef known for fusion desserts.' },
];

export const EVENTS: Event[] = [
  { id: 1, title: 'Diwali Gala Dinner', date: 'Nov 12, 2024', image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', description: 'Join us for a festival of lights with a special grand buffet.' },
  { id: 2, title: 'Sufi Night', date: 'Every Friday', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', description: 'Live Sufi music accompanied by our signature kebabs.' },
];

export const REVIEWS: Review[] = [
  { id: 1, name: 'John Doe', rating: 5, comment: 'Best Butter Chicken in town! The ambiance is lovely.', date: '2 days ago', avatar: 'https://randomuser.me/api/portraits/men/1.jpg', source: 'google' },
  { id: 2, name: 'Sarah Lee', rating: 4, comment: 'Great service and authentic flavors. Highly recommend.', date: '1 week ago', avatar: 'https://randomuser.me/api/portraits/women/2.jpg', source: 'app' },
];

export const BRANCHES: Branch[] = [
  { id: 1, name: 'Downtown Branch', address: '123 Main St, City Centre', phone: '+1 234 567 890', map_image: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { id: 2, name: 'Westside Branch', address: '456 West Ave, Business Park', phone: '+1 987 654 321', map_image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
];

export const AWARDS: Award[] = [
    { id: '1', title: 'Best Indian Cuisine', organization: 'City Food Awards', year: '2023' },
    { id: '2', title: 'Certificate of Excellence', organization: 'TripAdvisor', year: '2022' },
];

export const OFFERS: SpecialOffer[] = [
    { id: '1', title: 'Weekend Biryani Bash', description: 'Get a free dessert with any family-size Biryani order this weekend!', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' }
];

export const DISCOUNTS: Discount[] = [
    { id: '1', category: 'Grills & Kebabs', percentage: 20, type: 'HAPPY_HOUR', startTime: '17:00', endTime: '19:00' }
];
