import { useState, useEffect } from "react";
import { 
  Box, 
  Container, 
  Typography, 
  Tabs, 
  Tab, 
  Grid, 
  useMediaQuery, 
  useTheme 
} from "@mui/material";
import ProductCard from "../../common/ProductCard";
import { mockCategories, mockProducts } from "../../../mockData/mockData";
import type { ProductResDto } from "../../../types";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`featured-tabpanel-${index}`}
      aria-labelledby={`featured-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

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

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
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
        </Typography>

        <Tabs 
          value={value} 
          onChange={handleChange} 
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          centered={!isMobile}
          sx={{
            mb: 3,
            '& .MuiTab-root': {
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '1rem',
              minWidth: 100
            }
          }}
        >
          <Tab label="Tất cả" id="featured-tab-0" />
          {mockCategories.map((category, index) => (
            <Tab 
              key={category.id} 
              label={category.categoryName} 
              id={`featured-tab-${index + 1}`}
            />
          ))}
        </Tabs>

        {/* Featured Products Layout */}
        {!isMobile ? (
          // Desktop Layout - 1 big featured + 4 grid
          <Grid container spacing={3}>
            {/* Featured product - left side */}
            <Grid item xs={12} md={5} lg={5}>
              {featuredProduct && (
                <Box sx={{ height: '100%', minHeight: 500 }}>
                  <ProductCard product={featuredProduct} variant="featured" />
                </Box>
              )}
            </Grid>
            
            {/* Grid products - right side */}
            <Grid item xs={12} md={7} lg={7}>
              <Grid container spacing={2}>
                {gridProducts.map((product) => (
                  <Grid item xs={6} key={product.id}>
                    <ProductCard product={product} variant="standard" />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        ) : (
          // Mobile Layout - All products in a single column
          <Box>
            {filteredProducts.slice(0, 5).map((product, index) => (
              <Box key={product.id} sx={{ mb: 2 }}>
                <ProductCard 
                  product={product} 
                  variant={index === 0 ? "featured" : "standard"} 
                />
              </Box>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default FeaturedProducts;
