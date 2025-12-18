export default {
  name: 'order',
  title: 'Order',
  type: 'document',
  fields: [
    { name: 'user', title: 'User', type: 'reference', to: [{ type: 'user' }] },
    { name: 'restaurant', title: 'Restaurant', type: 'reference', to: [{ type: 'restaurant' }] },
    { 
      name: 'items', 
      title: 'Items', 
      type: 'array', 
      of: [{
        type: 'object',
        fields: [
          { name: 'dish', title: 'Dish', type: 'reference', to: [{ type: 'dish' }] },
          { name: 'quantity', title: 'Quantity', type: 'number' },
        ]
      }]
    },
    { name: 'totalPrice', title: 'Total Price', type: 'number' },
    { name: 'status', title: 'Status', type: 'string', options: { list: ['pending', 'preparing', 'delivered', 'cancelled'] }, initialValue: 'pending' },
    { name: 'createdAt', title: 'Created At', type: 'datetime', initialValue: () => new Date().toISOString() },
  ]
}
