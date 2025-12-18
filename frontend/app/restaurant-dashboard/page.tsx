"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Divider,
  Modal,
  TextField,
  Alert,
  Grid,
  IconButton,
  MenuItem,
  Avatar,
  Menu,
} from "@mui/material";
import { Add, Delete, Edit, Close } from "@mui/icons-material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { urlFor } from "@/app/sanity/image";
import RatingsCarousel from "@/app/components/RatingsCarousel";
import OwnerDishCard from "@/app/components/OwnerDishCard";
import type { Dish } from "@/src/sanity/types";

export default function RestaurantDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ _id: string; name?: string; role?: string } | null>(null);
  const [restaurant, setRestaurant] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [dishes, setDishes] = useState<Dish[]>([]);
  const [dishesLoading, setDishesLoading] = useState(false);

  // Restaurant edit modal
  const [editRestaurantOpen, setEditRestaurantOpen] = useState(false);
  const [restaurantForm, setRestaurantForm] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    openingHours: "",
    category: "",
    imageAssetRef: "",
    logoAssetRef: "",
  });

  // Dish modals
  const [addDishOpen, setAddDishOpen] = useState(false);
  const [editDishOpen, setEditDishOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [dishForm, setDishForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "Other",
    imageAssetRef: "",
  });

  const [avatarAnchorEl, setAvatarAnchorEl] = useState<null | HTMLElement>(null);

  const CATEGORY_OPTIONS = [
    "Burger",
    "Sandwich",
    "Fries",
    "Pizza",
    "Pasta",
    "Salad",
    "Sushi",
    "Noodles",
    "Rice",
    "Coffee",
    "Tea",
    "Pastry",
    "Drink",
    "Dessert",
    "Main Dish",
    "Side Dish",
    "Other",
  ] as const;

  const restaurantId = restaurant?._id as string | undefined;
  const isAvatarMenuOpen = Boolean(avatarAnchorEl);

  const canAccess = useMemo(() => {
    return currentUser?.role === "restaurant";
  }, [currentUser]);

  const loadRestaurant = async (userId: string) => {
    const res = await fetch(`/api/owner/restaurant?userId=${userId}`);
    if (!res.ok) throw new Error("Failed to load restaurant");
    const data = await res.json();
    return data;
  };

  const loadDishes = async (rid: string) => {
    setDishesLoading(true);
    try {
      const res = await fetch(`/api/dishes?restaurantId=${rid}`);
      if (!res.ok) throw new Error("Failed to load dishes");
      const data = await res.json();
      setDishes(Array.isArray(data) ? data : []);
    } finally {
      setDishesLoading(false);
    }
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAvatarAnchorEl(event.currentTarget);
  };

  const handleAvatarMenuClose = () => {
    setAvatarAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    handleAvatarMenuClose();
    router.push("/");
  };

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("currentUser") : null;
    if (!stored) {
      setError("Please login to access the dashboard.");
      setLoading(false);
      return;
    }
    try {
      const parsed = JSON.parse(stored) as { _id: string; name?: string; role?: string };
      setCurrentUser(parsed);
    } catch {
      setError("Failed to read user session.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!currentUser?._id) return;
      setLoading(true);
      setError("");
      try {
        const r = await loadRestaurant(currentUser._id);
        setRestaurant(r);
        if (r?._id) {
          await loadDishes(r._id);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [currentUser]);

  useEffect(() => {
    if (!restaurant) return;
    setRestaurantForm({
      name: restaurant.name ?? "",
      description: restaurant.description ?? "",
      address: restaurant.address ?? "",
      phone: restaurant.phone ?? "",
      openingHours: restaurant.openingHours ?? "",
      category: restaurant.category ?? "",
      imageAssetRef: restaurant.image?.asset?._ref ?? "",
      logoAssetRef: restaurant.logo?.asset?._ref ?? "",
    });
  }, [restaurant]);

  const saveRestaurant = async () => {
    if (!restaurantId) return;
    const { imageAssetRef, logoAssetRef, ...rest } = restaurantForm;

    const payload: any = {
      ...rest,
    };

    if (imageAssetRef) {
      payload.image = {
        _type: "image",
        asset: { _type: "reference", _ref: imageAssetRef },
      };
    }

    if (logoAssetRef) {
      payload.logo = {
        _type: "image",
        asset: { _type: "reference", _ref: logoAssetRef },
      };
    }

    const res = await fetch(`/api/resturants/${restaurantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update restaurant");
    const updated = await res.json();
    setRestaurant(updated);
    setEditRestaurantOpen(false);
  };

  const openAddDish = () => {
    setDishForm({ name: "", description: "", price: "", category: "Other", imageAssetRef: "" });
    setAddDishOpen(true);
  };

  const submitAddDish = async () => {
    if (!restaurantId) return;
    const res = await fetch("/api/dishes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantId,
        name: dishForm.name,
        description: dishForm.description,
        price: Number(dishForm.price || 0),
        category: dishForm.category,
        image: dishForm.imageAssetRef
          ? {
              _type: "image",
              asset: { _type: "reference", _ref: dishForm.imageAssetRef },
            }
          : undefined,
      }),
    });
    if (!res.ok) throw new Error("Failed to create dish");
    setAddDishOpen(false);
    await loadDishes(restaurantId);
  };

  const openEditDish = (dish: Dish) => {
    setSelectedDish(dish);
    setDishForm({
      name: dish.name ?? "",
      description: dish.description ?? "",
      price: dish.price !== undefined && dish.price !== null ? String(dish.price) : "",
      category: (dish.category as string) ?? "Other",
      imageAssetRef: dish.image?.asset?._ref ?? "",
    });
    setEditDishOpen(true);
  };

  const submitEditDish = async () => {
    if (!selectedDish?._id) return;
    const res = await fetch("/api/dishes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dishId: selectedDish._id,
        name: dishForm.name,
        description: dishForm.description,
        price: Number(dishForm.price || 0),
        category: dishForm.category,
        image: dishForm.imageAssetRef
          ? {
              _type: "image",
              asset: { _type: "reference", _ref: dishForm.imageAssetRef },
            }
          : undefined,
      }),
    });
    if (!res.ok) throw new Error("Failed to update dish");
    setEditDishOpen(false);
    if (restaurantId) await loadDishes(restaurantId);
  };

  const deleteDish = async (dishId: string) => {
    const res = await fetch("/api/dishes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dishId }),
    });
    if (!res.ok) throw new Error("Failed to delete dish");
    if (restaurantId) await loadDishes(restaurantId);
  };

  return (
    <>
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0f0f0f",
        color: "white",
        p: { xs: 2, md: 4 },
        pt: { xs: 10, md: 12 },
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {/* Top inline logo + user icon (same style as Navbar avatar menu) */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
            mt: -1,
            pb: 1,
            bgcolor: "rgba(15,15,15,0.95)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "white",
                letterSpacing: 0.8,
              }}
            >
              RestroGo
            </Typography>

            {currentUser && (
              <>
                <IconButton onClick={handleAvatarClick} size="small">
                  <Avatar
                    src={(currentUser as any).profileImage}
                    alt={currentUser.name}
                    sx={{ width: 32, height: 32 }}
                  />
                </IconButton>
                <Menu
                  anchorEl={avatarAnchorEl}
                  open={isAvatarMenuOpen}
                  onClose={handleAvatarMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      borderRadius: 2,
                      bgcolor: "rgba(15,15,15,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      boxShadow: "0 18px 45px rgba(0,0,0,0.7)",
                      minWidth: 220,
                    },
                  }}
                >
                  <MenuItem
                    disabled
                    sx={{
                      cursor: "default",
                      opacity: 1,
                      py: 1.5,
                      alignItems: "flex-start",
                      flexDirection: "column",
                      gap: 0.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255,255,255,0.6)",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Signed in as
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: "#fff", fontWeight: 600 }}>
                      {currentUser.name}
                    </Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={handleLogout}
                    sx={{
                      mt: 0.5,
                      color: "#ff6b6b",
                      fontWeight: 500,
                      "&:hover": {
                        bgcolor: "rgba(255,107,107,0.1)",
                      },
                    }}
                  >
                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}
        </Box>

          <Typography variant="h4" fontWeight="bold" mb={3}>
        Restaurant Dashboard
      </Typography>

          {!canAccess && (
            <Alert severity="info" sx={{ mb: 3 }}>
              This dashboard is available for restaurant owners only.
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Paper sx={{ p: 3, bgcolor: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
              Loading...
            </Paper>
          ) : !restaurant ? (
            <Paper sx={{ p: 3, bgcolor: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
              <Typography sx={{ color: "rgba(255,255,255,0.75)" }}>
                No restaurant is linked to this account.
              </Typography>
            </Paper>
          ) : (
            <>
              {/* Restaurant info with background image and logo */}
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 3,
                  overflow: "hidden",
                  mb: 3,
                  minHeight: 180,
                  bgcolor: "rgba(15,15,15,0.9)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {/* Background image */}
                {restaurant.image?.asset && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      opacity: 0.35,
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.9) 100%)",
                      },
                    }}
                  >
                    <Image
                      src={urlFor(restaurant.image).width(1600).height(600).url()}
                      alt={restaurant.name || "Restaurant background"}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </Box>
                )}

                <Box
                  sx={{
                    position: "relative",
                    zIndex: 1,
                    p: { xs: 2.5, md: 3 },
                  }}
                >
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={3}
                    alignItems={{ xs: "flex-start", md: "center" }}
                  >
                    {/* Logo */}
                    {restaurant.logo?.asset && (
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: "50%",
                          overflow: "hidden",
                          border: "2px solid rgba(78,205,196,0.8)",
                          boxShadow: "0 0 25px rgba(78,205,196,0.5)",
                          position: "relative",
                          flexShrink: 0,
                        }}
                      >
                        <Image
                          src={urlFor(restaurant.logo).width(200).height(200).url()}
                          alt={restaurant.name || "Restaurant logo"}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      </Box>
                    )}

                    {/* Info */}
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        sx={{
                          color: "#4ecdc4",
                          letterSpacing: 0.5,
                        }}
                      >
                        {restaurant.name}
                      </Typography>
                      <Typography sx={{ color: "rgba(255,255,255,0.8)", mt: 1 }}>
                        {restaurant.description}
                      </Typography>
                      <Box
                        sx={{
                          mt: 2,
                          color: "rgba(226,232,240,0.9)",
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                          rowGap: 0.5,
                        }}
                      >
                        {restaurant.address && <div>📍 {restaurant.address}</div>}
                        {restaurant.phone && <div>📞 {restaurant.phone}</div>}
                        {restaurant.openingHours && <div>🕒 {restaurant.openingHours}</div>}
                        {restaurant.category && <div>🏷️ {restaurant.category}</div>}
                        <div>⭐ {restaurant.rating ?? 0}/5</div>
                      </Box>
                    </Box>

                    <Button
                      variant="outlined"
                      onClick={() => setEditRestaurantOpen(true)}
                      sx={{
                        borderColor: "rgba(78,205,196,0.6)",
                        color: "#4ecdc4",
                        fontWeight: 700,
                        bgcolor: "rgba(15,23,42,0.7)",
                        backdropFilter: "blur(10px)",
                        "&:hover": {
                          borderColor: "#4ecdc4",
                          bgcolor: "rgba(15,23,42,0.9)",
                        },
                        alignSelf: { xs: "flex-start", md: "center" },
                      }}
                    >
                      Edit restaurant details
                    </Button>
                  </Stack>
                </Box>
              </Box>

              {/* Ratings */}
              <RatingsCarousel
                title="Restaurant ratings"
                restaurantId={restaurantId}
                limit={50}
              />

              <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.1)" }} />

              {/* Dishes */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" fontWeight="bold">
                  Menu
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={openAddDish}
                  sx={{ bgcolor: "#4ecdc4", color: "#000", fontWeight: 800, "&:hover": { bgcolor: "#44b7d6" } }}
                >
                  Add dish
                </Button>
              </Stack>

              {dishesLoading ? (
                <Paper sx={{ p: 3, bgcolor: "rgba(255,255,255,0.06)", borderRadius: 3 }}>Loading dishes...</Paper>
              ) : dishes.length === 0 ? (
                <Paper sx={{ p: 3, bgcolor: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                  No dishes yet.
                </Paper>
              ) : (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
                      sm: "repeat(2, 1fr)",
                      md: "repeat(3, 1fr)",
                    },
                    gap: 2,
                  }}
                >
                  {dishes.map((dish) => (
                    <OwnerDishCard
                      key={dish._id}
                      dish={dish}
                      onEdit={openEditDish}
                      onDelete={deleteDish}
                    />
                  ))}
                </Box>
              )}

              {/* Edit restaurant modal */}
              <Modal open={editRestaurantOpen} onClose={() => setEditRestaurantOpen(false)}>
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "min(620px, 92vw)",
                    outline: "none",
                  }}
                >
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: "rgba(10,10,10,0.95)",
                      color: "#fff",
                      border: "1px solid rgba(78,205,196,0.4)",
                      boxShadow: "0 18px 45px rgba(0,0,0,0.7)",
                      position: "relative",
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => setEditRestaurantOpen(false)}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        color: "rgba(255,255,255,0.6)",
                        "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.08)" },
                      }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                    <Typography
                      variant="h6"
                      fontWeight="800"
                      mb={2}
                      sx={{ color: "#4ecdc4", letterSpacing: 0.5 }}
                    >
                      Edit restaurant
                    </Typography>

                    <Stack spacing={2}>
                      {["Name", "Description", "Address", "Phone", "Opening Hours", "Category"].map((label) => {
                        const key =
                          label === "Opening Hours"
                            ? "openingHours"
                            : (label.toLowerCase().replace(" ", "") as keyof typeof restaurantForm);
                        const multiline = label === "Description";
                        return (
                          <TextField
                            key={label}
                            label={label}
                            value={(restaurantForm as any)[key]}
                            onChange={(e) =>
                              setRestaurantForm((p) => ({
                                ...p,
                                [key]: e.target.value,
                              }))
                            }
                            fullWidth
                            multiline={multiline}
                            minRows={multiline ? 3 : undefined}
                            sx={{
                              "& .MuiInputLabel-root": {
                                color: "rgba(255,255,255,0.7)",
                              },
                              "& .MuiOutlinedInput-root": {
                                color: "#fff",
                                bgcolor: "rgba(255,255,255,0.03)",
                                "& fieldset": {
                                  borderColor: "rgba(78,205,196,0.4)",
                                },
                                "&:hover fieldset": {
                                  borderColor: "#4ecdc4",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#4ecdc4",
                                },
                              },
                            }}
                          />
                        );
                      })}
                    </Stack>

                    <Stack direction="row" gap={2} mt={3}>
                      <Button
                        component="label"
                        variant="outlined"
                        sx={{
                          borderColor: "rgba(78,205,196,0.5)",
                          color: "#4ecdc4",
                          "&:hover": { borderColor: "#4ecdc4", bgcolor: "rgba(78,205,196,0.08)" },
                        }}
                      >
                        {restaurant.logo?.asset ? "Change Logo" : "Upload Logo"}
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const fd = new FormData();
                            fd.append("file", file);
                            try {
                              const res = await fetch("/api/upload-image", {
                                method: "POST",
                                body: fd,
                              });
                              if (!res.ok) throw new Error("Failed to upload logo");
                              const data = await res.json();
                              const assetId = data.assetId as string;
                              setRestaurantForm((p) => ({
                                ...p,
                                logoAssetRef: assetId,
                              }));
                              setRestaurant((prev: any) =>
                                prev
                                  ? {
                                      ...prev,
                                      logo: {
                                        _type: "image",
                                        asset: { _type: "reference", _ref: assetId },
                                      },
                                    }
                                  : prev
                              );
                              if (restaurantId) {
                                await fetch(`/api/resturants/${restaurantId}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    logo: {
                                      _type: "image",
                                      asset: { _type: "reference", _ref: assetId },
                                    },
                                  }),
                                });
                              }
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                        />
                      </Button>
                      <Button
                        component="label"
                        variant="outlined"
                        sx={{
                          borderColor: "rgba(78,205,196,0.5)",
                          color: "#4ecdc4",
                          "&:hover": { borderColor: "#4ecdc4", bgcolor: "rgba(78,205,196,0.08)" },
                        }}
                      >
                        {restaurant.image?.asset ? "Change Background Image" : "Upload Background Image"}
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const fd = new FormData();
                            fd.append("file", file);
                            try {
                              const res = await fetch("/api/upload-image", {
                                method: "POST",
                                body: fd,
                              });
                              if (!res.ok) throw new Error("Failed to upload image");
                              const data = await res.json();
                              const assetId = data.assetId as string;
                              setRestaurantForm((p) => ({
                                ...p,
                                imageAssetRef: assetId,
                              }));
                              setRestaurant((prev: any) =>
                                prev
                                  ? {
                                      ...prev,
                                      image: {
                                        _type: "image",
                                        asset: { _type: "reference", _ref: assetId },
                                      },
                                    }
                                  : prev
                              );
                              if (restaurantId) {
                                await fetch(`/api/resturants/${restaurantId}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    image: {
                                      _type: "image",
                                      asset: { _type: "reference", _ref: assetId },
                                    },
                                  }),
                                });
                              }
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                        />
                      </Button>
                    </Stack>

                    <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
                      <Button
                        variant="outlined"
                        onClick={() => setEditRestaurantOpen(false)}
                        sx={{
                          borderColor: "rgba(78,205,196,0.5)",
                          color: "#4ecdc4",
                          "&:hover": {
                            borderColor: "#4ecdc4",
                            bgcolor: "rgba(78,205,196,0.08)",
                          },
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        onClick={async () => {
                          try {
                            await saveRestaurant();
                          } catch (e) {
                            setError(e instanceof Error ? e.message : "Failed to update restaurant");
                          }
                        }}
                        sx={{ bgcolor: "#4ecdc4", color: "#000", fontWeight: 800 }}
                      >
                        Save
                      </Button>
                    </Stack>
                  </Paper>
                </Box>
              </Modal>

              {/* Add dish modal */}
              <Modal open={addDishOpen} onClose={() => setAddDishOpen(false)}>
                <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "min(620px, 92vw)", outline: "none" }}>
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
                      bgcolor: "rgba(10,10,10,0.95)",
                      color: "#fff",
                      border: "1px solid rgba(78,205,196,0.4)",
                      boxShadow: "0 18px 45px rgba(0,0,0,0.7)",
                      position: "relative",
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => setAddDishOpen(false)}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        color: "rgba(255,255,255,0.6)",
                        "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.08)" },
                      }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                    <Typography
                      variant="h6"
                      fontWeight="800"
                      mb={2}
                      sx={{ color: "#4ecdc4", letterSpacing: 0.5 }}
                    >
                      Add dish
                    </Typography>
                    <Stack spacing={2}>
                      <TextField
                        label="Name"
                        value={dishForm.name}
                        onChange={(e) => setDishForm((p) => ({ ...p, name: e.target.value }))}
                        fullWidth
                        sx={{
                          "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                          "& .MuiOutlinedInput-root": {
                            color: "#fff",
                            bgcolor: "rgba(255,255,255,0.03)",
                            "& fieldset": { borderColor: "rgba(78,205,196,0.4)" },
                            "&:hover fieldset": { borderColor: "#4ecdc4" },
                            "&.Mui-focused fieldset": { borderColor: "#4ecdc4" },
                          },
                        }}
                      />
                      <TextField
                        label="Description"
                        value={dishForm.description}
                        onChange={(e) => setDishForm((p) => ({ ...p, description: e.target.value }))}
                        fullWidth
                        multiline
                        minRows={3}
                        sx={{
                          "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                          "& .MuiOutlinedInput-root": {
                            color: "#fff",
                            bgcolor: "rgba(255,255,255,0.03)",
                            "& fieldset": { borderColor: "rgba(78,205,196,0.4)" },
                            "&:hover fieldset": { borderColor: "#4ecdc4" },
                            "&.Mui-focused fieldset": { borderColor: "#4ecdc4" },
                          },
                        }}
                      />
                      <TextField
                        label="Price"
                        type="number"
                        value={dishForm.price}
                        onChange={(e) =>
                          setDishForm((p) => ({ ...p, price: e.target.value }))
                        }
                        fullWidth
                        sx={{
                          "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                          "& .MuiOutlinedInput-root": {
                            color: "#fff",
                            bgcolor: "rgba(255,255,255,0.03)",
                            "& fieldset": { borderColor: "rgba(78,205,196,0.4)" },
                            "&:hover fieldset": { borderColor: "#4ecdc4" },
                            "&.Mui-focused fieldset": { borderColor: "#4ecdc4" },
                          },
                        }}
                      />
                      <TextField
                        select
                        label="Category"
                        value={dishForm.category}
                        onChange={(e) =>
                          setDishForm((p) => ({ ...p, category: e.target.value }))
                        }
                        fullWidth
                        SelectProps={{
                          MenuProps: {
                            PaperProps: {
                              sx: {
                                maxHeight: 4 * 48 + 16, 
                                bgcolor: "rgba(8,47,73,0.98)",
                                backgroundImage:
                                  "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(8,47,73,0.98))",
                                borderRadius: 2,
                                border: "1px solid rgba(78,205,196,0.6)",
                                mt: 1,
                                "& .MuiMenuItem-root": {
                                  py: 1,
                                  color: "rgba(226,232,240,0.92)",
                                  "&.Mui-selected": {
                                    bgcolor: "rgba(78,205,196,0.22)",
                                  },
                                  "&.Mui-selected:hover": {
                                    bgcolor: "rgba(78,205,196,0.3)",
                                  },
                                  "&:hover": {
                                    bgcolor: "rgba(15,118,110,0.4)",
                                  },
                                },
                                "&::-webkit-scrollbar": {
                                  width: 6,
                                },
                                "&::-webkit-scrollbar-thumb": {
                                  backgroundColor: "rgba(148,163,184,0.7)",
                                  borderRadius: 999,
                                },
                              },
                            },
                          },
                        }}
                        sx={{
                          "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                          "& .MuiOutlinedInput-root": {
                            color: "#fff",
                            bgcolor: "rgba(255,255,255,0.03)",
                            "& fieldset": { borderColor: "rgba(78,205,196,0.4)" },
                            "&:hover fieldset": { borderColor: "#4ecdc4" },
                            "&.Mui-focused fieldset": { borderColor: "#4ecdc4" },
                          },
                        }}
                      >
                        {CATEGORY_OPTIONS.map((cat) => (
                          <MenuItem key={cat} value={cat}>
                            {cat}
                          </MenuItem>
                        ))}
                      </TextField>
                      <Button
                        component="label"
                        variant="outlined"
                        sx={{
                          borderColor: "rgba(78,205,196,0.5)",
                          color: "#4ecdc4",
                          "&:hover": {
                            borderColor: "#4ecdc4",
                            bgcolor: "rgba(78,205,196,0.08)",
                          },
                        }}
                      >
                        Upload Dish Image
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const fd = new FormData();
                            fd.append("file", file);
                            try {
                              const res = await fetch("/api/upload-image", {
                                method: "POST",
                                body: fd,
                              });
                              if (!res.ok) throw new Error("Failed to upload image");
                              const data = await res.json();
                              setDishForm((p) => ({
                                ...p,
                                imageAssetRef: data.assetId as string,
                              }));
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                        />
                      </Button>
                    </Stack>
                    <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
                      <Button
                        variant="outlined"
                        onClick={() => setAddDishOpen(false)}
                        sx={{
                          borderColor: "rgba(78,205,196,0.5)",
                          color: "#4ecdc4",
        "&:hover": {
                            borderColor: "#4ecdc4",
                            bgcolor: "rgba(78,205,196,0.08)",
        },
      }}
    >
                        Cancel
                      </Button>
                      <Button variant="contained" onClick={async () => { try { await submitAddDish(); } catch (e) { setError(e instanceof Error ? e.message : "Failed to create dish"); } }} disabled={!dishForm.name || Number.isNaN(Number(dishForm.price))} sx={{ bgcolor: "#4ecdc4", color: "#000", fontWeight: 800 }}>
                        Create
                      </Button>
                    </Stack>
                  </Paper>
                </Box>
              </Modal>

              {/* Edit dish modal */}
              <Modal open={editDishOpen} onClose={() => setEditDishOpen(false)}>
                <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "min(620px, 92vw)", outline: "none" }}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: "rgba(10,10,10,0.95)",
                      color: "#fff",
                      border: "1px solid rgba(78,205,196,0.4)",
                      boxShadow: "0 18px 45px rgba(0,0,0,0.7)",
                      position: "relative",
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => setEditDishOpen(false)}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        color: "rgba(255,255,255,0.6)",
                        "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.08)" },
                      }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                    <Typography
                      variant="h6"
                      fontWeight="800"
                      mb={2}
                      sx={{ color: "#4ecdc4", letterSpacing: 0.5 }}
                    >
                      Edit dish
      </Typography>
                    <Stack spacing={2}>
                      <TextField
                        label="Name"
                        value={dishForm.name}
                        onChange={(e) => setDishForm((p) => ({ ...p, name: e.target.value }))}
                        fullWidth
                        sx={{
                          "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                          "& .MuiOutlinedInput-root": {
                            color: "#fff",
                            bgcolor: "rgba(255,255,255,0.03)",
                            "& fieldset": { borderColor: "rgba(78,205,196,0.4)" },
                            "&:hover fieldset": { borderColor: "#4ecdc4" },
                            "&.Mui-focused fieldset": { borderColor: "#4ecdc4" },
                          },
                        }}
                      />
                      <TextField
                        label="Description"
                        value={dishForm.description}
                        onChange={(e) => setDishForm((p) => ({ ...p, description: e.target.value }))}
                        fullWidth
                        multiline
                        minRows={3}
                        sx={{
                          "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                          "& .MuiOutlinedInput-root": {
                            color: "#fff",
                            bgcolor: "rgba(255,255,255,0.03)",
                            "& fieldset": { borderColor: "rgba(78,205,196,0.4)" },
                            "&:hover fieldset": { borderColor: "#4ecdc4" },
                            "&.Mui-focused fieldset": { borderColor: "#4ecdc4" },
                          },
                        }}
                      />
                      <TextField
                        label="Price"
                        type="number"
                        value={dishForm.price}
                        onChange={(e) =>
                          setDishForm((p) => ({ ...p, price: e.target.value }))
                        }
                        fullWidth
                        sx={{
                          "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                          "& .MuiOutlinedInput-root": {
                            color: "#fff",
                            bgcolor: "rgba(255,255,255,0.03)",
                            "& fieldset": { borderColor: "rgba(78,205,196,0.4)" },
                            "&:hover fieldset": { borderColor: "#4ecdc4" },
                            "&.Mui-focused fieldset": { borderColor: "#4ecdc4" },
                          },
                        }}
                      />
                      <TextField
                        select
                        label="Category"
                        value={dishForm.category}
                        onChange={(e) =>
                          setDishForm((p) => ({ ...p, category: e.target.value }))
                        }
                        fullWidth
                        SelectProps={{
                          MenuProps: {
                            PaperProps: {
                              sx: {
                                maxHeight: 4 * 48 + 16,
                                bgcolor: "rgba(8,47,73,0.98)",
                                backgroundImage:
                                  "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(8,47,73,0.98))",
                                borderRadius: 2,
                                border: "1px solid rgba(78,205,196,0.6)",
                                mt: 1,
                                "& .MuiMenuItem-root": {
                                  py: 1,
                                  color: "rgba(226,232,240,0.92)",
                                  "&.Mui-selected": {
                                    bgcolor: "rgba(78,205,196,0.22)",
                                  },
                                  "&.Mui-selected:hover": {
                                    bgcolor: "rgba(78,205,196,0.3)",
                                  },
                                  "&:hover": {
                                    bgcolor: "rgba(15,118,110,0.4)",
                                  },
                                },
                                "&::-webkit-scrollbar": {
                                  width: 6,
                                },
                                "&::-webkit-scrollbar-thumb": {
                                  backgroundColor: "rgba(148,163,184,0.7)",
                                  borderRadius: 999,
                                },
                              },
                            },
                          },
                        }}
                        sx={{
                          "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                          "& .MuiOutlinedInput-root": {
                            color: "#fff",
                            bgcolor: "rgba(255,255,255,0.03)",
                            "& fieldset": { borderColor: "rgba(78,205,196,0.4)" },
                            "&:hover fieldset": { borderColor: "#4ecdc4" },
                            "&.Mui-focused fieldset": { borderColor: "#4ecdc4" },
                          },
                        }}
                      >
                        {CATEGORY_OPTIONS.map((cat) => (
                          <MenuItem key={cat} value={cat}>
                            {cat}
                          </MenuItem>
                        ))}
                      </TextField>
                      <Button
                        component="label"
                        variant="outlined"
                        sx={{
                          borderColor: "rgba(78,205,196,0.5)",
                          color: "#4ecdc4",
                          "&:hover": {
                            borderColor: "#4ecdc4",
                            bgcolor: "rgba(78,205,196,0.08)",
                          },
                        }}
                      >
                        Upload Dish Image
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const fd = new FormData();
                            fd.append("file", file);
                            try {
                              const res = await fetch("/api/upload-image", {
                                method: "POST",
                                body: fd,
                              });
                              if (!res.ok) throw new Error("Failed to upload image");
                              const data = await res.json();
                              setDishForm((p) => ({
                                ...p,
                                imageAssetRef: data.assetId as string,
                              }));
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                        />
                      </Button>
                    </Stack>
                    <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
                      <Button
                        variant="outlined"
                        onClick={() => setEditDishOpen(false)}
                        sx={{
                          borderColor: "rgba(78,205,196,0.5)",
                          color: "#4ecdc4",
                          "&:hover": {
                            borderColor: "#4ecdc4",
                            bgcolor: "rgba(78,205,196,0.08)",
                          },
                        }}
                      >
                        Cancel
                      </Button>
                      <Button variant="contained" onClick={async () => { try { await submitEditDish(); } catch (e) { setError(e instanceof Error ? e.message : "Failed to update dish"); } }} disabled={!dishForm.name || !selectedDish?._id} sx={{ bgcolor: "#4ecdc4", color: "#000", fontWeight: 800 }}>
                        Save
                      </Button>
                    </Stack>
    </Paper>
                </Box>
              </Modal>
            </>
          )}
        </Box>
      </Box>
    </>
  );
}
