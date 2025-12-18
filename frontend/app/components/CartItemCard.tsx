"use client";

import { Box, Typography, IconButton, Paper, CircularProgress } from "@mui/material";
import { Add, Remove, Delete } from "@mui/icons-material";
import Image from "next/image";
import type { SanityImage } from "@/src/sanity/types";

type CartItemCardProps = {
  item: {
    _key: string;
    dish: {
      _id: string;
      name: string;
      price: number;
      image?: SanityImage | null;
    } | null; 
    quantity: number;
  };
  updating: string | null;
  userId: string;
  onCartChange?: (order: unknown | null) => void;
  onUpdateQuantity: (itemKey: string, newQuantity: number) => void;
  onRemoveItem: (itemKey: string) => void;
  getImageUrl: (image: SanityImage | undefined | null) => string;
  calculateItemTotal: (price: number, quantity: number) => string;
};

export default function CartItemCard({
  item,
  updating,
  userId,
  onCartChange,
  onUpdateQuantity,
  onRemoveItem,
  getImageUrl,
  calculateItemTotal,
}: CartItemCardProps) {
  // Do not render the card if dish is missing
  if (!item.dish) {
    return null;
  }

  const { dish } = item;
  const [localQuantity, setLocalQuantity] = useState(item.quantity);

  // Keep local quantity in sync if parent updates item
  useEffect(() => {
    setLocalQuantity(item.quantity);
  }, [item.quantity]);

  const handleQuantityChange = async (delta: number) => {
    const next = Math.max(1, localQuantity + delta);
    if (next === localQuantity) return;

    setLocalQuantity(next);
    onUpdateQuantity(item._key, next);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, itemKey: item._key }),
      });

      if (!res.ok) {
        throw new Error("Failed to remove item from cart");
      }

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      onCartChange?.(data);
      onRemoveItem(item._key);
    } catch (err) {
      console.error("Failed to delete cart item:", err);
    }
  };

  return (
    <Paper
      sx={{
        mb: 2,
        p: 3,
        bgcolor: "rgba(26, 26, 26, 0.5)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: 3,
        backdropFilter: "blur(10px)",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          borderColor: "rgba(78, 205, 196, 0.3)",
        },
      }}
    >
      {/* Loading Overlay */}
      {updating === item._key && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
            borderRadius: 3,
          }}
        >
          <CircularProgress size={24} sx={{ color: "#4ecdc4" }} />
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
        {/* Dish Image */}
        <Box
          sx={{
            position: "relative",
            width: 100,
            height: 100,
            minWidth: 100,
            borderRadius: 2,
            overflow: "hidden",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Image
            src={getImageUrl(dish.image)}
            alt={dish.name || "Dish image"}
            fill
            sizes="100px"
            style={{ objectFit: "cover" }}
          />
        </Box>

        {/* Dish Info */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: "#fff", mb: 0.5 }}>
            {dish.name || "Unnamed Dish"}
          </Typography>
          <Typography sx={{ color: "#4ecdc4", fontWeight: 600, mb: 1 }}>
            ${(dish.price || 0).toFixed(2)}
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
            Freshly prepared with premium ingredients
          </Typography>
        </Box>

        {/* Quantity Controls */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={() => handleQuantityChange(-1)}
              disabled={updating === item._key}
              sx={{
                color: "#fff",
                bgcolor: "rgba(255, 255, 255, 0.05)",
                "&:hover": { bgcolor: "rgba(78, 205, 196, 0.1)" },
                "&.Mui-disabled": { color: "rgba(255, 255, 255, 0.3)" },
              }}
            >
              <Remove />
            </IconButton>

            <Typography
              variant="h6"
              sx={{
                minWidth: 40,
                textAlign: "center",
                fontWeight: "bold",
                color: "#fff",
              }}
            >
              {localQuantity}
            </Typography>

            <IconButton
              onClick={() => handleQuantityChange(1)}
              disabled={updating === item._key}
              sx={{
                color: "#fff",
                bgcolor: "rgba(255, 255, 255, 0.05)",
                "&:hover": { bgcolor: "rgba(78, 205, 196, 0.1)" },
                "&.Mui-disabled": { color: "rgba(255, 255, 255, 0.3)" },
              }}
            >
              <Add />
            </IconButton>
          </Box>

          <Typography variant="body2" sx={{ color: "#4ecdc4", fontWeight: 600 }}>
            ${calculateItemTotal(dish.price || 0, item.quantity)}
          </Typography>
        </Box>

        {/* Delete Button */}
        <IconButton
          onClick={handleDelete}
          disabled={updating === item._key}
          sx={{
            color: "#ff6b6b",
            "&:hover": {
              bgcolor: "rgba(255, 107, 107, 0.1)",
            },
            "&.Mui-disabled": { color: "rgba(255, 107, 107, 0.3)" },
          }}
        >
          <Delete />
        </IconButton>
      </Box>
    </Paper>
  );
}