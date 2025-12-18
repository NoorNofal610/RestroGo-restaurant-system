"use client";

import { useQuery } from "@tanstack/react-query";
import { Box, Typography, Card, Avatar } from "@mui/material";
import { Star, StarBorder } from "@mui/icons-material";
import type { Review } from "@/src/sanity/types";

export default function ReviewsSection() {
  const { data: reviews, isLoading, error } = useQuery<Review[]>({
    queryKey: ["reviews"],
    queryFn: async () => {
      const res = await fetch("/api/reviews");
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
  });

  const renderStars = (rating?: 1 | 2 | 3 | 4 | 5) => {
    const stars = [];
    const value = rating ?? 0;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= value ? (
          <Star key={i} sx={{ color: "#FFD700", fontSize: 18 }} />
        ) : (
          <StarBorder key={i} sx={{ color: "#FFD700", fontSize: 18 }} />
        )
      );
    }
    return stars;
  };

  if (isLoading) return <Typography>Loading reviews...</Typography>;
  if (error) return <Typography>Error loading reviews</Typography>;

  return (
    <Box sx={{ py: 10, px: 3, bgcolor: "#111", color: "white" }}>
      <Typography variant="h4" sx={{ mb: 6, textAlign: "center" }}>
        Customer Reviews
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 3,
          overflowX: "auto",
          scrollBehavior: "smooth",
          paddingBottom: 2,
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {reviews?.map((review) => (
          <Card
            key={review._id}
            sx={{
              minWidth: 300,   // 🔥 نفس عرض Top Rated Restaurants
              maxWidth: 300,
              height: 230,    // 🔥 ارتفاع صغير
              borderRadius: 3,
              backgroundColor: "#1e1e1e",
              color: "white",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 2,
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
          >
            <Avatar sx={{ width: 55, height: 55, mb: 1 }}>
              {review.user?._ref?.charAt(0).toUpperCase() || "U"}
            </Avatar>

            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              {review.user?._ref ?? "Anonymous"}
            </Typography>

            <Typography
              sx={{
                fontSize: "0.9rem",
                textAlign: "center",
                mb: 1,
                height: 55,
                overflow: "hidden",
              }}
            >
              {review.comment ?? "No comment"}
            </Typography>

            <Box sx={{ display: "flex", gap: 0.5 }}>
              {renderStars(review.rating)}
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
