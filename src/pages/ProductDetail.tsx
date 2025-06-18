import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Container, Typography, Button } from "@mui/material";
import { ShoppingCart, FlashOn } from "@mui/icons-material";
import { getProductPriceInfo } from "../utils/helpers";
import { useProductDetail } from "../hooks/useProductDetail";
import ErrorState from "../components/common/ErrorState";
import ProductDetailSkeleton from "../components/common/ProductDetailSkeleton";
import useCartStore from "../store/cartStore";
import toast from "react-hot-toast";

const ProductDetail: React.FC = () => {
  const { idOrSlug } = useParams();
  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
  } = useProductDetail(idOrSlug);
  const cartStore = useCartStore();

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

  const priceInfo = getProductPriceInfo(product.id, product.price);

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
          {/* Left: Product Image */}
          <Box
            sx={{
              flex: { xs: "1 1 100%", md: "1 1 50%" },
            }}
          >
            <Box
              sx={{
                width: "100%",
                aspectRatio: "1",
                bgcolor: "background.paper",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <img
                src={product.image || "/images/products/placeholder.png"}
                alt={product.productName}
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
            </Box>
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

            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {product.description}
            </Typography>

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
              >
                Mua ngay
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ProductDetail;
