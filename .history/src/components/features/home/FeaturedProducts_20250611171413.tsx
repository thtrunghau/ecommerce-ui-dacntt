import { useState, useEffect } from "react";
import { 
  Box, 
  Container, 
  Typography, 
  Tabs, 
  Tab, 
  useMediaQuery, 
  useTheme,
  Paper,
  Divider
} from "@mui/material";
import ProductCard from "../../common/ProductCard";
import { mockCategories, mockProducts } from "../../../mockData/mockData";
import type { ProductResDto } from "../../../types";

const FeaturedProducts = () => {
  const [value, setValue] = useState(0);
  const [filteredProducts, setFilteredProducts] = useState<ProductResDto[]>([]);
  const [featuredProduct, setFeaturedProduct] = useState<ProductResDto | null>(null);
  const [gridProducts, setGridProducts] = useState<ProductResDto[]>([]);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Function to get featured and grid products
  const getFeaturedAndGridProducts = (categoryId: string | null) => {
    let products: ProductResDto[];
    
    if (categoryId === null) {
      // "Tất cả" tab - get products across all categories
      products = mockProducts.slice(0, 5); // Just grab the first 5 products
    } else {
      // Category specific tab
      products = mockProducts.filter(product => product.categoryId === categoryId);
      
      // If not enough products, fill with others
      if (products.length < 5) {
        const additionalProducts = mockProducts
          .filter(product => product.categoryId !== categoryId)
          .slice(0, 5 - products.length);
        
        products = [...products, ...additionalProducts];
      }
    }
    
    // First product is the featured one, rest go to the grid
    setFeaturedProduct(products[0]);
    setGridProducts(products.slice(1, 5));
    setFilteredProducts(products);
  };

  useEffect(() => {
    // Initial load - "Tất cả" tab
    getFeaturedAndGridProducts(null);
  }, []);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    
    const categoryId = newValue === 0 ? null : mockCategories[newValue - 1].id;
    getFeaturedAndGridProducts(categoryId);
  };

  return (
    <Box sx={{ py: 6, bgcolor: "#f8f9fa" }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h4" 
          component="h2" 
          align="center" 
          fontWeight="bold"
          gutterBottom
          sx={{ mb: 4, position: 'relative' }}
        >
          Sản phẩm nổi bật
          <Box 
            sx={{ 
              position: 'absolute', 
              width: '80px', 
              height: '4px', 
              bgcolor: 'primary.main',
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)'
            }} 
          />
        </Typography>      <Paper 
        elevation={1} 
        sx={{ 
          borderRadius: 2, 
          overflow: 'hidden',
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0 6px 12px rgba(0,0,0,0.05)'
          } 
        }}
      >
          <Tabs 
            value={value} 
            onChange={handleChange} 
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            centered={!isMobile}
            sx={{
              mb: 0,
              borderBottom: '1px solid #eee',
              '& .MuiTab-root': {
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '1rem',
                minWidth: 100,
                py: 2,
                transition: 'all 0.3s ease'
              },
              '& .Mui-selected': {
                color: 'primary.main',
                fontWeight: 'bold',
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderTopLeftRadius: 3,
                borderTopRightRadius: 3,
                transition: 'all 0.4s ease'
              }
            }}
          >
            <Tab 
              label="Tất cả" 
              id="featured-tab-0" 
            />
            {mockCategories.map((category, index) => (
              <Tab 
                key={category.id} 
                label={category.categoryName} 
                id={`featured-tab-${index + 1}`}
              />
            ))}
          </Tabs>

          <Divider />          {/* Featured Products Layout */}
          {!isMobile ? (
            // Desktop Layout - 1 big featured (40%) + 4 grid (60%)
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'row',
              minHeight: 560, // Ensure consistent height
              position: 'relative'
            }}>
              {/* Featured product - left side - 40% width */}
              <Box 
                sx={{ 
                  width: '40%', 
                  p: 3, 
                  borderRight: '1px solid #eee',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {featuredProduct && (
                  <Box 
                    sx={{ 
                      height: '100%', 
                      width: '100%',
                      transition: 'transform 0.5s ease'
                    }}
                  >
                    <ProductCard product={featuredProduct} variant="featured" />
                  </Box>
                )}
              </Box>
              
              {/* Grid products - right side - 60% width */}
              <Box 
                sx={{ 
                  width: '60%', 
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    mx: -1.5,
                    height: '100%'
                  }}
                >
                  {gridProducts.map((product) => (
                    <Box 
                      key={product.id} 
                      sx={{ 
                        width: '50%', 
                        p: 1.5, 
                        '&:nth-of-type(1), &:nth-of-type(2)': { 
                          mb: 3 
                        },
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)'
                        }
                      }}
                    >
                      <ProductCard product={product} variant="standard" />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          ) : (
            // Mobile Layout - Featured product first, then grid products
            <Box sx={{ p: 2 }}>
              {/* Featured product on top for mobile */}
              {featuredProduct && (
                <Box 
                  sx={{ 
                    mb: 3,
                    transition: 'transform 0.3s ease',
                  }}
                >
                  <ProductCard product={featuredProduct} variant="featured" />
                </Box>
              )}

              {/* Grid products in 2 columns below */}
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                mx: -1
              }}>
                {gridProducts.map((product) => (
                  <Box 
                    key={product.id} 
                    sx={{ 
                      width: '50%', 
                      p: 1, 
                      mb: 2,
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)'
                      }
                    }}
                  >
                    <ProductCard product={product} variant="standard" />
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default FeaturedProducts;
