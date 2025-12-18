"use client";

import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import Image from "next/image";
import { urlFor } from "@/app/sanity/image";
import type { Dish } from "@/src/sanity/types";

type Props = {
  dish: Dish;
  onEdit: (dish: Dish) => void;
  onDelete: (id: string) => void;
};

export default function OwnerDishCard({ dish, onEdit, onDelete }: Props) {
  return (
    <Paper
      sx={{
        borderRadius: 3,
        bgcolor: "rgba(26,26,26,0.9)",
        border: "1px solid rgba(255,255,255,0.08)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Dish image - أكبر شوية وتظهر كاملة قدر الإمكان */}
      {dish.image?.asset && (
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: 190,
          }}
        >
          <Image
            src={urlFor(dish.image as any).width(700).height(500).url()}
            alt={dish.name || "Dish image"}
            fill
            style={{ objectFit: "cover" }}
          />
        </Box>
      )}

      <Box sx={{ p: 2, flexGrow: 1 }}>
        <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => onEdit(dish)}
            sx={{ bgcolor: "rgba(0,0,0,0.6)", color: "#4ecdc4" }}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDelete(dish._id)}
            sx={{ bgcolor: "rgba(0,0,0,0.6)", color: "#ff6b6b" }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>

        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, pr: 6 }}>
          {dish.name}
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 2, minHeight: 44 }}>
          {dish.description}
        </Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ color: "#4ecdc4", fontWeight: 800 }}>
            ${Number(dish.price ?? 0).toFixed(2)}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>
            {dish.category ?? "Other"}
          </Typography>
        </Stack>
      </Box>
    </Paper>
  );
}


