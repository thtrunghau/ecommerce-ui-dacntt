import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Button, 
  Box, 
  Chip, 
  styled,
  Stack,
  Fade 
} from "@mui/material";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import type { ProductResDto } from "../../types";
import { getProductPromotionInfo, formatCurrency } from "../../utils/productHelpers";

interface StyledCardProps {
  variant: "featured" | "standard";
}

// Styled components
const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "variant",
})<StyledCardProps>(({ variant }) => ({
  height: variant === "featured" ? "100%" : 360,
  position: "relative",
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  display: "flex",
  flexDirection: variant === "featured" ? "row" : "column",
  borderRadius: 12,
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    "& .MuiCardMedia-root": {
      transform: "scale(1.05)",
    },
    "& .product-actions": {
      opacity: 1,
    }
  }
}));

const StyledCardMedia = styled(CardMedia)({
  transition: "transform 0.5s ease",
  height: 200,
  backgroundSize: "contain",
});

const PromotionChip = styled(Chip)({
  position: "absolute",
  top: 12,
  left: 12,
  zIndex: 1,
  backgroundColor: "#D32F2F",
  color: "white",
  fontWeight: "bold",
});

const NewProductChip = styled(Chip)({
  position: "absolute",
  top: 12,
  left: 12,
  zIndex: 1,
  backgroundColor: "#4CAF50",
  color: "white",
  fontWeight: "bold",
});

const FeaturedCardMedia = styled(CardMedia)({
  transition: "transform 0.5s ease",
  height: "100%",
  width: "75%", // 3/4 of the space
  backgroundSize: "cover",
  backgroundPosition: "center"
});

const ActionButton = styled(Button)({
  backgroundColor: "white",
  color: "#333",
  minWidth: "unset",
  padding: "8px 12px",
  fontWeight: "bold",
  fontSize: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  border: "1px solid #eee",
  "&:hover": {
    backgroundColor: "#1976d2",
    color: "white",
  },
});

interface ProductCardProps {
  product: ProductResDto;
  variant?: "featured" | "standard";
}

const ProductCard: React.FC<ProductCardProps> = ({ product, variant = "standard" }) => {
  const [showActions, setShowActions] = useState(false);
  const promotionInfo = getProductPromotionInfo(product.id);

  const handleMouseEnter = () => {
    setShowActions(true);
  };

  const handleMouseLeave = () => {
    setShowActions(false);
  };

  if (variant === "featured") {
    return (
      <StyledCard 
        variant="featured" 
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave}
      >
        {promotionInfo && (
          <PromotionChip 
            label={promotionInfo.isPercentage 
              ? `Giảm ${promotionInfo.discountAmount}%` 
              : `Giảm ${formatCurrency(promotionInfo.discountAmount)}`} 
            size="small"
          />
        )}
        
        {!promotionInfo && product.isNew && (
          <NewProductChip label="Mới" size="small" />
        )}

        <FeaturedCardMedia
          image={product.image}
          title={product.productName}
        />

        <CardContent sx={{ 
          flex: 1, 
          width: "25%", 
          display: "flex", 
          flexDirection: "column",
          justifyContent: "space-between"
        }}>
          <div>
            <Typography gutterBottom variant="h6" component="h3" sx={{ fontWeight: "bold", mb: 2 }}>
              {product.productName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {product.description}
            </Typography>
          </div>

          <Box>
            {promotionInfo ? (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ textDecoration: "line-through" }}>
                  {formatCurrency(product.price)}
                </Typography>
                <Typography variant="h6" color="error" sx={{ fontWeight: "bold" }}>
                  {promotionInfo.isPercentage 
                    ? formatCurrency(product.price * (1 - promotionInfo.discountAmount / 100)) 
                    : formatCurrency(product.price - promotionInfo.discountAmount)}
                </Typography>
              </>
            ) : (
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {formatCurrency(product.price)}
              </Typography>
            )}
            
            <Fade in={showActions}>
              <Stack 
                direction="row" 
                spacing={1} 
                mt={2}
                className="product-actions" 
                sx={{ opacity: 0, transition: "opacity 0.3s ease" }}
              >
                <ActionButton size="small" startIcon={<ShoppingBagOutlinedIcon fontSize="small" />}>
                  Mua ngay
                </ActionButton>
                <ActionButton
                  size="small"
                  component={Link as any}
                  to={`/products/${product.id}`}
                  startIcon={<VisibilityOutlinedIcon fontSize="small" />}
                >
                  Chi tiết
                </ActionButton>
              </Stack>
            </Fade>
          </Box>
        </CardContent>
      </StyledCard>
    );
  }

  // Standard card
  return (
    <StyledCard 
      variant="standard"
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}
    >
      {promotionInfo && (
        <PromotionChip 
          label={promotionInfo.isPercentage 
            ? `Giảm ${promotionInfo.discountAmount}%` 
            : `Giảm ${formatCurrency(promotionInfo.discountAmount)}`} 
          size="small"
        />
      )}
      
      {!promotionInfo && product.isNew && (
        <NewProductChip label="Mới" size="small" />
      )}
      
      <StyledCardMedia
        sx={{ height: 200 }}
        image={product.image}
        title={product.productName}
      />
      
      <CardContent>
        <Typography gutterBottom variant="h6" component="h3" sx={{ fontWeight: "bold" }}>
          {product.productName}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: "hidden" }}>
          {product.description}
        </Typography>
        
        {promotionInfo ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ textDecoration: "line-through" }}>
              {formatCurrency(product.price)}
            </Typography>
            <Typography variant="h6" color="error" sx={{ fontWeight: "bold" }}>
              {promotionInfo.isPercentage 
                ? formatCurrency(product.price * (1 - promotionInfo.discountAmount / 100)) 
                : formatCurrency(product.price - promotionInfo.discountAmount)}
            </Typography>
          </>
        ) : (
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {formatCurrency(product.price)}
          </Typography>
        )}
        
        <Fade in={showActions}>
          <Stack 
            direction="row" 
            spacing={1} 
            mt={2}
            className="product-actions" 
            sx={{ opacity: 0, transition: "opacity 0.3s ease" }}
          >
            <ActionButton size="small" startIcon={<ShoppingBagOutlinedIcon fontSize="small" />}>
              Mua ngay
            </ActionButton>
            <ActionButton
              size="small"
              component={Link as any}
              to={`/products/${product.id}`}
              startIcon={<VisibilityOutlinedIcon fontSize="small" />}
            >
              Chi tiết
            </ActionButton>
          </Stack>
        </Fade>
      </CardContent>
    </StyledCard>
  );
};

export default ProductCard;
