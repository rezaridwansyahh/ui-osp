export const PRODUCTS_INITIAL = [
  { id: 'P1', name: 'Monthly Subscription', cat: 'Subscription', price: 350000, icon: '🗓️' },
  { id: 'P2', name: 'Yearly Subscription', cat: 'Subscription', price: 3500000, icon: '📅' },
  { id: 'P3', name: 'Personal Training 10x', cat: 'PT Package', price: 2500000, icon: '💪' },
  { id: 'P4', name: 'Whey Protein Isolate', cat: 'Merchandise', price: 850000, icon: '🥤' },
  { id: 'P5', name: 'Gym Towel S', cat: 'Merchandise', price: 45000, icon: '🧣' },
  { id: 'P6', name: 'Shaker Bottle', cat: 'Merchandise', price: 75000, icon: '🍼' },
];

export const PRODUCT_CATEGORIES = ['Subscription', 'PT Package', 'Merchandise'];

// Icon default per kategori
export const CATEGORY_ICONS = {
  Subscription: '🗓️',
  'PT Package': '💪',
  Merchandise: '📦',
};
