"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Stack,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import { Delete, Check, Close } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import RestaurantCard from "@/app/components/RestaurantCard";

type AdminStats = {
  restaurants: number;
  dishes: number;
  users: number;
  pendingRequests: number;
};

type AdminRestaurant = {
  _id: string;
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  category?: string;
  rating?: number;
  image?: any;
  logo?: any;
  openingHours?: string;
};

type SignupRequest = {
  _id: string;
  name: string;
  email: string;
  restaurantName: string;
  restaurantCategory: string;
  restaurantDescription: string;
  createdAt?: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<{ _id?: string; name?: string; email?: string; role?: string; profileImage?: string } | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [requests, setRequests] = useState<SignupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [processingRequestIds, setProcessingRequestIds] = useState<Record<string, boolean>>({});
  const [avatarAnchorEl, setAvatarAnchorEl] = useState<null | HTMLElement>(null);
  const isAvatarMenuOpen = Boolean(avatarAnchorEl);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("currentUser") : null;
    if (!stored) {
      setAuthorized(false);
      router.push("/loginPage");
      return;
    }
    try {
      const user = JSON.parse(stored) as { _id?: string; name?: string; email?: string; role?: string; profileImage?: string };
      setCurrentUser(user);
      if (user.email === "admin@gmail.com") {
        setAuthorized(true);
      } else {
        setAuthorized(false);
        router.push("/");
        return;
      }
    } catch {
      setAuthorized(false);
      router.push("/loginPage");
      return;
    }
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [statsRes, restaurantsRes, requestsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/restaurants"),
        fetch("/api/admin/restaurant-requests"),
      ]);

      if (!statsRes.ok) throw new Error("Failed to load stats");
      if (!restaurantsRes.ok) throw new Error("Failed to load restaurants");
      if (!requestsRes.ok) throw new Error("Failed to load signup requests");

      const statsData = await statsRes.json();
      const restaurantsData = await restaurantsRes.json();
      const requestsData = await requestsRes.json();

      setStats(statsData);
      setRestaurants(Array.isArray(restaurantsData) ? restaurantsData : []);
      setRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      loadData();
    }
  }, [authorized]);

  const handleDeleteRestaurant = async (id: string) => {
    try {
      await fetch(`/api/admin/restaurants?id=${id}`, { method: "DELETE" });
      setRestaurants((prev) => prev.filter((r) => r._id !== id));
      if (stats) setStats({ ...stats, restaurants: stats.restaurants - 1 });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestAction = async (id: string, action: "approve" | "reject") => {
    try {
      if (processingRequestIds[id]) return;
      setProcessingRequestIds((prev) => ({ ...prev, [id]: true }));
      const res = await fetch("/api/admin/restaurant-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (!res.ok) throw new Error("Failed to update request");
      setRequests((prev) => prev.filter((r) => r._id !== id));
      if (stats && action === "approve") {
        setStats({
          ...stats,
          restaurants: stats.restaurants + 1,
          users: stats.users + 1,
          pendingRequests: stats.pendingRequests - 1,
        });
      } else if (stats) {
        setStats({ ...stats, pendingRequests: stats.pendingRequests - 1 });
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to update request");
    } finally {
      setProcessingRequestIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAvatarAnchorEl(event.currentTarget);
  };

  const handleAvatarMenuClose = () => {
    setAvatarAnchorEl(null);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentUser");
    }
    setCurrentUser(null);
    handleAvatarMenuClose();
    router.push("/");
  };

  if (authorized === null) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "#4ecdc4" }} />
      </Box>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#050505",
        color: "white",
        p: { xs: 2, md: 4 },
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <Box sx={{ maxWidth: 1300, mx: "auto" }}>
        {/* Top inline logo + user icon (same style as RestaurantDashboard) */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2.5,
            mt: -1,
            pb: 1,
            bgcolor: "rgba(5,5,5,0.96)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", color: "white", letterSpacing: 0.8 }}
          >
            RestroGo
          </Typography>

          {currentUser && (
            <>
              <IconButton onClick={handleAvatarClick} size="small">
                <Avatar
                  src={(currentUser as any).profileImage}
                  alt={currentUser.name}
                  sx={{ width: 32, height: 32 }}
                />
              </IconButton>
              <Menu
                anchorEl={avatarAnchorEl}
                open={isAvatarMenuOpen}
                onClose={handleAvatarMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    borderRadius: 2,
                    bgcolor: "rgba(15,15,15,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 18px 45px rgba(0,0,0,0.7)",
                    minWidth: 220,
                  },
                }}
              >
                <MenuItem
                  disabled
                  sx={{
                    cursor: "default",
                    opacity: 1,
                    py: 1.5,
                    alignItems: "flex-start",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.6)",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Signed in as
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: "#fff", fontWeight: 600 }}>
                    {currentUser.name || "Admin"}
                  </Typography>
                </MenuItem>
                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    mt: 0.5,
                    color: "#ff6b6b",
                    fontWeight: 500,
                    "&:hover": { bgcolor: "rgba(255,107,107,0.1)" },
                  }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>

        <Typography
          variant="h4"
          fontWeight="bold"
          mb={3}
          sx={{ color: "white" }}
        >
          Admin Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading || !stats ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <CircularProgress sx={{ color: "#4ecdc4" }} />
          </Box>
        ) : (
          <>
            {/* Stats section with bar cards + donut chart */}
            <Grid container spacing={3} mb={4}>
              {/* Bar cards */}
              {[
                { label: "Restaurants", value: stats.restaurants, color: "#4ecdc4" },
                { label: "Dishes", value: stats.dishes, color: "#ff9f43" },
                { label: "Users", value: stats.users, color: "#3498db" },
                { label: "Pending Requests", value: stats.pendingRequests, color: "#e74c3c" },
              ].map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item.label}>
                  <Paper
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      bgcolor: "rgba(15,15,15,0.96)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "white",
                    }}
                  >
                    <Typography sx={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", mb: 1 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 1, color: "#fff" }}>
                      {item.value}
                    </Typography>
                    <Box
                      sx={{
                        height: 8,
                        borderRadius: 999,
                        bgcolor: "rgba(255,255,255,0.08)",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${Math.min(item.value * 10, 100)}%`,
                          height: "100%",
                          bgcolor: item.color,
                          transition: "width 0.3s ease",
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
              ))}

              {/* Donut chart summary */}
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: "rgba(10,10,10,0.96)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    height: "100%",
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, color: "#fff", fontWeight: "bold" }}>
                    Site Overview
                  </Typography>
                  {(() => {
                    const total =
                      stats.restaurants + stats.dishes + stats.users + stats.pendingRequests || 1;
                    const rPct = (stats.restaurants / total) * 100;
                    const dPct = (stats.dishes / total) * 100;
                    const uPct = (stats.users / total) * 100;
                    const pPct = (stats.pendingRequests / total) * 100;
                    return (
                      <>
                        <Box
                          sx={{
                            mx: "auto",
                            mb: 2.5,
                            width: 160,
                            height: 160,
                            borderRadius: "50%",
                            backgroundImage: `conic-gradient(#4ecdc4 0 ${rPct}%, #ff9f43 ${rPct}% ${
                              rPct + dPct
                            }%, #3498db ${rPct + dPct}% ${rPct + dPct + uPct}%, #e74c3c ${
                              rPct + dPct + uPct
                            }% 100%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                          }}
                        >
                          <Box
                            sx={{
                              width: 100,
                              height: 100,
                              borderRadius: "50%",
                              bgcolor: "#050505",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexDirection: "column",
                            }}
                          >
                            <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
                              Total
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#fff" }}>
                              {total}
                            </Typography>
                          </Box>
                        </Box>
                        <Stack spacing={1}>
                          {[
                            { label: "Restaurants", value: stats.restaurants, color: "#4ecdc4" },
                            { label: "Dishes", value: stats.dishes, color: "#ff9f43" },
                            { label: "Users", value: stats.users, color: "#3498db" },
                            {
                              label: "Pending Requests",
                              value: stats.pendingRequests,
                              color: "#e74c3c",
                            },
                          ].map((item) => (
                            <Box
                              key={item.label}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                fontSize: "0.85rem",
                              }}
                            >
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                <Box
                                  sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    bgcolor: item.color,
                                  }}
                                />
                                <Typography sx={{ color: "rgba(255,255,255,0.75)" }}>
                                  {item.label}
                                </Typography>
                              </Box>
                              <Typography sx={{ color: "#fff", fontWeight: 500 }}>
                                {item.value}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </>
                    );
                  })()}
                </Paper>
              </Grid>
            </Grid>

            {/* Main layout: restaurants list + signup requests */}
            <Grid container spacing={3}>
              {/* Left: restaurants */}
              <Grid item xs={12} md={8}>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  mb={2}
                  sx={{ color: "#fff" }}
                >
                  All Restaurants
                </Typography>
                {restaurants.length === 0 ? (
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: "rgba(15,15,15,0.9)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.8)",
                    }}
                  >
                    No restaurants yet.
                  </Paper>
                ) : (
                  <Grid container spacing={2}>
                    {restaurants.map((r) => (
                      <Grid item xs={12} sm={6} key={r._id}>
                        <Box sx={{ position: "relative" }}>
                          <RestaurantCard restaurant={r as any} />
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteRestaurant(r._id)}
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              bgcolor: "rgba(0,0,0,0.7)",
                              color: "#ff6b6b",
                              "&:hover": {
                                bgcolor: "rgba(255,107,107,0.15)",
                              },
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>

              {/* Right: pending signup requests */}
              <Grid item xs={12} md={4}>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  mb={2}
                  sx={{ color: "#fff" }}
                >
                  Pending Restaurant Signups
                </Typography>
                {requests.length === 0 ? (
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: "rgba(15,15,15,0.9)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.8)",
                    }}
                  >
                    No pending requests.
                  </Paper>
                ) : (
                  <Stack spacing={2}>
                    {requests.map((req) => (
                      <Paper
                        key={req._id}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          bgcolor: "rgba(15,15,15,0.95)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.85)",
                        }}
                      >
                        <Typography fontWeight="bold" sx={{ mb: 0.5, color: "#fff" }}>
                          {req.restaurantName}
                        </Typography>
                        <Typography sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", mb: 0.5 }}>
                          By: {req.name} • {req.email}
                        </Typography>
                        <Typography sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", mb: 0.5 }}>
                          Category: {req.restaurantCategory}
                        </Typography>
                        <Typography sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", mb: 1 }}>
                          {req.restaurantDescription}
                        </Typography>
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Close />}
                            onClick={() => handleRequestAction(req._id, "reject")}
                            disabled={!!processingRequestIds[req._id]}
                            sx={{
                              borderColor: "rgba(231,76,60,0.7)",
                              color: "#e74c3c",
                              "&:hover": { borderColor: "#e74c3c", bgcolor: "rgba(231,76,60,0.12)" },
                            }}
                          >
                            Reject
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<Check />}
                            onClick={() => handleRequestAction(req._id, "approve")}
                            disabled={!!processingRequestIds[req._id]}
                            sx={{
                              bgcolor: "#4ecdc4",
                              color: "#000",
                              fontWeight: "bold",
                              "&:hover": { bgcolor: "#3bb0a0" },
                            }}
                          >
                            Approve
                          </Button>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </Box>
  );
}


