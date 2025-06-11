import { Box, Card, CardContent, Typography, Chip, Button, Stack, Fade } from "@mui/material";
import { useState } from "react";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Link } from "react-router-dom";
import { getProductPromotionInfo } from "../../../utils/productHelpers";
import type { ProductResDto } from "../../../types";

interface FeaturedProductCardProps {
  product: ProductResDto;
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const FeaturedProductCard: React.FC<FeaturedProductCardProps> = ({ product }) => {
  const [showActions, setShowActions] = useState(false);
  const promotionInfo = getProductPromotionInfo(product.id);

  const handleMouseEnter = () => setShowActions(true);
  const handleMouseLeave = () => setShowActions(false);

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'stretch',
        borderRadius: 3,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        minHeight: { xs: 320, md: 420 },
        position: 'relative',
        overflow: 'hidden',
        p: { xs: 2, md: 3 },
        bgcolor: '#fafbfc',
        transition: 'box-shadow 0.3s',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)'
        }
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Tag Sale hoặc Mới */}
      {promotionInfo && (
        <Chip label="Sale" color="error" size="small" sx={{ position: 'absolute', top: 16, left: 16, fontWeight: 'bold', zIndex: 2 }} />
      )}
      {!promotionInfo && product.isNew && (
        <Chip label="Mới" color="primary" size="small" sx={{ position: 'absolute', top: 16, left: 16, fontWeight: 'bold', zIndex: 2 }} />
      )}
      {/* Ảnh sản phẩm */}
      <Box
        sx={{
          width: { xs: '100%', md: '60%' },
          minHeight: { xs: 180, md: 320 },
          background: '#f4f6f8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2,
          overflow: 'hidden',
          mr: { md: 3 },
          mb: { xs: 2, md: 0 },
        }}
      >
        <Box
          component="img"
          src={product.image}
          alt={product.productName}
          sx={{
            width: { xs: '70%', md: '80%' },
            height: 'auto',
            objectFit: 'contain',
            transition: 'transform 0.4s',
            '&:hover': { transform: 'scale(1.04)' }
          }}
        />
      </Box>
      {/* Nội dung */}
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 0 }}>
        <Box>
          <Typography variant="h6" fontWeight="bold" mb={1}>
            {product.productName}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {product.description}
          </Typography>
          {/* Giá và promotion */}
          {promotionInfo ? (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                {formatPrice(product.price)}
              </Typography>
              <Typography variant="h6" color="error" fontWeight="bold">
                {promotionInfo.isPercentage
                  ? formatPrice(product.price * (1 - promotionInfo.discountAmount / 100))
                  : formatPrice(product.price - promotionInfo.discountAmount)}
              </Typography>
              <Typography variant="caption" color="primary" fontWeight="bold">
                {promotionInfo.promotionName}
              </Typography>
            </>
          ) : (
            <Typography variant="h6" fontWeight="bold">
              {formatPrice(product.price)}
            </Typography>
          )}
        </Box>
        {/* Nút hành động */}
        <Fade in={showActions || true}>
          <Stack direction="row" spacing={2} mt={3}>
            <Button
              variant="contained"
              color="primary"
              size="medium"
              startIcon={<ShoppingBagOutlinedIcon />}
              sx={{ borderRadius: 2, fontWeight: 'bold', boxShadow: 'none' }}
            >
              Mua ngay
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="medium"
              startIcon={<VisibilityOutlinedIcon />}
              component={Link}
              to={`/products/${product.id}`}
              sx={{ borderRadius: 2, fontWeight: 'bold' }}
            >
              Xem ngay
            </Button>
          </Stack>
        </Fade>
      </CardContent>
    </Card>
  );
};

export default FeaturedProductCard;
