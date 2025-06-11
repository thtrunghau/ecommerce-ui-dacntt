import { Box, Card, CardContent, Typography, Chip, Button, Stack, Fade } from "@mui/material";
import { useState } from "react";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Link } from "react-router-dom";
import { getProductPromotionInfo } from "../../utils/productHelpers";
import type { ProductResDto } from "../../types";

interface ProductCardProps {
  product: ProductResDto;
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [showActions, setShowActions] = useState(false);
  const promotionInfo = getProductPromotionInfo(product.id);

  const handleMouseEnter = () => setShowActions(true);
  const handleMouseLeave = () => setShowActions(false);

  return (
    <Card
      sx={{
        position: 'relative',
        borderRadius: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        minHeight: 260,
        p: 2,
        bgcolor: '#fff',
        transition: 'box-shadow 0.3s',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)'
        },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Tag Sale */}
      {promotionInfo && (
        <Chip label="Sale" color="error" size="small" sx={{ position: 'absolute', top: 12, left: 12, fontWeight: 'bold', zIndex: 2 }} />
      )}
      {/* Ảnh sản phẩm */}
      <Box
        sx={{
          width: '100%',
          minHeight: 120,
          background: '#f4f6f8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2,
          overflow: 'hidden',
          mb: 2,
        }}
      >
        <Box
          component="img"
          src={product.image}
          alt={product.productName}
          sx={{
            width: '70%',
            height: 'auto',
            objectFit: 'contain',
            transition: 'transform 0.4s',
            '&:hover': { transform: 'scale(1.04)' }
          }}
        />
      </Box>
      {/* Nội dung */}
      <CardContent sx={{ width: '100%', p: 0, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight="bold" mb={1} align="center">
          {product.productName}
        </Typography>
        {/* Giá và promotion */}
        {promotionInfo ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }} align="center">
              {formatPrice(product.price)}
            </Typography>
            <Typography variant="subtitle1" color="error" fontWeight="bold" align="center">
              {promotionInfo.isPercentage
                ? formatPrice(product.price * (1 - promotionInfo.discountAmount / 100))
                : formatPrice(product.price - promotionInfo.discountAmount)}
            </Typography>
          </>
        ) : (
          <Typography variant="subtitle1" fontWeight="bold" align="center">
            {formatPrice(product.price)}
          </Typography>
        )}
        {/* Nút hành động */}
        <Fade in={showActions || true}>
          <Stack direction="row" spacing={1} mt={2} justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<ShoppingBagOutlinedIcon />}
              sx={{ borderRadius: 2, fontWeight: 'bold', boxShadow: 'none' }}
            >
              Mua ngay
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="small"
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

export default ProductCard;
