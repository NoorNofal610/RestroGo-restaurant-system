"use client";

import { Box, Container, Typography } from "@mui/material";
import Image from "next/image";

const items = [
  { id: "1", img: "/gallery/img1.jpg", height: 400 },
  { id: "2", img: "/gallery/img2.jpg", height: 300 },
  { id: "3", img: "/gallery/img3.jpg", height: 500 },
  { id: "4", img: "/gallery/img4.jpg", height: 350 },
  { id: "5", img: "/gallery/img5.jpg", height: 450 },
  { id: "6", img: "/gallery/img6.jpg", height: 400 },
  { id: "7", img: "/gallery/img7.jpg", height: 380 }, 
  { id: "8", img: "/gallery/img8.jpg", height: 420 },
];

export default function GallerySection() {
  return (
    <Box sx={{ bgcolor: "#111", color: "white", py: 8 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          sx={{ mb: 4, fontWeight: "bold", textAlign: "center" }}
        >
          Explore Stunning Moments
        </Typography>

        {/* Grid Masonry */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr 1fr",
              lg: "1fr 1fr 1fr 1fr",
            },
            gap: 2,
          }}
        >
          {items.map((item) => (
            <Box
              key={item.id}
              component="a"
              sx={{
                position: "relative",
                width: "100%",
                pb: `${(item.height / 600) * 100}%`, // نسبة الطول إلى العرض
                borderRadius: 2,
                overflow: "hidden",
                transition: "transform 0.3s ease, filter 0.3s ease",
                "&:hover": {
                  transform: "scale(0.95)",
                  filter: "brightness(1.1)",
                },
              }}
            >
              <Image
                src={item.img}
                alt={`Gallery ${item.id}`}
                fill
                style={{ objectFit: "cover" }}
              />
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
