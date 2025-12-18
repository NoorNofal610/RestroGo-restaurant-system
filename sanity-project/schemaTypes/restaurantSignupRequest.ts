export default {
  name: "restaurantSignupRequest",
  title: "Restaurant Signup Request",
  type: "document",
  fields: [
    { name: "name", title: "Full Name", type: "string" },
    { name: "email", title: "Email", type: "string" },
    { name: "password", title: "Hashed Password", type: "string" },
    {
      name: "restaurantName",
      title: "Restaurant Name",
      type: "string",
    },
    {
      name: "restaurantCategory",
      title: "Restaurant Category",
      type: "string",
    },
    {
      name: "restaurantDescription",
      title: "Restaurant Description",
      type: "text",
    },
    {
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: ["pending", "approved", "rejected"],
      },
      initialValue: "pending",
    },
    {
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    },
  ],
};


