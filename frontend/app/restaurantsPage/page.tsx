// "use client";

// import { useState, useEffect, useRef } from "react";
// import { Box, Typography, TextField, List, ListItemButton, ListItemText, Chip, CircularProgress } from "@mui/material";
// import { Search, Restaurant } from "@mui/icons-material";
// import { useQuery } from "@tanstack/react-query";
// import Navbar from "@/app/components/Navbar";
// import RestaurantCard from "@/app/components/RestaurantCard";
// import type { Restaurant as SanityRestaurant } from "@/src/sanity/types";

// // نفس الأنترفيس من RestaurantCard
// interface Owner {
//   _id?: string;
//   name?: string;
//   email?: string;
// }

// interface RestaurantWithExpandedOwner extends Omit<SanityRestaurant, 'owner'> {
//   owner?: Owner;
// }

// export default function RestaurantsPage() {
//   const [mounted, setMounted] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
//   const [isSearchSticky, setIsSearchSticky] = useState(false);
//   const searchRef = useRef<HTMLDivElement>(null);
//   const mainContentRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const timer = setTimeout(() => setMounted(true), 0);
//     return () => clearTimeout(timer);
//   }, []);

//   // جلب التصنيفات
//   const { data: categories = [], isLoading: isLoadingCategories } = useQuery<string[]>({
//     queryKey: ["categories"],
//     queryFn: async () => {
//       const res = await fetch("/api/resturants/categories");
//       if (!res.ok) throw new Error("Failed to fetch categories");
//       return res.json();
//     },
//   });

//   // جلب المطاعم مع Owner data expanded
//   const { data: restaurants = [], isLoading: isLoadingRestaurants, error } = useQuery<RestaurantWithExpandedOwner[]>({
//     queryKey: ["restaurants"],
//     queryFn: async () => {
//       const res = await fetch("/api/resturants");
//       if (!res.ok) throw new Error("Failed to fetch restaurants");
//       const data: SanityRestaurant[] = await res.json();

//       // Convert SanityRestaurant to RestaurantWithExpandedOwner
//       return data.map(restaurant => {
//         let owner: Owner | undefined;
//         if (restaurant.owner) {
//           if ('name' in restaurant.owner) {
//             owner = restaurant.owner as unknown as Owner;
//           } else {
//             owner = undefined;
//           }
//         }
//         return { ...restaurant, owner };
//       });
//     },
//   });

//   // Sticky search عند scroll
//   useEffect(() => {
//     const handleScroll = () => {
//       if (searchRef.current && mainContentRef.current) {
//         const scrollTop = mainContentRef.current.scrollTop;
//         setIsSearchSticky(scrollTop >= 100);
//       }
//     };
//     const mainContent = mainContentRef.current;
//     if (mainContent) {
//       mainContent.addEventListener('scroll', handleScroll);
//       return () => mainContent.removeEventListener('scroll', handleScroll);
//     }
//   }, []);

//   if (!mounted) return null;

//   // تصفية المطاعم حسب البحث والتصنيف
//   const filteredRestaurants = restaurants.filter((r) => {
//     const matchesCategory = selectedCategory ? r.category === selectedCategory : true;
//     const matchesSearch =
//       r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       r.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       r.description?.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });

//   const getCategoryCount = (category: string) => restaurants.filter((r) => r.category === category).length;
//   const totalRestaurants = restaurants.length;
//   const isLoading = isLoadingCategories || isLoadingRestaurants;

//   return (
//     <Box sx={{ minHeight: "100vh", bgcolor: "#111", color: "white", fontFamily: "'Poppins', sans-serif" }}>
//       <Navbar />
//       <Box sx={{ display: "flex", pt: { xs: 8, md: 10 }, height: "calc(100vh - 64px)" }}>
//         {/* Sidebar - ثابتة */}
//         <Box
//           sx={{
//             width: { xs: "100%", md: 300 },
//             borderRight: { md: "1px solid rgba(255,255,255,0.1)" },
//             p: 3,
//             display: { xs: "none", md: "block" },
//             bgcolor: "#0a0a0a",
//             borderRadius: "0 16px 16px 0",
//             boxShadow: { md: "4px 0 20px rgba(0,0,0,0.3)" },
//             height: "100%",
//             position: "sticky",
//             top: 0,
//             overflowY: "auto",
//           }}
//         >
//           <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3, fontSize: "1.2rem", color: "#4ecdc4", display: "flex", alignItems: "center", gap: 1 }}>
//             <Restaurant sx={{ fontSize: 24 }} /> Categories
//           </Typography>
//           {isLoadingCategories && (
//             <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
//               <CircularProgress size={20} sx={{ color: "#4ecdc4" }} />
//             </Box>
//           )}
//           <List sx={{ mt: 1 }}>
//             <ListItemButton
//               selected={selectedCategory === null}
//               onClick={() => setSelectedCategory(null)}
//               sx={{
//                 borderRadius: 3,
//                 mb: 2,
//                 py: 1.5,
//                 "&.Mui-selected": { bgcolor: "rgba(78, 205, 196, 0.15)", color: "#4ecdc4", "&:hover": { bgcolor: "rgba(78, 205, 196, 0.2)" } },
//                 "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
//               }}
//             >
//               <ListItemText primary={<Typography sx={{ fontWeight: selectedCategory === null ? "bold" : "normal" }}>All Restaurants</Typography>} />
//               <Chip
//                 label={totalRestaurants}
//                 size="small"
//                 sx={{ bgcolor: selectedCategory === null ? "#4ecdc4" : "rgba(255,255,255,0.1)", color: selectedCategory === null ? "#000" : "rgba(255,255,255,0.8)", fontWeight: "bold", fontSize: "0.8rem" }}
//               />
//             </ListItemButton>
//             {!isLoadingCategories && categories.map((cat) => {
//               const count = getCategoryCount(cat);
//               if (count === 0) return null;
//               return (
//                 <ListItemButton
//                   key={cat}
//                   selected={selectedCategory === cat}
//                   onClick={() => setSelectedCategory(cat)}
//                   sx={{
//                     borderRadius: 3,
//                     mb: 1.5,
//                     py: 1.5,
//                     "&.Mui-selected": { bgcolor: "rgba(78, 205, 196, 0.15)", color: "#4ecdc4", "&:hover": { bgcolor: "rgba(78, 205, 196, 0.2)" } },
//                     "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
//                   }}
//                 >
//                   <ListItemText primary={<Typography sx={{ fontWeight: selectedCategory === cat ? "bold" : "normal" }}>{cat}</Typography>} />
//                   <Chip
//                     label={count}
//                     size="small"
//                     sx={{ bgcolor: selectedCategory === cat ? "#4ecdc4" : "rgba(255,255,255,0.1)", color: selectedCategory === cat ? "#000" : "rgba(255,255,255,0.8)", fontWeight: "bold", fontSize: "0.8rem" }}
//                   />
//                 </ListItemButton>
//               );
//             })}
//           </List>
//         </Box>

//         {/* Main Content - مع scroll داخلي */}
//         <Box ref={mainContentRef} sx={{ flex: 1, p: { xs: 2, md: 4 }, height: "100%", overflowY: "auto", position: "relative" }}>
//           {/* Search Box - Sticky */}
//           <Box
//             ref={searchRef}
//             sx={{
//               display: "flex",
//               gap: 2,
//               mb: 4,
//               flexDirection: { xs: "column", md: "row" },
//               alignItems: { md: "center" },
//               position: isSearchSticky ? "sticky" : "relative",
//               top: isSearchSticky ? 0 : "auto",
//               zIndex: isSearchSticky ? 1000 : "auto",
//               bgcolor: isSearchSticky ? "#111" : "transparent",
//               py: isSearchSticky ? 2 : 0,
//               px: isSearchSticky ? 2 : 0,
//               borderRadius: isSearchSticky ? 2 : 0,
//               boxShadow: isSearchSticky ? "0 4px 20px rgba(0,0,0,0.3)" : "none",
//               transition: "all 0.3s ease",
//             }}
//           >
//             <TextField
//               fullWidth
//               placeholder="Search restaurants, location, or description..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               size="small"
//               InputProps={{
//                 startAdornment: (
//                   <Box sx={{ display: "flex", alignItems: "center", px: 1 }}>
//                     <Search sx={{ color: "rgba(255,255,255,0.6)" }} />
//                   </Box>
//                 ),
//                 sx: { color: "white", fontSize: "0.95rem", height: 48 },
//               }}
//               sx={{
//                 "& .MuiOutlinedInput-root": {
//                   borderRadius: "16px",
//                   bgcolor: "rgba(255,255,255,0.05)",
//                   border: "1px solid rgba(255,255,255,0.1)",
//                   "&:hover": { borderColor: "rgba(78,205,196,0.3)", bgcolor: "rgba(255,255,255,0.07)" },
//                   "&.Mui-focused": { borderColor: "#4ecdc4", borderWidth: "2px", boxShadow: "0 0 0 4px rgba(78,205,196,0.1)" },
//                 },
//                 "& .MuiInputBase-input::placeholder": { color: "rgba(255,255,255,0.4)" },
//                 maxWidth: { md: "500px" },
//               }}
//             />
//           </Box>

//           {/* Loading / Error */}
//           {isLoading && (
//             <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", flexDirection: "column", gap: 2 }}>
//               <CircularProgress sx={{ color: "#4ecdc4", width: 50, height: 50 }} />
//               <Typography variant="h6" sx={{ color: "#4ecdc4" }}>Loading restaurants...</Typography>
//             </Box>
//           )}
//           {error && (
//             <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", flexDirection: "column", gap: 2 }}>
//               <Typography variant="h6" sx={{ color: "#ff6b6b" }}>⚠ Error loading restaurants</Typography>
//               <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>Please try again later</Typography>
//             </Box>
//           )}

//           {/* Empty */}
//           {!isLoading && !error && filteredRestaurants.length === 0 && (
//             <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", flexDirection: "column", gap: 3, textAlign: "center" }}>
//               <Search sx={{ fontSize: 80, color: "rgba(255,255,255,0.2)" }} />
//               <Typography variant="h6">No restaurants found</Typography>
//             </Box>
//           )}

//           {/* Restaurants Grid */}
//           {!isLoading && !error && filteredRestaurants.length > 0 && (
//             <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: { xs: "center", sm: "flex-start" } }}>
//               {filteredRestaurants.map((restaurant) => (
//                 <Box key={restaurant._id} sx={{ width: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" }, minWidth: 280 }}>
//                   <RestaurantCard restaurant={restaurant} />
//                 </Box>
//               ))}
//             </Box>
//           )}
//         </Box>
//       </Box>
//     </Box>
//   );
// }
"use client";

import { useState, useEffect, useRef } from "react";
import { Box, Typography, TextField, List, ListItemButton, ListItemText, Chip, CircularProgress, Drawer, useMediaQuery } from "@mui/material";
import { Search, Restaurant } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/app/components/Navbar";
import RestaurantCard from "@/app/components/RestaurantCard";
import type { Restaurant as SanityRestaurant } from "@/src/sanity/types";

// نفس الأنترفيس من RestaurantCard
interface Owner {
  _id?: string;
  name?: string;
  email?: string;
}

interface RestaurantWithExpandedOwner extends Omit<SanityRestaurant, 'owner'> {
  owner?: Owner;
}

export default function RestaurantsPage() {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSearchSticky, setIsSearchSticky] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:900px)");
  const searchRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handler = () => setMobileCategoriesOpen((prev) => !prev);
    window.addEventListener("toggleCategoriesDrawer", handler as EventListener);
    return () => window.removeEventListener("toggleCategoriesDrawer", handler as EventListener);
  }, []);

  // Fetch categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<string[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/resturants/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  // Fetch restaurants (with owner expanded when available)
  const { data: restaurants = [], isLoading: isLoadingRestaurants, error } = useQuery<RestaurantWithExpandedOwner[]>({
    queryKey: ["restaurants"],
    queryFn: async () => {
      const res = await fetch("/api/resturants");
      if (!res.ok) throw new Error("Failed to fetch restaurants");
      const data: SanityRestaurant[] = await res.json();

      // Convert SanityRestaurant to RestaurantWithExpandedOwner
      return data.map(restaurant => {
        let owner: Owner | undefined;
        if (restaurant.owner) {
          if ('name' in restaurant.owner) {
            owner = restaurant.owner as unknown as Owner;
          } else {
            owner = undefined;
          }
        }
        return { ...restaurant, owner };
      });
    },
  });

  // Sticky search on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (searchRef.current && mainContentRef.current) {
        const scrollTop = mainContentRef.current.scrollTop;
        setIsSearchSticky(scrollTop >= 50); // تغيير من 100 إلى 50
      }
    };
    const mainContent = mainContentRef.current;
    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll);
      handleScroll(); // استدعاء أولي
      return () => mainContent.removeEventListener('scroll', handleScroll);
    }
  }, []);

  if (!mounted) return null;

  // Filter restaurants by search and category
  const filteredRestaurants = restaurants.filter((r) => {
    const matchesCategory = selectedCategory ? r.category === selectedCategory : true;
    const matchesSearch =
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryCount = (category: string) => restaurants.filter((r) => r.category === category).length;
  const totalRestaurants = restaurants.length;
  const isLoading = isLoadingCategories || isLoadingRestaurants;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#111", color: "white", fontFamily: "'Poppins', sans-serif" }}>
      <Navbar />
      <Box sx={{ display: "flex", pt: { xs: 8, md: 10 }, height: "calc(100vh - 64px)" }}>
        {/* Sidebar - ثابتة */}
        <Box
          sx={{
            width: { xs: "100%", md: 300 },
            borderRight: { md: "1px solid rgba(255,255,255,0.1)" },
            p: 3,
            display: { xs: "none", md: "block" },
            bgcolor: "#0a0a0a",
            borderRadius: "0 16px 16px 0",
            boxShadow: { md: "4px 0 20px rgba(0,0,0,0.3)" },
            height: "100%",
            position: "sticky",
            top: 0,
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3, fontSize: "1.2rem", color: "#4ecdc4", display: "flex", alignItems: "center", gap: 1 }}>
            <Restaurant sx={{ fontSize: 24 }} /> Categories
          </Typography>
          {isLoadingCategories && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={20} sx={{ color: "#4ecdc4" }} />
            </Box>
          )}
          <List sx={{ mt: 1 }}>
            <ListItemButton
              selected={selectedCategory === null}
              onClick={() => setSelectedCategory(null)}
              sx={{
                borderRadius: 3,
                mb: 2,
                py: 1.5,
                "&.Mui-selected": { bgcolor: "rgba(78, 205, 196, 0.15)", color: "#4ecdc4", "&:hover": { bgcolor: "rgba(78, 205, 196, 0.2)" } },
                "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
              }}
            >
              <ListItemText primary={<Typography sx={{ fontWeight: selectedCategory === null ? "bold" : "normal" }}>All Restaurants</Typography>} />
              <Chip
                label={totalRestaurants}
                size="small"
                sx={{ bgcolor: selectedCategory === null ? "#4ecdc4" : "rgba(255,255,255,0.1)", color: selectedCategory === null ? "#000" : "rgba(255,255,255,0.8)", fontWeight: "bold", fontSize: "0.8rem" }}
              />
            </ListItemButton>
            {!isLoadingCategories && categories.map((cat) => {
              const count = getCategoryCount(cat);
              if (count === 0) return null;
              return (
                <ListItemButton
                  key={cat}
                  selected={selectedCategory === cat}
                  onClick={() => setSelectedCategory(cat)}
                  sx={{
                    borderRadius: 3,
                    mb: 1.5,
                    py: 1.5,
                    "&.Mui-selected": { bgcolor: "rgba(78, 205, 196, 0.15)", color: "#4ecdc4", "&:hover": { bgcolor: "rgba(78, 205, 196, 0.2)" } },
                    "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
                  }}
                >
                  <ListItemText primary={<Typography sx={{ fontWeight: selectedCategory === cat ? "bold" : "normal" }}>{cat}</Typography>} />
                  <Chip
                    label={count}
                    size="small"
                    sx={{ bgcolor: selectedCategory === cat ? "#4ecdc4" : "rgba(255,255,255,0.1)", color: selectedCategory === cat ? "#000" : "rgba(255,255,255,0.8)", fontWeight: "bold", fontSize: "0.8rem" }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Box>

        {/* Mobile Categories Drawer */}
        <Drawer
          anchor="left"
          open={mobileCategoriesOpen && isMobile}
          onClose={() => setMobileCategoriesOpen(false)}
          PaperProps={{
            sx: {
              bgcolor: "#0a0a0a",
              color: "#fff",
              width: 300,
            },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3, fontSize: "1.2rem", color: "#4ecdc4", display: "flex", alignItems: "center", gap: 1 }}>
              <Restaurant sx={{ fontSize: 24 }} /> Categories
            </Typography>
            <List sx={{ mt: 1 }}>
              <ListItemButton
                selected={selectedCategory === null}
                onClick={() => {
                  setSelectedCategory(null);
                  setMobileCategoriesOpen(false);
                }}
                sx={{
                  borderRadius: 3,
                  mb: 2,
                  py: 1.5,
                  "&.Mui-selected": { bgcolor: "rgba(78, 205, 196, 0.15)", color: "#4ecdc4" },
                }}
              >
                <ListItemText primary={<Typography sx={{ fontWeight: selectedCategory === null ? "bold" : "normal" }}>All Restaurants</Typography>} />
                <Chip
                  label={totalRestaurants}
                  size="small"
                  sx={{ bgcolor: selectedCategory === null ? "#4ecdc4" : "rgba(255,255,255,0.1)", color: selectedCategory === null ? "#000" : "rgba(255,255,255,0.8)", fontWeight: "bold", fontSize: "0.8rem" }}
                />
              </ListItemButton>
              {!isLoadingCategories && categories.map((cat) => {
                const count = getCategoryCount(cat);
                if (count === 0) return null;
                return (
                  <ListItemButton
                    key={cat}
                    selected={selectedCategory === cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setMobileCategoriesOpen(false);
                    }}
                    sx={{
                      borderRadius: 3,
                      mb: 1.5,
                      py: 1.5,
                      "&.Mui-selected": { bgcolor: "rgba(78, 205, 196, 0.15)", color: "#4ecdc4" },
                    }}
                  >
                    <ListItemText primary={<Typography sx={{ fontWeight: selectedCategory === cat ? "bold" : "normal" }}>{cat}</Typography>} />
                    <Chip
                      label={count}
                      size="small"
                      sx={{ bgcolor: selectedCategory === cat ? "#4ecdc4" : "rgba(255,255,255,0.1)", color: selectedCategory === cat ? "#000" : "rgba(255,255,255,0.8)", fontWeight: "bold", fontSize: "0.8rem" }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        </Drawer>

        {/* Main Content - مع scroll داخلي */}
        <Box ref={mainContentRef} sx={{ flex: 1, p: { xs: 2, md: 4 }, height: "100%", overflowY: "auto", position: "relative" }}>
          {/* Search Box - Sticky مع تحسينات */}
          <Box
            ref={searchRef}
            sx={{
              display: "flex",
              gap: 2,
              mb: 4,
              flexDirection: { xs: "column", md: "row" },
              alignItems: { md: "center" },
              position: isSearchSticky ? "sticky" : "relative",
              top: isSearchSticky ? 0 : "auto",
              zIndex: isSearchSticky ? 1000 : "auto",
              bgcolor: isSearchSticky ? "rgba(17, 17, 17, 0.95)" : "transparent",
              py: isSearchSticky ? 2 : 0,
              px: isSearchSticky ? 2 : 0,
              borderRadius: isSearchSticky ? 2 : 0,
              boxShadow: isSearchSticky ? "0 4px 20px rgba(0,0,0,0.5)" : "none",
              transition: "all 0.3s ease",
              backdropFilter: isSearchSticky ? "blur(10px)" : "none",
              // إضافة حركة للأعلى عند التمرير
              transform: isSearchSticky ? "translateY(-15px)" : "translateY(0)",
              marginTop: isSearchSticky ? "-15px" : 0,
              borderBottom: isSearchSticky ? "1px solid rgba(78, 205, 196, 0.2)" : "none",
            }}
          >
            <TextField
              fullWidth
              placeholder="Search restaurants, location, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <Box sx={{ display: "flex", alignItems: "center", px: 1 }}>
                    <Search sx={{ color: "rgba(255,255,255,0.6)" }} />
                  </Box>
                ),
                sx: { 
                  color: "white", 
                  fontSize: "0.95rem", 
                  height: 48,
                  // إضافة تأثير للصندوق نفسه عندما يكون sticky
                  ...(isSearchSticky && {
                    bgcolor: "rgba(255,255,255,0.08)",
                    borderColor: "rgba(78,205,196,0.4)",
                  }),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "16px",
                  bgcolor: isSearchSticky ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)",
                  border: isSearchSticky ? "1px solid rgba(78,205,196,0.3)" : "1px solid rgba(255,255,255,0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": { 
                    borderColor: "rgba(78,205,196,0.3)", 
                    bgcolor: isSearchSticky ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.07)" 
                  },
                  "&.Mui-focused": { 
                    borderColor: "#4ecdc4", 
                    borderWidth: "2px", 
                    boxShadow: "0 0 0 4px rgba(78,205,196,0.1)" 
                  },
                },
                "& .MuiInputBase-input::placeholder": { color: "rgba(255,255,255,0.4)" },
                maxWidth: { md: "500px" },
                // تأثير تكبير بسيط عند sticky
                transform: isSearchSticky ? "scale(1.02)" : "scale(1)",
                transition: "transform 0.3s ease",
              }}
            />
          </Box>

          {/* Loading / Error */}
          {isLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", flexDirection: "column", gap: 2 }}>
              <CircularProgress sx={{ color: "#4ecdc4", width: 50, height: 50 }} />
              <Typography variant="h6" sx={{ color: "#4ecdc4" }}>Loading restaurants...</Typography>
            </Box>
          )}
          {error && (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", flexDirection: "column", gap: 2 }}>
              <Typography variant="h6" sx={{ color: "#ff6b6b" }}>⚠ Error loading restaurants</Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>Please try again later</Typography>
            </Box>
          )}

          {/* Empty */}
          {!isLoading && !error && filteredRestaurants.length === 0 && (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", flexDirection: "column", gap: 3, textAlign: "center" }}>
              <Search sx={{ fontSize: 80, color: "rgba(255,255,255,0.2)" }} />
              <Typography variant="h6">No restaurants found</Typography>
            </Box>
          )}

          {/* Restaurants Grid */}
          {!isLoading && !error && filteredRestaurants.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: { xs: "center", sm: "flex-start" } }}>
              {filteredRestaurants.map((restaurant) => (
                <Box key={restaurant._id} sx={{ width: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" }, minWidth: 280 }}>
                  <RestaurantCard restaurant={restaurant} />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

