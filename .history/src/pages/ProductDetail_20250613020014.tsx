import React from 'react';
import { Box, Container, Typography, Grid, Button, Divider } from '@mui/material';
import { ShoppingCart, FlashOn } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const ProductDetail: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 2 }}>
      {/* Breadcrumb */}
      <Container maxWidth="lg">
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mb: 3,
            '& span': { mx: 1 }
          }}
        >
          Tên sản phẩm <span>/</span> Chi tiết sản phẩm
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
            >
              <img
                src="/images/products/placeholder.png"
                alt="Product"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </Box>
          </Grid>

          {/* Right: Product Info */}
          <Grid item xs={12} md={6}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h4" component="h1" gutterBottom fontWeight="500">
                Tên sản phẩm
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Mô tả sản phẩm chi tiết ở đây...
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Số lượng còn: 10
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'error.main',
                    bgcolor: 'error.main',
                    color: 'white',
                    display: 'inline-block',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                  }}
                >
                  Giảm 20%
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body1"
                  sx={{
                    textDecoration: 'line-through',
                    color: 'text.secondary',
                  }}
                >
                  1,000,000₫
                </Typography>
                <Typography variant="h5" color="primary" fontWeight="600">
                  800,000₫
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
