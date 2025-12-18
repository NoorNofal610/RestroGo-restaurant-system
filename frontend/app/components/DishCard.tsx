"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  AddShoppingCart,
  Remove,
  Add,
} from "@mui/icons-material";
import Image from "next/image";
import { urlFor } from "@/app/sanity/image";
import type { Dish, SanityImage } from "@/src/sanity/types";

type Props = {
  dish: Dish;
  restaurantId: string;
};

export default function DishCard({ dish, restaurantId }: Props) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      const parsed = JSON.parse(currentUser);
      setUserId(parsed._id || null);
    }
  }, []);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!userId || !dish?._id) return;
      try {
        const res = await fetch(`/api/favorites?userId=${userId}&dishId=${dish._id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data?.isFavorite) setIsFavorite(true);
      } catch (err) {
        console.error("Favorite check failed", err);
      }
    };
    checkFavorite();
  }, [userId, dish?._id]);

  const increase = () => setQuantity((q) => q + 1);
  const decrease = () => setQuantity((q) => (q > 1 ? q - 1 : q));

  const handleAddToOrder = async () => {
    if (!userId) {
      setSnackbar({
        open: true,
        message: "Please login to add items to your cart",
        type: "info",
      });
      return;
    }

    if (!dish?._id || !restaurantId) return;

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          restaurantId,
          dishId: dish._id,
          quantity,
        }),
      });

      if (!res.ok) throw new Error("Failed to add to order");

      await res.json();
      setSnackbar({
        open: true,
        message: "Dish added to cart",
        type: "success",
      });
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Something went wrong while adding to cart",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!userId) {
      setSnackbar({
        open: true,
        message: "Please login to save favorites",
        type: "info",
      });
      return;
    }
    if (!dish?._id) return;

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        const res = await fetch("/api/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, dishId: dish._id }),
        });
        if (!res.ok) throw new Error("Failed to remove favorite");
        setIsFavorite(false);
      } else {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, dishId: dish._id }),
        });
        if (!res.ok) throw new Error("Failed to add favorite");
        setIsFavorite(true);
      }
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Something went wrong while updating favorites",
        type: "error",
      });
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 360,
        flex: "1 1 280px",
        bgcolor: "#1a1a1a",
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.05)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
        },
        position: "relative",
      }}
    >
      {/* Favorite */}
      <IconButton
        onClick={toggleFavorite}
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 2,
          bgcolor: "rgba(0,0,0,0.6)",
        }}
        disabled={favoriteLoading}
      >
        {isFavorite ? (
          <Favorite sx={{ color: "#ff6b6b" }} />
        ) : (
          <FavoriteBorder sx={{ color: "#fff" }} />
        )}
      </IconButton>

      {/* Image */}
      {dish.image?.asset && (
        <Box sx={{ position: "relative", height: 200 }}>
          <Image
            src={urlFor(dish.image).width(400).url()}
            alt={dish.name ?? "Dish"}
            fill
            style={{ objectFit: "cover" }}
          />
          {dish.category && (
            <Chip
              label={dish.category}
              size="small"
              sx={{
                position: "absolute",
                top: 12,
                left: 12,
                bgcolor: "rgba(0,0,0,0.7)",
                color: "#fff",
              }}
            />
          )}
        </Box>
      )}

      {/* Content */}
      <Box sx={{ p: 2.5 }}>
        {/* Restaurant info */}
        {"restaurant" in dish && dish.restaurant && typeof dish.restaurant === "object" && "name" in dish.restaurant && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
            {"logo" in dish.restaurant && (dish.restaurant as any).logo && (
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.2)",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                <Image
                  src={urlFor((dish.restaurant as { logo?: SanityImage }).logo as any).width(80).height(80).url()}
                  alt={(dish.restaurant as { name?: string }).name || "Restaurant logo"}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </Box>
            )}
            <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem", fontWeight: 500 }}>
              {(dish.restaurant as { name?: string }).name}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography fontWeight="bold" fontSize="1.1rem">
            {dish.name}
          </Typography>
          <Typography color="#4ecdc4" fontWeight="bold">
            ${typeof dish.price === "number" ? dish.price.toFixed(2) : "0.00"}
          </Typography>
        </Box>

        {dish.description && (
          <Typography
            sx={{
              color: "rgba(255,255,255,0.6)",
              mt: 1,
              fontSize: "0.9rem",
            }}
          >
            {dish.description}
          </Typography>
        )}

        {/* Actions */}
        <Box
          sx={{
            mt: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Quantity */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton size="small" onClick={decrease} disabled={quantity === 1}>
              <Remove />
            </IconButton>
            <Typography fontWeight="bold">{quantity}</Typography>
            <IconButton size="small" onClick={increase}>
              <Add />
            </IconButton>
          </Box>

          {/* Add to Cart */}
          <Button
            size="small"
            startIcon={<AddShoppingCart />}
            disabled={loading}
            onClick={handleAddToOrder}
            sx={{
              bgcolor: "#4ecdc4",
              color: "#000",
              fontWeight: "bold",
              borderRadius: 5,
              "&:hover": { bgcolor: "#3bb0a0" },
            }}
          >
            {loading ? "Adding..." : "Add"}
          </Button>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={(_, reason) => {
          if (reason === "clickaway") return;
          setSnackbar((prev) => ({ ...prev, open: false }));
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.type}
          sx={{
            bgcolor:
              snackbar.type === "success"
                ? "rgba(46, 204, 113, 0.1)"
                : snackbar.type === "error"
                ? "rgba(231, 76, 60, 0.1)"
                : "rgba(52, 152, 219, 0.1)",
            color:
              snackbar.type === "success"
                ? "#2ecc71"
                : snackbar.type === "error"
                ? "#e74c3c"
                : "#3498db",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
            borderRadius: 2,
            px: 2.5,
            py: 1.5,
            fontWeight: 500,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
