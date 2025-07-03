import React from "react";
import { Box, Skeleton } from "@mui/material";

const VariantSelectorSkeleton: React.FC = () => {
  return (
    <Box sx={{ my: 3 }}>
      {/* Title skeleton */}
      <Skeleton variant="text" width={180} height={32} sx={{ mb: 2 }} />

      {/* Color variant skeleton */}
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="text" width={100} height={24} sx={{ mb: 1 }} />
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {[1, 2, 3, 4].map((index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              width={80}
              height={32}
              sx={{ borderRadius: 4 }}
            />
          ))}
        </Box>
      </Box>

      {/* Storage variant skeleton */}
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="text" width={120} height={24} sx={{ mb: 1 }} />
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {[1, 2, 3].map((index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              width={60}
              height={24}
              sx={{ borderRadius: 1 }}
            />
          ))}
        </Box>
      </Box>

      {/* Summary skeleton */}
      <Box
        sx={{
          p: 2,
          bgcolor: "grey.50",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "grey.200",
        }}
      >
        <Skeleton variant="text" width={80} height={20} sx={{ mb: 1 }} />
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
          {[1, 2].map((index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              width={40}
              height={20}
              sx={{ borderRadius: 1 }}
            />
          ))}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Skeleton variant="text" width={120} height={28} />
          <Skeleton
            variant="rectangular"
            width={80}
            height={20}
            sx={{ borderRadius: 1 }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default VariantSelectorSkeleton;
