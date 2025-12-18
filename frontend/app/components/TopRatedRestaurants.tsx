"use client";

import { useQuery } from "@tanstack/react-query";
import { Box, Typography, Card, CardContent, Avatar, IconButton } from "@mui/material";
import { urlFor } from "@/app/sanity/image";
import type { Restaurant as SanityRestaurant } from "@/src/sanity/types";
import { Star, StarBorder, ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { useRef } from "react";
import { useRouter } from "next/navigation";

export default function TopRatedRestaurants() {
  const router = useRouter();
  const { data: restaurants, isLoading, error } = useQuery<SanityRestaurant[]>({
    queryKey: ["restaurants"],
    queryFn: async () => {
      const res = await fetch("/api/resturants");
      if (!res.ok) throw new Error("Failed to fetch restaurants");
      const data: SanityRestaurant[] = await res.json();
      return data.filter((r) => r.rating === 5).slice(0, 5);
    },
  });

  const renderStars = (rating: number | undefined) => {
    const stars = [];
    const value = rating ?? 0;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= value ? <Star key={i} sx={{ color: "#FFD700", fontSize: 18 }} /> : <StarBorder key={i} sx={{ color: "#FFD700", fontSize: 18 }} />
      );
    }
    return stars;
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <Box
      sx={{
        py: { xs: 4, md: 6 },
        px: { xs: 2, sm: 3, md: 4 },
        backgroundColor: "#121212",
        color: "white",
        position: "relative",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          mb: 3,
          textAlign: "center",
          fontWeight: "bold",
          letterSpacing: 0.5,
        }}
      >
        Top 5 Restaurants
      </Typography>

      {isLoading && <div style={{ textAlign: "center" }}>Loading...</div>}
      {error && <div style={{ textAlign: "center" }}>Error loading restaurants</div>}

      <IconButton
        onClick={() => scroll("left")}
        sx={{
          position: "absolute",
          top: "50%",
          left: 4,
          transform: "translateY(-50%)",
          zIndex: 10,
          bgcolor: "rgba(0,0,0,0.5)",
          color: "white",
          "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
          display: { xs: "flex", md: "flex" },
        }}
      >
        <ArrowBackIos />
      </IconButton>
      <IconButton
        onClick={() => scroll("right")}
        sx={{
          position: "absolute",
          top: "50%",
          right: 4,
          transform: "translateY(-50%)",
          zIndex: 10,
          bgcolor: "rgba(0,0,0,0.5)",
          color: "white",
          "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
          display: { xs: "flex", md: "flex" },
        }}
      >
        <ArrowForwardIos />
      </IconButton>

      <Box
        ref={scrollRef}
        sx={{
          display: "flex",
          gap: 3,
          overflowX: "auto",
          scrollBehavior: "smooth",
          pb: 2,
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {restaurants?.map((restaurant) => (
          <Card
            key={restaurant._id}
            onClick={() => router.push(`/restaurantsPage/${restaurant._id}`)}
            sx={{
              minWidth: { xs: 260, sm: 280, md: 300 },
              maxWidth: 320,
              height: 450,
              borderRadius: 3,
              overflow: "hidden",
              backgroundColor: "#1e1e1e",
              color: "white",
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              position: "relative",
              cursor: "pointer",
              transform: "translateY(0) scale(1)",
              transition: "transform 0.35s ease, box-shadow 0.35s ease, border 0.35s ease",
              border: "1px solid rgba(255,255,255,0.05)",
              "&:hover": {
                transform: "translateY(-10px) scale(1.03)",
                boxShadow: "0 18px 45px rgba(0,0,0,0.6)",
                border: "1px solid rgba(78,205,196,0.6)",
              },
            }}
          >
            {restaurant.image?.asset && (
              <Box 
                sx={{ 
                  position: "relative", 
                  height: "100%",
                  width: "100%",
                  overflow: "hidden"
                }}
              >
                <img
                  src={urlFor(restaurant.image).width(400).url()}
                  alt={restaurant.name ?? "Restaurant Image"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />

                {/* طبقة داكنة شفافة فوق الصورة */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)",
                  }}
                />
              </Box>
            )}

            <CardContent
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                padding: 2.5,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
              }}
            >
              {restaurant.logo?.asset && (
                <Avatar
                  src={urlFor(restaurant.logo).width(80).url()}
                  alt={restaurant.name + " Logo"}
                  sx={{ 
                    width: 60,
                    height: 60,
                    border: "2px solid white",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                    backgroundColor: "white",
                    flexShrink: 0,
                  }}
                />
              )}

              <Box sx={{ 
                display: "flex", 
                flexDirection: "column",
                flex: 1,
                gap: 0.5,
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                    lineHeight: 1.2
                  }}
                >
                  {restaurant.name}
                </Typography>

                {restaurant.address && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: "rgba(255,255,255,0.9)",
                      fontSize: "0.85rem",
                      lineHeight: 1.2
                    }}
                  >
                    {restaurant.address}
                  </Typography>
                )}

                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 0.5,
                  mt: 0.5
                }}>
                  {renderStars(restaurant.rating)}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: "rgba(255,255,255,0.9)",
                      ml: 1,
                      fontSize: "0.85rem",
                      fontWeight: "bold"
                    }}
                  >
                    {restaurant.rating || 5}/5
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}