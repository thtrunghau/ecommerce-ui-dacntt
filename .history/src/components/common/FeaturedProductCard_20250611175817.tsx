import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  styled,
  Stack,
  Fade,
} from "@mui/material";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import type { ProductResDto } from "../../types";
import { getProductPromotionInfo } from "../../utils/productHelpers";

// Styled components
const StyledFeaturedCard = styled(Card)(() => ({
  height: "100%",
  position: "relative",
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  display: "flex",
  flexDirection: "row",
  borderRadius: 12,
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    "& .product-image": {
      transform: "scale(1.05)",
    },
    "& .product-actions": {
      opacity: 1,
    },
  },
}));

const PromotionChip = styled(Chip)(() => ({
  position: "absolute",
  top: 12,
  left: 12,
  zIndex: 1,
  backgroundColor: "#D32F2F",
  color: "white",
  fontWeight: "bold",
}));

const NewProductChip = styled(Chip)(() => ({
  position: "absolute",
  top: 12,
  left: 12,
  zIndex: 1,
  backgroundColor: "#4CAF50",
  color: "white",
  fontWeight: "bold",
}));

const ActionButton = styled(Button)(() => ({
  backgroundColor: "white",
  color: "#333",
  minWidth: "unset",
  padding: "8px 12px",
  fontWeight: "bold",
  fontSize: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  border: "1px solid #eee",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "#1976d2",
    color: "white",
    transform: "translateY(-2px)",
  },
}));

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

interface FeaturedProductCardProps {
  product: ProductResDto;
}

const FeaturedProductCard: React.FC<FeaturedProductCardProps> = ({
  product,
}) => {
  const [showActions, setShowActions] = useState(false);
  const promotionInfo = getProductPromotionInfo(product.id);

  const handleMouseEnter = () => {
    setShowActions(true);
  };

  const handleMouseLeave = () => {
    setShowActions(false);
  };

  return (
    <StyledFeaturedCard
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Promotion tags */}
      {promotionInfo && (
        <PromotionChip
          label={
            promotionInfo.isPercentage
              ? `Giảm ${promotionInfo.discountAmount}%`
              : `Giảm ${formatPrice(promotionInfo.discountAmount)}`
          }
          size="small"
        />
      )}

      {!promotionInfo && product.isNew && (
        <NewProductChip label="Mới" size="small" />
      )}

      {/* Product Image */}
      <Box
        className="product-image"
        sx={{
          backgroundImage: `url(${product.image})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          width: "50%",
          transition: "transform 0.5s ease",
          height: "100%",
        }}
      />

      {/* Product Content */}
      <CardContent
        sx={{
          flex: 1,
          width: "50%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          p: 3,
        }}
      >
        <div>
          <Typography
            gutterBottom
            variant="h5"
            component="h3"
            sx={{ fontWeight: "bold", mb: 2 }}
          >
            {product.productName}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {product.description}
          </Typography>
        </div>

        <Box>
          {/* Price display with or without promotion */}
          {promotionInfo ? (
            <>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: "line-through" }}
              >
                {formatPrice(product.price)}
              </Typography>
              <Typography
                variant="h5"
                color="error"
                sx={{ fontWeight: "bold", mb: 2 }}
              >
                {promotionInfo.isPercentage
                  ? formatPrice(
                      product.price * (1 - promotionInfo.discountAmount / 100),
                    )
                  : formatPrice(product.price - promotionInfo.discountAmount)}
              </Typography>
            </>
          ) : (
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
              {formatPrice(product.price)}
            </Typography>
          )}

          {/* Action Buttons */}
          <Fade in={showActions}>
            <Stack
              direction="row"
              spacing={2}
              mt={2}
              className="product-actions"
              sx={{ opacity: 0, transition: "opacity 0.3s ease" }}
            >
              <ActionButton
                size="medium"
                startIcon={<ShoppingBagOutlinedIcon />}
                fullWidth
              >
                Mua ngay
              </ActionButton>
              <Box
                component={Link}
                to={`/products/${product.id}`}
                sx={{ textDecoration: "none", flexGrow: 1 }}
              >
                <ActionButton
                  size="medium"
                  startIcon={<VisibilityOutlinedIcon />}
                  fullWidth
                >
                  Chi tiết
                </ActionButton>
              </Box>
            </Stack>
          </Fade>
        </Box>
      </CardContent>
    </StyledFeaturedCard>
  );
};

export default FeaturedProductCard;
