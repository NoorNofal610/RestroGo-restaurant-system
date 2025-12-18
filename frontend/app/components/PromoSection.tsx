"use client";

import { Box, Typography, Button } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function PromoSection() {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "30% 70%" },
        gap: 4,
        px: { xs: 3, md: 6 },
        py: 10,
      }}
    >
      {/* Card 1 */}
      <Box
        sx={{
          position: "relative",
          height: 500, // ← الطول الجديد
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 6px 25px rgba(0,0,0,0.5)",
          transition: "0.4s ease",
          "&:hover": {
            transform: "translateY(-8px)",
          },
          "&:hover img": {
            transform: "scale(1.1)",
          },
        }}
      >
        <Image
          src="/img/sales.jpg"
          alt="Delivery Discount"
          fill
          style={{
            objectFit: "cover",
            transition: "0.5s ease",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            bgcolor: "rgba(0,0,0,0.55)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            px: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
            15% Off Delivery
          </Typography>

          <Typography
            variant="h6"
            sx={{ color: "rgba(255,255,255,0.85)", maxWidth: 360, mb: 3 }}
          >
            Enjoy an exclusive 15% discount when ordering online.
          </Typography>

          <Button
            variant="contained"
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(4px)",
              color: "white",
              px: 4,
              py: 1.2,
              borderRadius: 2,
              fontWeight: "bold",
              "&:hover": { bgcolor: "rgba(255,255,255,0.35)" },
            }}
            onClick={() => router.push("/cartPage?discount=15")}
          >
            Get Discount
          </Button>
        </Box>
      </Box>

      {/* Card 2 */}
      <Box
        sx={{
          position: "relative",
          height: 500, // ← الطول الجديد
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 6px 25px rgba(0,0,0,0.5)",
          transition: "0.4s ease",
          "&:hover": {
            transform: "translateY(-8px)",
          },
          "&:hover img": {
            transform: "scale(1.1)",
          },
        }}
      >
        <Image
          src="/img/resturent2.jpg"
          alt="Explore Restaurants"
          fill
          style={{
            objectFit: "cover",
            transition: "0.5s ease",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            bgcolor: "rgba(0,0,0,0.55)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
            Discover Top Restaurants
          </Typography>

          <Button
            variant="contained"
            sx={{
              bgcolor: "rgba(255,255,255,0.15)",
              color: "white",
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontSize: "1.1rem",
              fontWeight: "bold",
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
            }}
            onClick={() => router.push("/restaurantsPage")}
          >
            View Restaurants
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
