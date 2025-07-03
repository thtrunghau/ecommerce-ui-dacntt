import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import { ShoppingCart, FlashOn, PlayArrow } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { promotionApi } from "../services/apiService";
import { getProductPriceInfo } from "../utils/helpers";
import { parseProductDescription, analyzeVideoUrl } from "../utils/productDescriptionUtils";
import { useProductDetail } from "../hooks/useProductDetail";
import ErrorState from "../components/common/ErrorState";
import ProductDetailSkeleton from "../components/common/ProductDetailSkeleton";
import useCartStore from "../store/cartStore";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import ProductSuggestion from "./ProductSuggestion";
import { getProductImageUrl } from "../utils/imageUtils";

interface MediaItem {
  type: "image" | "video";
  src: string;
  alt: string;
  videoType?: "youtube" | "direct" | "unknown";
  embedUrl?: string;
}

const ProductDetail: React.FC = () => {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
  } = useProductDetail(idOrSlug);
  const cartStore = useCartStore();
  const { isAuthenticated } = useAuthStore();

  // Lấy promotions từ API thật
  const { data: promotionPage } = useQuery({
    queryKey: ["promotions"],
    queryFn: () => promotionApi.getList(),
  });
  const allPromotions = promotionPage?.data || [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }
  if (isError || !product) {
    return (
      <ErrorState
        message={error?.message || "Không tìm thấy sản phẩm"}
        className="min-h-screen"
        onRetry={refetch}
      />
    );
  }

  const priceInfo = getProductPriceInfo(
    product.id,
    product.price,
    allPromotions,
  );

  // Parse product description to get structured data
  const parsedDescription = parseProductDescription(product.description || "");

  // Create media array (images + video if available)
  const mediaItems: MediaItem[] = [
    {
      type: "image",
      src: getProductImageUrl(product.image),
      alt: product.productName,
    },
  ];

  if (parsedDescription.link_video) {
    const videoAnalysis = analyzeVideoUrl(parsedDescription.link_video);
    mediaItems.push({
      type: "video",
      src: parsedDescription.link_video,
      alt: `Video của ${product.productName}`,
      videoType: videoAnalysis.type,
      embedUrl: videoAnalysis.embedUrl,
    });
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pt: 2 }}>
      {/* Breadcrumb */}
      <Container maxWidth="lg">
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            mb: 3,
            "& span": { mx: 1 },
          }}
        >
          {product.productName} <span>/</span> Chi tiết sản phẩm
        </Typography>

        {/* Main Content */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
            mb: 4,
          }}
        >
          {/* Left: Product Media */}
          <Box
            sx={{
              flex: { xs: "1 1 100%", md: "1 1 50%" },
            }}
          >
            {/* Main Media Display */}
            <Box
              sx={{
                width: "100%",
                aspectRatio: "1",
                bgcolor: "background.paper",
                borderRadius: 2,
                overflow: "hidden",
                position: "relative",
                mb: 2,
              }}
            >
              {mediaItems[currentMediaIndex]?.type === "video" ? (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {mediaItems[currentMediaIndex]?.videoType === "youtube" ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={mediaItems[currentMediaIndex]?.embedUrl}
                      title={`Video của ${product.productName}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      style={{
                        border: "none",
                        borderRadius: "8px",
                      }}
                    />
                  ) : (
                    <video
                      controls
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                      poster={getProductImageUrl(product.image)}
                    >
                      <source
                        src={mediaItems[currentMediaIndex].src}
                        type="video/mp4"
                      />
                      Trình duyệt của bạn không hỗ trợ video.
                    </video>
                  )}
                </Box>
              ) : (
                <img
                  src={
                    mediaItems[currentMediaIndex]?.src ||
                    getProductImageUrl(product.image)
                  }
                  alt={
                    mediaItems[currentMediaIndex]?.alt || product.productName
                  }
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/products/placeholder.png";
                  }}
                />
              )}
            </Box>

            {/* Media Thumbnails */}
            {mediaItems.length > 1 && (
              <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                {mediaItems.map((item, index) => (
                  <Box
                    key={index}
                    onClick={() => setCurrentMediaIndex(index)}
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 1,
                      overflow: "hidden",
                      cursor: "pointer",
                      border:
                        currentMediaIndex === index ? "2px solid" : "1px solid",
                      borderColor:
                        currentMediaIndex === index
                          ? "primary.main"
                          : "divider",
                      position: "relative",
                    }}
                  >
                    {item.type === "video" ? (
                      <Box
                        sx={{
                          width: "100%",
                          height: "100%",
                          bgcolor: "grey.200",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <PlayArrow sx={{ color: "primary.main" }} />
                      </Box>
                    ) : (
                      <img
                        src={item.src}
                        alt={`Thumbnail ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Right: Product Info */}
          <Box
            sx={{
              flex: { xs: "1 1 100%", md: "1 1 50%" },
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              fontWeight="500"
            >
              {product.productName}
            </Typography>

            {/* Summary */}
            {parsedDescription.summary && (
              <Typography
                variant="h6"
                color="text.primary"
                sx={{ mb: 1, fontWeight: 400 }}
              >
                {parsedDescription.summary}
              </Typography>
            )}

            {/* Description */}
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {parsedDescription.description || product.description}
            </Typography>

            {/* Colors */}
            {parsedDescription.color && parsedDescription.color.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Màu sắc có sẵn:
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {parsedDescription.color.map((color, index) => (
                    <Chip
                      key={index}
                      label={color}
                      sx={{
                        bgcolor: color,
                        color: "#fff",
                        border: "1px solid",
                        borderColor: "divider",
                        fontWeight: 500,
                        "&::before": {
                          content: '""',
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          backgroundColor: color,
                          marginRight: 1,
                          border: "1px solid rgba(0,0,0,0.2)",
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {" "}
                Số lượng còn: {product.quantity}
              </Typography>
            </Box>

            {priceInfo.hasActivePromotion && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    bgcolor: "error.main",
                    color: "white",
                    display: "inline-block",
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                  }}
                >
                  Giảm{" "}
                  {(
                    ((product.price - priceInfo.finalPrice) / product.price) *
                    100
                  ).toFixed(0)}
                  %
                </Typography>
              </Box>
            )}

            <Box sx={{ mb: 2 }}>
              {priceInfo.hasActivePromotion && (
                <Typography
                  variant="body1"
                  sx={{
                    textDecoration: "line-through",
                    color: "text.secondary",
                  }}
                >
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(product.price)}
                </Typography>
              )}{" "}
              <Typography variant="h5" color="error" fontWeight="600">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(priceInfo.finalPrice)}
              </Typography>
            </Box>

            <Box
              sx={{
                mt: "auto",
                pt: 2,
                display: "flex",
                gap: 2,
              }}
            >
              <Button
                variant="outlined"
                size="large"
                startIcon={<ShoppingCart />}
                sx={{
                  flex: 1,
                  borderRadius: "9999px",
                  textTransform: "none",
                  fontSize: "1rem",
                  color: "text.primary",
                  borderColor: "text.primary",
                  bgcolor: "transparent",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    bgcolor: "text.primary",
                    color: "background.paper",
                    transform: "translateY(-2px)",
                    boxShadow: 2,
                  },
                }}
                onClick={async () => {
                  if (!isAuthenticated) {
                    toast.error("Đăng nhập để thao tác");
                    return;
                  }
                  await cartStore.addItem(product, 1);
                  toast.success("Đã thêm vào giỏ hàng!");
                }}
              >
                Thêm vào giỏ
              </Button>
              <Button
                variant="contained"
                size="large"
                startIcon={<FlashOn />}
                sx={{
                  flex: 1,
                  borderRadius: "9999px",
                  textTransform: "none",
                  fontSize: "1rem",
                  bgcolor: "text.primary",
                  color: "background.paper",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    bgcolor: "text.primary",
                    transform: "translateY(-2px)",
                    boxShadow: 2,
                  },
                }}
                onClick={async () => {
                  if (!isAuthenticated) {
                    toast.error("Đăng nhập để thao tác");
                    return;
                  }
                  // Logic mua ngay (ví dụ: thêm vào giỏ và chuyển trang)
                  await cartStore.addItem(product, 1);
                  navigate("/cart");
                }}
              >
                Mua ngay
              </Button>
            </Box>
          </Box>        </Box>

        {/* Product Specifications Section */}
        {parsedDescription.attribute && Object.keys(parsedDescription.attribute).length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}>
              Thông số kỹ thuật
            </Typography>
            <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2 }}>
              <Table>
                <TableBody>
                  {Object.entries(parsedDescription.attribute).map(([key, value], index) => (
                    <TableRow 
                      key={index} 
                      sx={{ 
                        '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                        '&:hover': { bgcolor: 'action.selected' }
                      }}
                    >
                      <TableCell 
                        component="th" 
                        scope="row" 
                        sx={{ 
                          fontWeight: 600, 
                          width: '35%', 
                          py: 2,
                          borderRight: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        {key}
                      </TableCell>
                      <TableCell sx={{ py: 2, fontWeight: 500 }}>{value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Gợi ý sản phẩm liên quan */}
        <ProductSuggestion productId={product.id} />
      </Container>
    </Box>
  );
};

export default ProductDetail;
