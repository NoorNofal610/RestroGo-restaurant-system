export default {
  name: 'user',
  title: 'User',
  type: 'document',
  fields: [
    { name: 'name', title: 'Full Name', type: 'string' },
    { name: 'email', title: 'Email', type: 'string' },
    { name: 'password', title: 'Password', type: 'string' },
    { name: 'role', title: 'Role', type: 'string', options: { list: ['customer', 'restaurant'] } },
    // { name: 'profileImage', title: 'Profile Image', type: 'image', options: { hotspot: true }, hidden: false },
  ]
}
