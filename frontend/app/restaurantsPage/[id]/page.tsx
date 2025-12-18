
"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Typography,
  CircularProgress,
  Divider,
  Rating,
  Button,
  Modal,
  Paper,
  TextField as MuiTextField,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  TextField,
  Drawer,
  useMediaQuery,
} from "@mui/material";
import Image from "next/image";
import { urlFor } from "@/app/sanity/image";
import Navbar from "@/app/components/Navbar";
import DishCard from "@/app/components/DishCard"; 
import type { Dish, Restaurant } from "@/src/sanity/types";
import React, { useState, useRef, useEffect } from "react";
import { Search, LocalDining } from "@mui/icons-material";

// Helper function to get dish category icon
const getCategoryIcon = (category: string) => {
  switch(category) {
    case "Burger": return "🍔";
    case "Pizza": return "🍕";
    case "Pasta": return "🍝";
    case "Sushi": return "🍣";
    case "Coffee": return "☕";
    case "Tea": return "🍵";
    case "Drink": return "🥤";
    case "Dessert": return "🍰";
    case "Salad": return "🥗";
    case "Sandwich": return "🥪";
    case "Fries": return "🍟";
    case "Noodles": return "🍜";
    case "Rice": return "🍚";
    case "Pastry": return "🥐";
    case "Main Dish": return "🍛";
    case "Side Dish": return "🥗";
    default: return "🍽️";
  }
};

export default function RestaurantPage() {
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSearchSticky, setIsSearchSticky] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:900px)");
  const searchRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [rateOpen, setRateOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState<number | null>(0);
  const [ratingComment, setRatingComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  /* -------- Restaurant -------- */
  const {
    data: restaurant,
    isLoading: loadingRestaurant,
    error: errorRestaurant,
    refetch: refetchRestaurant,
  } = useQuery<Restaurant>({
    queryKey: ["restaurant", id],
    queryFn: async () => {
      const res = await fetch(`/api/resturants/${id}`);
      if (!res.ok) throw new Error("Failed to fetch restaurant");
      return res.json();
    },
    enabled: !!id,
  });

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("currentUser") : null;
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as { _id?: string };
      if (parsed?._id) setCurrentUserId(parsed._id);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const handler = () => setMobileCategoriesOpen((prev) => !prev);
    window.addEventListener("toggleCategoriesDrawer", handler as EventListener);
    return () => window.removeEventListener("toggleCategoriesDrawer", handler as EventListener);
  }, []);

  /* -------- Dishes -------- */
  const {
    data: dishes = [],
    isLoading: loadingDishes,
  } = useQuery<Dish[]>({
    queryKey: ["dishes", id],
    queryFn: async () => {
      const res = await fetch(`/api/dishes?restaurantId=${id}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!id,
  });

  /* -------- Extract actual categories from dishes -------- */
  const dishCategories = React.useMemo(() => {
    if (!dishes || dishes.length === 0) return [];
    
    // Get unique categories from dishes
    const categoriesSet = new Set<string>();
    dishes.forEach(dish => {
      if (dish.category && dish.category.trim() !== "") {
        categoriesSet.add(dish.category);
      }
    });
    
    return Array.from(categoriesSet).sort();
  }, [dishes]);

  /* -------- Filtering -------- */
  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory = selectedCategory ? dish.category === selectedCategory : true;
    const matchesSearch =
      dish.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryCount = (category: string) => 
    dishes.filter((d) => d.category === category).length;

  const submitRating = async () => {
    if (!id) return;
    if (!currentUserId) return;
    if (!ratingValue || ratingValue < 1) return;
    if (!ratingComment.trim()) return;

    setSubmittingRating(true);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          restaurantId: id,
          rating: ratingValue,
          comment: ratingComment,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit rating");
      await res.json();
      setRateOpen(false);
      setRatingValue(0);
      setRatingComment("");
      refetchRestaurant();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingRating(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (searchRef.current && mainContentRef.current) {
        const scrollTop = mainContentRef.current.scrollTop;
        
        setIsSearchSticky(scrollTop >= 50);
      }
    };

    const mainContent = mainContentRef.current;
    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => mainContent.removeEventListener('scroll', handleScroll);
    }
  }, []);

  /* -------- Loading -------- */
  if (loadingRestaurant || loadingDishes) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#111", color: "#fff", fontFamily: "'Poppins', sans-serif" }}>
        <Navbar />
        <Box sx={{ display: "flex", pt: { xs: 8, md: 10 }, height: "calc(100vh - 64px)" }}>
          {/* Sidebar Loading */}
          <Box
            sx={{
              width: { xs: "100%", md: 300 },
              borderRight: "1px solid rgba(255,255,255,0.1)",
              p: 3,
              display: { xs: "none", md: "block" },
              bgcolor: "#0a0a0a",
              height: "100%",
              position: "sticky",
              top: 0,
              overflowY: "auto",
            }}
          >
            <Box sx={{ width: "80%", height: 32, bgcolor: "#1a1a1a", borderRadius: 1, mb: 3 }} />
            <Box sx={{ width: "100%", height: 48, bgcolor: "#1a1a1a", borderRadius: 2, mb: 2 }} />
            {[...Array(5)].map((_, i) => (
              <Box key={i} sx={{ width: "100%", height: 48, bgcolor: "#1a1a1a", borderRadius: 2, mb: 1 }} />
            ))}
          </Box>

          {/* Main Content Loading */}
          <Box ref={mainContentRef} sx={{ flex: 1, p: { xs: 2, md: 4 }, height: "100%", overflowY: "auto" }}>
            <Box sx={{ width: "100%", height: 48, bgcolor: "#1a1a1a", borderRadius: 3, mb: 4 }} />
            
            {/* Restaurant Header Loading */}
            <Box sx={{ display: "flex", gap: 4, mb: 6, flexWrap: "wrap" }}>
              <Box sx={{ width: 180, height: 180, bgcolor: "#1a1a1a", borderRadius: 2 }} />
              <Box sx={{ flex: 1, minWidth: 280 }}>
                <Box sx={{ width: "60%", height: 40, bgcolor: "#1a1a1a", borderRadius: 1, mb: 2 }} />
                <Box sx={{ width: "30%", height: 24, bgcolor: "#1a1a1a", borderRadius: 1, mb: 2 }} />
                <Box sx={{ width: "80%", height: 60, bgcolor: "#1a1a1a", borderRadius: 1 }} />
              </Box>
            </Box>

            <Box sx={{ width: "100%", height: 1, bgcolor: "#333", mb: 4 }} />
            <Box sx={{ width: "20%", height: 32, bgcolor: "#1a1a1a", borderRadius: 1, mb: 4 }} />

            {/* Dishes Grid Loading */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              {[...Array(3)].map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    width: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" },
                    minWidth: 280,
                    height: 280,
                    bgcolor: "#1a1a1a",
                    borderRadius: 3,
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  /* -------- Error -------- */
  if (errorRestaurant || !restaurant) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#111", color: "#fff" }}>
        <Navbar />
        <Box sx={{ textAlign: "center", mt: 8, color: "#fff" }}>
          <Typography variant="h5" sx={{ color: "#ff6b6b" }}>
            ⚠ Restaurant not found
          </Typography>
        </Box>
      </Box>
    );
  }

  /* -------- UI -------- */
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#111", color: "white", fontFamily: "'Poppins', sans-serif" }}>
      <Navbar />

      <Box sx={{ display: "flex", pt: { xs: 8, md: 10 }, height: "calc(100vh - 64px)" }}>
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
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              mb: 3,
              fontSize: "1.2rem",
              color: "#4ecdc4",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <LocalDining sx={{ fontSize: 24 }} />
            Dish Categories
          </Typography>

          <List sx={{ mt: 1 }}>
            <ListItemButton
              selected={selectedCategory === null}
              onClick={() => setSelectedCategory(null)}
              sx={{
                borderRadius: 3,
                mb: 2,
                py: 1.5,
                "&.Mui-selected": {
                  bgcolor: "rgba(78, 205, 196, 0.15)",
                  color: "#4ecdc4",
                  "&:hover": { bgcolor: "rgba(78, 205, 196, 0.2)" },
                },
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.05)",
                },
              }}
            >
              <ListItemText
                primary={<Typography sx={{ fontWeight: selectedCategory === null ? "bold" : "normal" }}>All Dishes</Typography>}
              />
              <Chip
                label={dishes.length}
                size="small"
                sx={{
                  bgcolor: selectedCategory === null ? "#4ecdc4" : "rgba(255,255,255,0.1)",
                  color: selectedCategory === null ? "#000" : "rgba(255,255,255,0.8)",
                  fontWeight: "bold",
                  fontSize: "0.8rem",
                }}
              />
            </ListItemButton>

            {dishCategories.length === 0 ? (
              <Typography sx={{ color: "rgba(255,255,255,0.5)", textAlign: "center", py: 2 }}>
                No categories found
              </Typography>
            ) : (
              dishCategories.map((cat) => {
                const count = getCategoryCount(cat);
                return (
                  <ListItemButton
                    key={cat}
                    selected={selectedCategory === cat}
                    onClick={() => setSelectedCategory(cat)}
                    sx={{
                      borderRadius: 3,
                      mb: 1.5,
                      py: 1.5,
                      "&.Mui-selected": {
                        bgcolor: "rgba(78, 205, 196, 0.15)",
                        color: "#4ecdc4",
                        "&:hover": { bgcolor: "rgba(78, 205, 196, 0.2)" },
                      },
                      "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography component="span" sx={{ fontSize: "1.2rem" }}>
                            {getCategoryIcon(cat)}
                          </Typography>
                          <Typography sx={{ fontWeight: selectedCategory === cat ? "bold" : "normal" }}>
                            {cat}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip
                      label={count}
                      size="small"
                      sx={{
                        bgcolor: selectedCategory === cat ? "#4ecdc4" : "rgba(255,255,255,0.1)",
                        color: selectedCategory === cat ? "#000" : "rgba(255,255,255,0.8)",
                        fontWeight: "bold",
                        fontSize: "0.8rem",
                      }}
                    />
                  </ListItemButton>
                );
              })
            )}
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
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                mb: 3,
                fontSize: "1.2rem",
                color: "#4ecdc4",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <LocalDining sx={{ fontSize: 24 }} />
              Dish Categories
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
                  "&.Mui-selected": {
                    bgcolor: "rgba(78, 205, 196, 0.15)",
                    color: "#4ecdc4",
                  },
                }}
              >
                <ListItemText
                  primary={<Typography sx={{ fontWeight: selectedCategory === null ? "bold" : "normal" }}>All Dishes</Typography>}
                />
                <Chip
                  label={dishes.length}
                  size="small"
                  sx={{
                    bgcolor: selectedCategory === null ? "#4ecdc4" : "rgba(255,255,255,0.1)",
                    color: selectedCategory === null ? "#000" : "rgba(255,255,255,0.8)",
                    fontWeight: "bold",
                    fontSize: "0.8rem",
                  }}
                />
              </ListItemButton>

              {dishCategories.map((cat) => {
                const count = getCategoryCount(cat);
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
                      "&.Mui-selected": {
                        bgcolor: "rgba(78, 205, 196, 0.15)",
                        color: "#4ecdc4",
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography component="span" sx={{ fontSize: "1.2rem" }}>
                            {getCategoryIcon(cat)}
                          </Typography>
                          <Typography sx={{ fontWeight: selectedCategory === cat ? "bold" : "normal" }}>
                            {cat}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip
                      label={count}
                      size="small"
                      sx={{
                        bgcolor: selectedCategory === cat ? "#4ecdc4" : "rgba(255,255,255,0.1)",
                        color: selectedCategory === cat ? "#000" : "rgba(255,255,255,0.8)",
                        fontWeight: "bold",
                        fontSize: "0.8rem",
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        </Drawer>

        <Box 
          ref={mainContentRef}
          sx={{ 
            flex: 1, 
            p: { xs: 2, md: 4 },
            height: "100%",
            overflowY: "auto",
            position: "relative",
          }}
        >
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
              placeholder="Search dishes by name or description..."
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
                transform: isSearchSticky ? "scale(1.02)" : "scale(1)",
                transition: "transform 0.3s ease",
              }}
            />
          </Box>

          {/* Restaurant Header */}
          <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap", mb: 6 }}>
            {restaurant.logo?.asset && (
              <Box sx={{ width: 180, height: 180, position: "relative", flexShrink: 0 }}>
                <Image
                  src={urlFor(restaurant.logo).width(400).url()}
                  alt={restaurant.name || "Restaurant Logo"}
                  fill
                  style={{ objectFit: "contain" }}
                />
              </Box>
            )}
            <Box sx={{ flex: 1, minWidth: 280 }}>
              <Typography variant="h4" fontWeight="bold">{restaurant.name}</Typography>

              {/* Current average rating (read-only) */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5 }}>
                <Rating
                  value={restaurant.rating ?? 0}
                  readOnly
                  precision={0.1}
                  sx={{ color: "#4ecdc4" }}
                />
                <Typography sx={{ color: "#4ecdc4", fontSize: "0.9rem", fontWeight: 600 }}>
                  {(restaurant.rating ?? 0).toFixed(1)}/5
                </Typography>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setRateOpen(true)}
                  disabled={!currentUserId}
                  sx={{
                    borderColor: "rgba(78,205,196,0.4)",
                    color: "#4ecdc4",
                    fontWeight: 600,
                    "&:hover": {
                      borderColor: "#4ecdc4",
                      bgcolor: "rgba(78,205,196,0.08)",
                    },
                    "&.Mui-disabled": { color: "rgba(255,255,255,0.4)", borderColor: "rgba(255,255,255,0.2)" },
                  }}
                >
                  {currentUserId ? "Rate this restaurant" : "Login to rate"}
                </Button>
              </Box>
              {restaurant.category && <Typography sx={{ color: "#4ecdc4", mt: 1 }}>{restaurant.category}</Typography>}
              {restaurant.description && <Typography sx={{ color: "rgba(255,255,255,0.7)", mt: 2 }}>{restaurant.description}</Typography>}
              <Box sx={{ mt: 2, color: "rgba(255,255,255,0.6)" }}>
                {restaurant.address && <div>📍 {restaurant.address}</div>}
                {restaurant.phone && <div>📞 {restaurant.phone}</div>}
                {restaurant.openingHours && <div>🕒 {restaurant.openingHours}</div>}
              </Box>
            </Box>
          </Box>

          {/* Rating modal */}
          <Modal open={rateOpen} onClose={() => setRateOpen(false)}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "min(520px, 92vw)",
                outline: "none",
              }}
            >
              <Paper
                sx={{
                  bgcolor: "rgba(26,26,26,0.95)",
                  border: "1px solid rgba(78,205,196,0.25)",
                  borderRadius: 3,
                  p: 3,
                  color: "#fff",
                  backdropFilter: "blur(20px)",
                }}
              >
                <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                  Rate {restaurant.name}
                </Typography>

                <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 1 }}>
                  Select your rating
                </Typography>
                <Rating
                  value={ratingValue}
                  precision={1}
                  max={5}
                  onChange={(_, v) => setRatingValue(v)}
                  sx={{ color: "#4ecdc4", mb: 2 }}
                />

                <MuiTextField
                  fullWidth
                  multiline
                  minRows={4}
                  label="Comment"
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  sx={{
                    mb: 3,
                    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                    "& .MuiOutlinedInput-root": {
                      color: "#fff",
                      bgcolor: "rgba(255,255,255,0.03)",
                      borderColor: "rgba(78, 205, 196, 0.3)",
                    },
                  }}
                />

                <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                  <Button
                    variant="outlined"
                    onClick={() => setRateOpen(false)}
                    sx={{ borderColor: "rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.8)" }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={submitRating}
                    disabled={submittingRating || !currentUserId || !ratingValue || !ratingComment.trim()}
                    sx={{ bgcolor: "#4ecdc4", color: "#000", fontWeight: 800 }}
                  >
                    {submittingRating ? "Submitting..." : "Submit"}
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Modal>

          <Divider sx={{ mb: 4, borderColor: "rgba(255,255,255,0.1)" }} />

          {/* Menu Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <Typography
              variant="h5"
              sx={{ color: "#4ecdc4", fontWeight: "bold" }}
            >
              Menu
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>
              {filteredDishes.length} {filteredDishes.length === 1 ? 'dish' : 'dishes'} found
            </Typography>
          </Box>

          {filteredDishes.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh", flexDirection: "column", gap: 3, textAlign: "center" }}>
              <Search sx={{ fontSize: 80, color: "rgba(255,255,255,0.2)" }} />
              <Typography variant="h6">No dishes found</Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                Try a different search or category
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: { xs: "center", sm: "flex-start" } }}>
              {filteredDishes.map((dish) => (
                <DishCard
                  key={dish._id}
                  dish={dish}
                  restaurantId={id as string}
                  userId="user-id-placeholder" 
                  // userId={currentUser._id} 
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}