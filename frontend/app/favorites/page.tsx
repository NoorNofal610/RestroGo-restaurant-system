"use client";

import { useEffect, useState, useMemo } from "react";
import { Box, Typography, IconButton, Stack, Alert, CircularProgress, Grid } from "@mui/material";
import { Favorite, ArrowBack } from "@mui/icons-material";
import Navbar from "@/app/components/Navbar";
import { useRouter } from "next/navigation";
import DishCard from "@/app/components/DishCard";
import type { Dish } from "@/src/sanity/types";
import { urlFor } from "@/app/sanity/image";

type FavoriteItem = {
  _key: string;
  dish?: Dish;
};

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const router = useRouter();

  const fetchFavorites = async (uid: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/favorites?userId=${uid}`);
      if (!res.ok) throw new Error("Failed to load favorites");
      const data = await res.json();
      setFavorites(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("currentUser") : null;
    if (!stored) {
      setLoading(false);
      return;
    }
    try {
      const parsed = JSON.parse(stored) as { _id?: string };
      if (parsed?._id) {
        setUserId(parsed._id);
        fetchFavorites(parsed._id);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, []);

  const restaurantsWithFavorites = useMemo(() => {
    const map = new Map<
      string,
      { id: string; name: string; logo?: any }
    >();
    favorites.forEach((fav) => {
      const r = fav.dish?.restaurant;
      if (r && typeof r === "object" && "_id" in r) {
        const id = (r as any)._id as string;
        if (!map.has(id)) {
          map.set(id, {
            id,
            name: (r as any).name ?? "Restaurant",
            logo: (r as any).logo,
          });
        }
      }
    });
    return Array.from(map.values());
  }, [favorites]);

  useEffect(() => {
    if (!selectedRestaurantId && restaurantsWithFavorites.length > 0) {
      setSelectedRestaurantId(restaurantsWithFavorites[0].id);
    }
  }, [restaurantsWithFavorites, selectedRestaurantId]);

  return (
    <>
      <Navbar />
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#0a0a0a",
          backgroundImage: `radial-gradient(circle at 50% 0%, rgba(78, 205, 196, 0.15) 0%, transparent 50%)`,
          p: { xs: 2, md: 4 },
          pt: { xs: 10, md: 12 },
          color: "#fff",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <IconButton
          onClick={() => router.back()}
          sx={{
            position: "absolute",
            left: 16,
            top: 80,
            color: "#4ecdc4",
            bgcolor: "rgba(26,26,26,0.8)",
            border: "1px solid rgba(78, 205, 196, 0.2)",
          }}
        >
          <ArrowBack />
        </IconButton>

        <Box sx={{ maxWidth: 1200, mx: "auto", mb: 4, px: { xs: 1, sm: 0 } }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Favorite sx={{ color: "#ff6b6b", fontSize: 36 }} />
            <Typography variant="h4" fontWeight="bold" sx={{ color: "#fff" }}>
              Favorites
            </Typography>
          </Stack>
          <Typography sx={{ color: "rgba(255,255,255,0.7)", mt: 1, mb: 2 }}>
            Your saved dishes in one place
          </Typography>

          {restaurantsWithFavorites.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {restaurantsWithFavorites.map((r) => (
                <Box
                  key={r.id}
                  onClick={() => setSelectedRestaurantId(r.id)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 999,
                    cursor: "pointer",
                    border:
                      selectedRestaurantId === r.id
                        ? "1px solid rgba(78,205,196,0.8)"
                        : "1px solid rgba(255,255,255,0.15)",
                    bgcolor:
                      selectedRestaurantId === r.id
                        ? "rgba(78,205,196,0.15)"
                        : "rgba(255,255,255,0.05)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {r.logo && (
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "1px solid rgba(255,255,255,0.2)",
                        position: "relative",
                        flexShrink: 0,
                      }}
                    >
                      {/* simple img to avoid extra imports */}
                      <img
                        src={r.logo?.asset ? (urlFor as any)(r.logo).width(80).height(80).url() : ""}
                        alt={r.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </Box>
                  )}
                  <Typography
                    sx={{
                      color: "#fff",
                      fontSize: "0.85rem",
                      fontWeight: selectedRestaurantId === r.id ? 600 : 400,
                    }}
                  >
                    {r.name}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Box>

        {!userId ? (
          <Alert
            severity="info"
            sx={{
              maxWidth: 600,
              mx: "auto",
              bgcolor: "rgba(78,205,196,0.06)",
              color: "#4ecdc4",
              border: "1px solid rgba(78,205,196,0.3)",
            }}
          >
            Please login to view your favorites.
          </Alert>
        ) : loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <CircularProgress sx={{ color: "#4ecdc4" }} />
          </Box>
        ) : favorites.length === 0 ? (
          <Alert
            severity="info"
            sx={{
              maxWidth: 600,
              mx: "auto",
              bgcolor: "rgba(78,205,196,0.06)",
              color: "#4ecdc4",
              border: "1px solid rgba(78,205,196,0.3)",
            }}
          >
            You have no favorites yet.
          </Alert>
        ) : restaurantsWithFavorites.length === 0 || !selectedRestaurantId ? (
          <Alert
            severity="info"
            sx={{
              maxWidth: 600,
              mx: "auto",
              bgcolor: "rgba(78,205,196,0.06)",
              color: "#4ecdc4",
              border: "1px solid rgba(78,205,196,0.3)",
            }}
          >
            You have no favorite restaurants yet.
          </Alert>
        ) : (
          <Grid
            container
            spacing={2}
            sx={{
              maxWidth: 1200,
              mx: "auto",
              justifyContent: { xs: "center", md: "flex-start" },
            }}
          >
            {favorites
              .filter((fav) => {
                const r = fav.dish?.restaurant;
                return r && typeof r === "object" && "_id" in r && (r as any)._id === selectedRestaurantId;
              })
              .map((fav) =>
                fav.dish ? (
                  <Grid key={fav._key} sx={{ display: "flex", justifyContent: "center" }}>
                    <DishCard
                      dish={fav.dish}
                      restaurantId={fav.dish.restaurant && "_ref" in fav.dish.restaurant ? (fav.dish.restaurant as any)._ref : ""}
                    />
                  </Grid>
                ) : null
              )}
          </Grid>
        )}
      </Box>
    </>
  );
}

