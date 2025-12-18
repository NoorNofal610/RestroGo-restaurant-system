
"use client";

import { useState, useEffect } from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import GallerySection from "@/app/components/GallerySection";
import TopRatedRestaurants from "@/app/components/TopRatedRestaurants";
import PromoSection from "@/app/components/PromoSection";
import RatingsCarousel from "@/app/components/RatingsCarousel";
import Footer from "@/app/components/Footer";
import Image from "next/image";

export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const raf = requestAnimationFrame(() => setHydrated(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!hydrated) return null; // تجاهل العرض أثناء SSR

  return (
    <Box sx={{ bgcolor: "black", color: "white", minHeight: "100vh", fontFamily: "'Poppins', sans-serif" }}>
      <Navbar />
      <Box sx={{ position: "relative", width: "100%", height: { xs: 500, sm: 600, md: 700 } }}>
        <Image src="/img/Hero-img.jpg" alt="Restaurant Hero" fill style={{ objectFit: "cover" }} priority />
        <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", bgcolor: "rgba(0,0,0,0.5)" }} />
        <Container
          maxWidth="lg"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: { xs: "center", md: "flex-start" },
            px: { xs: 3, md: 5 },
            py: { xs: 6, md: 0 },
            zIndex: 10,
          }}
        >
          <Box sx={{ flex: 1, maxWidth: { md: "50%" } }}>
            <Typography variant="h2" sx={{ fontWeight: "bold", mb: 2 }}>
              Elevated Dining for Refined Palates
            </Typography>
            <Typography sx={{ mb: 3, color: "rgba(255,255,255,0.85)" }}>
              Taste the art of luxury. Enjoy exquisite dishes crafted for your refined taste.
            </Typography>
            <Button
              variant="contained"
              sx={{
                bgcolor: "rgba(255,255,255,0.1)",
                color: "white",
                fontWeight: "bold",
                "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                borderRadius: 2,
                px: 4,
                py: 1.5,
              }}
              onClick={() => router.push("/restaurantsPage")}
            >
              Get Started
            </Button>
          </Box>
        </Container>
      </Box>
      <GallerySection />
      <TopRatedRestaurants />
      <PromoSection />
      <RatingsCarousel />
      <Footer />
    </Box>
  );
}
