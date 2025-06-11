import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiSearch,
  FiMenu,
  FiX,
  FiArrowUpRight,
  FiArrowRight,
} from "react-icons/fi";
import NavDropdown from "./NavDropdown";
import { mockCategories, mockProducts } from "../../mockData/mockData";
import type { CategoryResDto } from "../../types";
import { getAllApplicablePromotions } from "../../utils/helpers";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";
import { IconButton, Badge, styled } from "@mui/material";

// Logo component sử dụng hình ảnh TECH ZONE
const TechzoneLogo = () => (
  <img
    src="/images/logo-ecommerce/logo-tech-zone.svg"
    alt="TECH ZONE Logo"
    className="h-8 w-auto max-w-[160px] object-contain"
    style={{ display: "block" }}
    draggable={false}
  />
);

interface NavItem {
  id: number;
  name: string;
  path: string;
  color: string;
  fontSize: string;
}

const StyledBadge = styled(Badge)({
  "& .MuiBadge-badge": {
    right: -3,
    top: 3,
    border: "2px solid #fff",
    padding: "0 4px",
  },
});

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  // DATA FLOW ANALYSIS - Log data sources for backend integration planning
  useEffect(() => {
    console.group("🔍 HEADER DATA FLOW ANALYSIS");
    console.log("📊 Mock Categories Data:", {
      source: "mockCategories",
      count: mockCategories.length,
      structure: mockCategories[0],
      categories: mockCategories.map(cat => ({ id: cat.id, name: cat.categoryName, productCount: cat.products.length })),
      integration_notes: "Replace with API call to /api/categories"
    });
    
    console.log("🛍️ Mock Products Data:", {
      source: "mockProducts", 
      count: mockProducts.length,
      with_promotions: mockProducts.filter(p => getAllApplicablePromotions(p.id).length > 0).length,
      sample_product: mockProducts[0],
      integration_notes: "Replace with API call to /api/products or /api/products/promoted"
    });

    console.log("🎯 Navigation Items Generated:", {
      total_nav_items: mockCategories.length + 1, // +1 for "Ưu Đãi"
      promotion_link: "/products?promotion=true",
      category_links: mockCategories.map(cat => `/products?category=${cat.id}`),
      integration_notes: "URLs ready for ProductsSection integration"
    });
    console.groupEnd();
  }, []);

  // Prepare dropdown data with logging
  const prepareDropdownData = (dropdownType: string) => {
    console.group("📦 DROPDOWN DATA PREPARATION");
    
    if (dropdownType === "promotion") {
      const promoProducts = mockProducts
        .filter((product) => {
          const applicablePromotions = getAllApplicablePromotions(product.id);
          return applicablePromotions.length > 0;
        })
        .slice(0, 8);
        
      console.log("Promotion Dropdown Data:", {
        type: "promotion",
        total_promoted_products: mockProducts.filter(p => getAllApplicablePromotions(p.id).length > 0).length,
        displayed_count: promoProducts.length,
        products: promoProducts.map(p => ({ id: p.id, name: p.productName })),
        integration_notes: "Replace with API call to /api/products/promoted?limit=8"
      });
      
      console.groupEnd();
      return {
        id: "promo",
        categoryName: "Ưu Đãi",
        key: "uu-dai",
        products: promoProducts,
      } as CategoryResDto;
    } else {
      const originalCategory = mockCategories.find(cat => cat.id === dropdownType);
      if (originalCategory) {
        const limitedProducts = originalCategory.products.slice(0, 8);
        
        console.log("Category Dropdown Data:", {
          type: "category",
          category_id: originalCategory.id,
          category_name: originalCategory.categoryName,
          total_category_products: originalCategory.products.length,
          displayed_count: limitedProducts.length,
          products: limitedProducts.map(p => ({ id: p.id, name: p.productName })),
          integration_notes: `Replace with API call to /api/categories/${originalCategory.id}/products?limit=8`
        });
        
        console.groupEnd();
        return {
          ...originalCategory,
          products: limitedProducts,
        };
      }
    }
    
    console.groupEnd();
    return null;
  };

  // Navigation items with query parameter URLs
  const navItems: NavItem[] = [
    {
      id: 1,
      name: "Ưu Đãi",
      path: "/products?promotion=true",
      color: "#7A7A7A",
      fontSize: "12px",
    },
    ...mockCategories.map((category, index) => ({
      id: index + 2,
      name: category.categoryName,
      path: `/products?category=${category.id}`,
      color: "#7B7B7B",
      fontSize: "12.2px",
    })),
  ];
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Disable scrolling when menu is open
    document.body.style.overflow = !isMobileMenuOpen ? "hidden" : "";
  };
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };
  const handleMouseEnter = (dropdownId: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setActiveDropdown(dropdownId);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 800); // Tăng timeout lên 800ms để có đủ thời gian di chuyển chuột
    setHoverTimeout(timeout);
  };

  const handleDropdownEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const handleDropdownLeave = () => {
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 100); // Thêm delay nhỏ để tránh mất dropdown khi di chuyển chuột nhanh
    setHoverTimeout(timeout);
  };

  return (
    <header
      className={`fixed z-50 w-full bg-white ${isScrolled ? "shadow-md" : ""}`}
    >
      {" "}
      {/* Top bar - desktop only */}
      <div className="hidden border-b border-gray-100 py-1 lg:block">
        <div className="container mx-auto flex items-center justify-end space-x-4 px-4">
          {/* Hỗ Trợ */}
          <Link
            to="/ho-tro"
            className="text-[13px] font-bold text-black transition-colors hover:text-[#888]"
          >
            Hỗ Trợ
          </Link>
          <span className="mx-1 text-gray-300">|</span>
          {/* For Business */}
          <Link
            to="/for-business"
            className="flex items-center text-[13px] font-bold text-black transition-colors hover:text-[#888]"
          >
            For Business
            <FiArrowUpRight className="ml-1 stroke-[2]" size={9} />
          </Link>
        </div>
      </div>{" "}
      {/* Main header */}
      <div className="container mx-auto px-4 py-2">
        <div className="relative flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="mt-1 flex-shrink-0">
            <div className="ml-[47px] h-6">
              <TechzoneLogo />
            </div>
          </Link>{" "}
          {/* Desktop Navigation */}
          <nav className="mx-4 mt-[14px] hidden lg:flex">
            {navItems.map((item) => {
              // Check if this nav item has a dropdown based on query params
              const categoryId = new URLSearchParams(
                item.path.split("?")[1],
              ).get("category");
              const isPromotion = item.path.includes("promotion=true");
              const hasDropdown = categoryId || isPromotion;
              return (
                <div
                  key={item.id}
                  className="group relative px-2 py-2"
                  onMouseEnter={() => {
                    if (hasDropdown) {
                      handleMouseEnter(isPromotion ? "promotion" : categoryId!);
                    } else {
                      // Clear dropdown nếu hover vào item không có dropdown
                      if (hoverTimeout) {
                        clearTimeout(hoverTimeout);
                        setHoverTimeout(null);
                      }
                      setActiveDropdown(null);
                    }
                  }}
                  onMouseLeave={() => {
                    if (!hasDropdown) {
                      handleMouseLeave();
                    }
                  }}
                >
                  {" "}
                  <Link
                    to={item.path}
                    className={`relative mx-[10px] whitespace-nowrap py-1 text-[15px] font-bold text-black after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-0 after:bg-black after:transition-all after:content-[''] hover:text-black hover:after:w-full`}
                  >
                    {item.name}
                  </Link>
                </div>
              );
            })}
          </nav>
          {/* Search and Icons */}
          <div className="mt-[2px] flex items-center space-x-4">
            {/* Desktop Search */}
            <div className="relative hidden md:block">
              <div className="flex h-[34px] w-[149px] items-center rounded-[15px] bg-[#F6F6F6] pl-3 pr-2 transition-all duration-300 focus-within:w-[298px]">
                <FiSearch className="mr-2 text-[#B3B1B0]" size={13} />
                <input
                  type="text"
                  placeholder="Tìm kiếm"
                  className="w-[110px] border-none bg-transparent text-[12.4px] font-normal text-[#B3B1B0] transition-all duration-300 focus:w-[240px] focus:outline-none"
                />
              </div>
            </div>
            {/* Mobile Search Icon */}
            <button
              className="md:hidden"
              onClick={toggleSearch}
              aria-label="Search"
            >
              <FiSearch size={20} />
            </button>{" "}
            {/* Shopping Cart */}
            <Link to="/cart">
              <IconButton aria-label="cart">
                <StyledBadge badgeContent={2} color="error">
                  <ShoppingCartIcon
                    style={{ fontSize: 18 }}
                    className="text-gray-700"
                  />
                </StyledBadge>
              </IconButton>
            </Link>
            {/* User Account */}
            <Link to="/account" className="ml-2 hidden sm:block">
              <PermIdentityOutlinedIcon
                style={{ fontSize: 24 }}
                className="text-gray-700"
              />
            </Link>
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden"
              onClick={toggleMobileMenu}
              aria-label="Menu"
            >
              <FiMenu size={24} />
            </button>
          </div>
        </div>{" "}
        {/* Dropdown Menu - Always centered */}
        {activeDropdown &&
          (() => {
            let dropdownCategory;
            if (activeDropdown === "promotion") {
              // Lấy TẤT CẢ sản phẩm đang có promotion (bao gồm ALL_PRODUCTS và SPECIFIC_PRODUCTS)
              const promoProducts = mockProducts
                .filter((product) => {
                  const applicablePromotions = getAllApplicablePromotions(
                    product.id,
                  );
                  return applicablePromotions.length > 0;
                })
                .slice(0, 8); // Giới hạn tối đa 8 sản phẩm

              dropdownCategory = {
                id: "promo",
                categoryName: "Ưu Đãi",
                key: "uu-dai",
                products: promoProducts,
              } as CategoryResDto;
            } else {
              const originalCategory = mockCategories.find(
                (cat) => cat.id === activeDropdown,
              );
              if (originalCategory) {
                // Giới hạn tối đa 8 sản phẩm cho tất cả category
                dropdownCategory = {
                  ...originalCategory,
                  products: originalCategory.products.slice(0, 8),
                };
              }
            }

            if (!dropdownCategory) return null;

            return (
              <div
                className="dropdown-area absolute left-1/2 top-full z-50 -translate-x-1/2 transform"
                style={{ marginTop: "-16px" }} // Tăng lên để dropdown gần hơn
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
              >
                {/* Invisible large hover area */}
                <div className="absolute left-1/2 top-0 h-16 w-[1000px] -translate-x-1/2 bg-transparent" />
                <NavDropdown category={dropdownCategory} />
              </div>
            );
          })()}
      </div>
      {/* Mobile Search */}
      {isSearchOpen && (
        <div className="animate-fadeIn mt-3 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm"
              className="w-full rounded-full border bg-gray-50 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-800"
              autoFocus
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500" />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 transform"
              onClick={toggleSearch}
            >
              <FiX className="text-gray-500" />
            </button>
          </div>
        </div>
      )}
      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-50 bg-white transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full overflow-y-auto">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button onClick={toggleMobileMenu} aria-label="Close menu">
              <FiX size={24} />
            </button>
          </div>{" "}
          <div className="p-4">
            {" "}
            <Link
              to="/ho-tro"
              className="flex items-center justify-between border-b py-3"
              onClick={toggleMobileMenu}
            >
              Hỗ Trợ <FiArrowUpRight size={16} />
            </Link>
            <Link
              to="/for-business"
              className="flex items-center justify-between border-b py-3"
              onClick={toggleMobileMenu}
            >
              For Business <FiArrowRight size={16} />
            </Link>
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className="flex items-center justify-between border-b py-3"
                onClick={toggleMobileMenu}
              >
                {item.name} <FiArrowRight size={16} />
              </Link>
            ))}
            <Link
              to="/account"
              className="flex items-center justify-between border-b py-3"
              onClick={toggleMobileMenu}
            >
              Tài khoản <FiArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
      {/* Overlay when mobile menu is open */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}
    </header>
  );
};

export default Header;
