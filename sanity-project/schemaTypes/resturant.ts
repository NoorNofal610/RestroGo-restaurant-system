export default {
  name: 'restaurant',
  title: 'Restaurant',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string' },
    { name: 'description', title: 'Description', type: 'text' },
    { name: 'address', title: 'Address', type: 'string' },
    { name: 'phone', title: 'Phone Number', type: 'string' },
    {
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: { list: ['Fast Food', 'Italian', 'Asian', 'Cafe', 'Other'] },
    },
    { name: 'rating', title: 'Rating', type: 'number' },
    { name: 'owner', title: 'Owner', type: 'reference', to: [{ type: 'user' }] },
    { name: 'openingHours', title: 'Opening Hours', type: 'string' },
  ],
};
