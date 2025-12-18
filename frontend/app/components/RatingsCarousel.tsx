"use client";

import { useQuery } from "@tanstack/react-query";
import { Box, Typography, Card, CardContent, IconButton, Rating, Avatar } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { useRef } from "react";
import { urlFor } from "@/app/sanity/image";

type RatingItem = {
  _id: string;
  rating?: number;
  comment?: string;
  createdAt?: string;
  user?: { _id: string; name?: string };
  restaurant?: { _id: string; name?: string; logo?: any };
};

type RatingsCarouselProps = {
  title?: string;
  restaurantId?: string;
  limit?: number;
};

export default function RatingsCarousel({ title = "Latest Ratings", restaurantId, limit = 10 }: RatingsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: ratings, isLoading } = useQuery<RatingItem[]>({
    queryKey: ["ratings", "carousel", restaurantId ?? "all", limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      if (restaurantId) params.set("restaurantId", restaurantId);
      const res = await fetch(`/api/ratings?${params.toString()}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: direction === "left" ? -340 : 340, behavior: "smooth" });
  };

  return (
    <Box
      sx={{
        py: { xs: 4, md: 6 },
        px: { xs: 2, sm: 3, md: 6 },
        backgroundColor: "#0f0f0f",
        color: "#fff",
        position: "relative",
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto", position: "relative" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3, textAlign: "center" }}>
          {title}
        </Typography>

        <IconButton
          onClick={() => scroll("left")}
          sx={{
            position: "absolute",
            top: "50%",
            left: -8,
            transform: "translateY(-50%)",
            zIndex: 10,
            bgcolor: "rgba(0,0,0,0.5)",
            color: "white",
            "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
          }}
        >
          <ArrowBackIos />
        </IconButton>

        <IconButton
          onClick={() => scroll("right")}
          sx={{
            position: "absolute",
            top: "50%",
            right: -8,
            transform: "translateY(-50%)",
            zIndex: 10,
            bgcolor: "rgba(0,0,0,0.5)",
            color: "white",
            "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
          }}
        >
          <ArrowForwardIos />
        </IconButton>

        <Box
          ref={scrollRef}
          sx={{
            display: "flex",
            gap: 2.5,
            overflowX: "auto",
            scrollBehavior: "smooth",
            pb: 2,
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {isLoading ? (
            <Typography sx={{ color: "rgba(255,255,255,0.7)", mx: "auto" }}>Loading...</Typography>
          ) : (ratings ?? []).length === 0 ? (
            <Typography sx={{ color: "rgba(255,255,255,0.7)", mx: "auto" }}>
              No ratings yet.
            </Typography>
          ) : (
            (ratings ?? []).map((r) => (
              <Card
                key={r._id}
                sx={{
                  minWidth: { xs: 280, sm: 320 },
                  maxWidth: 360,
                  borderRadius: 3,
                  bgcolor: "rgba(26,26,26,0.85)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(14px)",
                  flexShrink: 0,
                  transition: "transform 0.25s ease, border 0.25s ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    border: "1px solid rgba(78,205,196,0.4)",
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                    {r.restaurant?.logo?.asset ? (
                      <Avatar
                        src={urlFor(r.restaurant.logo).width(80).height(80).url()}
                        alt={r.restaurant?.name ?? "Restaurant"}
                        sx={{ width: 36, height: 36, bgcolor: "#fff" }}
                      />
                    ) : (
                      <Avatar sx={{ width: 36, height: 36, bgcolor: "rgba(78,205,196,0.2)", color: "#4ecdc4" }}>
                        {(r.restaurant?.name ?? "R").slice(0, 1)}
                      </Avatar>
                    )}
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, color: "#fff" }} noWrap>
                        {r.restaurant?.name ?? "Restaurant"}
                      </Typography>
                      <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }} noWrap>
                        {r.user?.name ?? "Anonymous"}
                      </Typography>
                    </Box>
                  </Box>

                  <Rating value={r.rating ?? 0} readOnly precision={1} sx={{ color: "#4ecdc4", mb: 1 }} />

                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.75)",
                      fontSize: "0.95rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      minHeight: 60,
                    }}
                  >
                    {r.comment ?? ""}
                  </Typography>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      </Box>
    </Box>
  );
}


