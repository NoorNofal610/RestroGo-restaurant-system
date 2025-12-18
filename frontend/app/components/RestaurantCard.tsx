"use client";

import { Card, CardContent, Typography, Box, Rating, Chip, Divider } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/app/sanity/image";
import type { Restaurant } from "@/src/sanity/types";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RestaurantIcon from "@mui/icons-material/Restaurant";

interface Owner {
  _id?: string;
  name?: string;
  email?: string;
}

interface RestaurantWithExpandedOwner extends Omit<Restaurant, 'owner'> {
  owner?: Owner;
}

export default function RestaurantCard({ restaurant }: { restaurant: RestaurantWithExpandedOwner }) {
  // Check if owner data is expanded (has name property)
  const ownerName = restaurant.owner?.name;

  return (
    <Link
      href={`/restaurantsPage/${restaurant._id}`}
      style={{ textDecoration: "none" }}
    >
      <Card
        sx={{
          bgcolor: "#1a1a1a",
          borderRadius: 3,
          cursor: "pointer",
          transition: "0.3s",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          },
        }}
      >
        {/* Image with Logo overlay */}
        {restaurant.image?.asset && (
          <Box sx={{ position: "relative", height: 200 }}>
            <Image
              src={urlFor(restaurant.image).width(600).url()}
              alt={restaurant.name ?? "Restaurant"}
              fill
              style={{ objectFit: "cover" }}
              priority
            />
            
            {/* Logo overlay */}
            {restaurant.logo?.asset && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: -20,
                  left: 16,
                  width: 60,
                  height: 60,
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "3px solid #1a1a1a",
                  bgcolor: "#1a1a1a",
                }}
              >
                <Image
                  src={urlFor(restaurant.logo).width(100).url()}
                  alt={`${restaurant.name} logo`}
                  fill
                  style={{ objectFit: "contain", padding: 4 }}
                />
              </Box>
            )}
          </Box>
        )}

        <CardContent sx={{ flexGrow: 1, pt: restaurant.logo?.asset ? 3 : 2 }}>
          {/* Restaurant Name and Category */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
            <Typography
              variant="h6"
              sx={{ 
                color: "#fff", 
                fontWeight: "bold",
                fontSize: "1.25rem",
                lineHeight: 1.2
              }}
            >
              {restaurant.name}
            </Typography>
            
            {restaurant.category && (
              <Chip
                label={restaurant.category}
                size="small"
                sx={{
                  bgcolor: "rgba(78,205,196,0.2)",
                  color: "#4ecdc4",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              />
            )}
          </Box>

          {/* Rating */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Rating
              value={restaurant.rating || 0}
              readOnly
              precision={0.5}
              size="small"
              sx={{ color: "#4ecdc4" }}
            />
            <Typography sx={{ color: "#4ecdc4", fontSize: "0.9rem", fontWeight: 600 }}>
              {restaurant.rating?.toFixed(1) || "0.0"}
            </Typography>
          </Box>

          {/* Divider */}
          <Divider sx={{ bgcolor: "#333", mb: 2 }} />

          {/* Description */}
          {restaurant.description && (
            <Typography
              variant="body2"
              sx={{
                color: "#bbb",
                fontSize: "0.875rem",
                lineHeight: 1.4,
                mb: 2,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {restaurant.description}
            </Typography>
          )}

          {/* Details Grid */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {/* Address */}
            {restaurant.address && (
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                <LocationOnIcon sx={{ color: "#4ecdc4", fontSize: 18, mt: 0.25 }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: "#ddd",
                    fontSize: "0.85rem",
                    lineHeight: 1.3,
                  }}
                >
                  {restaurant.address}
                </Typography>
              </Box>
            )}

            {/* Phone */}
            {restaurant.phone && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PhoneIcon sx={{ color: "#4ecdc4", fontSize: 18 }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: "#ddd",
                    fontSize: "0.85rem",
                  }}
                >
                  {restaurant.phone}
                </Typography>
              </Box>
            )}

            {/* Opening Hours */}
            {restaurant.openingHours && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AccessTimeIcon sx={{ color: "#4ecdc4", fontSize: 18 }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: "#ddd",
                    fontSize: "0.85rem",
                  }}
                >
                  {restaurant.openingHours}
                </Typography>
              </Box>
            )}

            {/* Owner Info - Only show if we have the expanded data */}
            {ownerName && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <RestaurantIcon sx={{ color: "#4ecdc4", fontSize: 18 }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: "#ddd",
                    fontSize: "0.85rem",
                  }}
                >
                  Owner: {ownerName}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
}