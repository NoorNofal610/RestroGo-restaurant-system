export default {
  name: 'booking',
  title: 'Booking',
  type: 'document',
  fields: [
    { name: 'user', title: 'User', type: 'reference', to: [{ type: 'user' }] },
    { name: 'restaurant', title: 'Restaurant', type: 'reference', to: [{ type: 'restaurant' }] },
    { name: 'date', title: 'Date', type: 'datetime' },
    { name: 'guests', title: 'Number of Guests', type: 'number' },
    { name: 'status', title: 'Status', type: 'string', options: { list: ['pending', 'confirmed', 'cancelled'] }, initialValue: 'pending' },
  ]
}
