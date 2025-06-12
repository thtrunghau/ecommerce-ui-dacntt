import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Typography, Grid, Button, Divider, CircularProgress } from '@mui/material';
import { ShoppingCart, FlashOn } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import type { ProductResDto } from '../types';
import { getProductPriceInfo } from '../utils/helpers';
import { products as mockProducts } from '../mockData/mockData';

const ProductDetail: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams();
  const [product, setProduct] = useState<ProductResDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        const mockProducts = require('../mockData/mockData').products;
        const foundProduct = mockProducts.find((p: ProductResDto) => p.id === id);
        if (foundProduct) {
          setProduct(foundProduct);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6">Không tìm thấy sản phẩm</Typography>
      </Box>
    );
  }

  const priceInfo = getProductPriceInfo(product.id, product.price);
  const finalPrice = priceInfo.finalPrice;
  const hasPromotion = priceInfo.hasActivePromotion;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 2 }}>      {/* Breadcrumb */}
      <Container maxWidth="lg">
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mb: 3,
            '& span': { mx: 1 }
          }}
        >
          {product.productName} <span>/</span> Chi tiết sản phẩm
        </Typography>

        {/* Main Content */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Left: Product Image */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                width: '100%',
                aspectRatio: '1',
                bgcolor: 'background.paper',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >              <img
                src={product.image || "/images/products/placeholder.png"}
                alt={product.productName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/products/placeholder.png";
                }}
            </Box>
          </Grid>

          {/* Right: Product Info */}
          <Grid item xs={12} md={6}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>              <Typography variant="h4" component="h1" gutterBottom fontWeight="500">
                {product.productName}
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {product.description}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Số lượng còn: {product.stock}
                </Typography>
              </Box>

              {priceInfo.hasActivePromotion && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      bgcolor: 'error.main',
                      color: 'white',
                      display: 'inline-block',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                    }}
                  >
                    Giảm {((product.price - priceInfo.finalPrice) / product.price * 100).toFixed(0)}%
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                {priceInfo.hasActivePromotion && (
                  <Typography
                    variant="body1"
                    sx={{
                      textDecoration: 'line-through',
                      color: 'text.secondary',
                    }}
                  >
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(product.price)}
                  </Typography>
                )}
                <Typography variant="h5" color="primary" fontWeight="600">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(priceInfo.finalPrice)}
                </Typography>
              </Box>

              <Box
                sx={{
                  mt: 'auto',
                  pt: 2,
                  display: 'flex',
                  gap: 2,
                }}
              >
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<ShoppingCart />}
                  sx={{
                    flex: 1,
                    borderRadius: '9999px',
                    textTransform: 'none',
                    fontSize: '1rem',
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
                    borderRadius: '9999px',
                    textTransform: 'none',
                    fontSize: '1rem',
                  }}
                >
                  Mua ngay
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProductDetail;
