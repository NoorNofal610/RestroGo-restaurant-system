export default {
  name: 'dish',
  title: 'Dish',
  type: 'document',
  fields: [
    { name: 'name', title: 'Dish Name', type: 'string' },
    { name: 'description', title: 'Description', type: 'text' },
    { name: 'price', title: 'Price', type: 'number' },
    { name: 'image', title: 'Image', type: 'image', options: { hotspot: true } },
    { name: 'restaurant', title: 'Restaurant', type: 'reference', to: [{ type: 'restaurant' }] },
    { name: 'category', title: 'Category', type: 'string', options: { list: ['Burger', 'Sandwich', 'Fries', 'Pizza', 'Pasta', 'Salad', 'Sushi', 'Noodles', 'Rice', 'Coffee', 'Tea', 'Pastry', 'Drink', 'Dessert', 'Main Dish', 'Side Dish', 'Other'] } },
  ]
}
