import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiMenu,
  FiX,
  FiArrowUpRight,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import NavDropdown from "./NavDropdown";
import UserMenu from "./UserMenu";
import type { CategoryResDto, ProductResDto } from "../../types";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";
import { IconButton, Badge, styled } from "@mui/material";
import useCartStore from "../../store/cartStore";
import { useQuery } from "@tanstack/react-query";
import {
  categoryApi,
  productApi,
  promotionApi,
} from "../../services/apiService";
import { getProductImageUrl } from "../../utils/imageUtils";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";
import { searchProductsWithVariants } from "../../test/utils-test/variantSearch";
import { extractBaseName } from "../../utils/productVariants";

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
  id: string;
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
  // Lấy số lượng sản phẩm trong giỏ bằng selector trực tiếp từ items để luôn re-render đúng
  const totalItems = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );

  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(
    null,
  );
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ProductResDto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [lastSearched, setLastSearched] = useState("");
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Hiển thị highlight từ khóa trong tên sản phẩm
  const highlightKeyword = (name: string, keyword: string) => {
    if (!keyword) return name;
    const regex = new RegExp(
      `(${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    return name.split(regex).map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-100 font-semibold text-yellow-800">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
  };

  // Fetch categories từ API
  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.getList({ page: 0, size: 20 }),
  });

  // Fetch promotions từ API
  const { data: promotionsData } = useQuery({
    queryKey: ["promotions"],
    queryFn: () => promotionApi.getList({ page: 0, size: 50 }),
  });

  // Sử dụng useMemo để tránh re-render không cần thiết
  const categories = useMemo(
    () => categoriesData?.data || [],
    [categoriesData],
  );
  const promotions = useMemo(
    () => promotionsData?.data || [],
    [promotionsData],
  );

  // Kiểm tra scroll trong nav để hiển thị các mũi tên
  useEffect(() => {
    const checkScroll = () => {
      if (navRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5); // 5px buffer
      }
    };

    // Kiểm tra khi component mount và khi categories thay đổi
    checkScroll();

    // Thêm event listener cho nav scroll
    const currentNav = navRef.current;
    if (currentNav) {
      currentNav.addEventListener("scroll", checkScroll);
    }

    // Clean up
    return () => {
      if (currentNav) {
        currentNav.removeEventListener("scroll", checkScroll);
      }
    };
  }, [categories]);

  // Các hàm scroll nav
  const scrollLeft = () => {
    if (navRef.current) {
      navRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (navRef.current) {
      navRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  // Handle scroll to ProductsSection và filter theo category
  const handleNavItemClick = (path: string, event: React.MouseEvent) => {
    event.preventDefault();
    // Không làm gì cả, chỉ highlight nav item
  };

  // Prepare dropdown data với API data
  const prepareDropdownData = (dropdownType: string) => {
    if (dropdownType === "promotion") {
      // Get products with active promotions
      const fetchPromotedProducts = async () => {
        try {
          console.log("Fetching promoted products");
          // Get all product IDs that have promotions
          const productIdsWithPromo = promotions
            .filter(
              (promo) =>
                promo.promotionType === "SPECIFIC_PRODUCTS" &&
                promo.productIds?.length,
            )
            .flatMap((promo) => promo.productIds || []);

          // Check if we have "ALL_PRODUCTS" promotion
          const hasAllProductsPromo = promotions.some(
            (promo) => promo.promotionType === "ALL_PRODUCTS",
          );

          // If we have "ALL_PRODUCTS" promotion, just fetch the first 8 products
          if (hasAllProductsPromo) {
            const productsResponse = await productApi.getList({
              page: 0,
              size: 8,
            });
            return productsResponse.data;
          }
          // If we have specific products with promotions
          else if (productIdsWithPromo.length > 0) {
            // Fetch those specific products (up to 8)
            const uniqueProductIds = [...new Set(productIdsWithPromo)].slice(
              0,
              8,
            );

            // Fetch each product by ID (in parallel)
            const productPromises = uniqueProductIds.map((id) =>
              productApi.getById(id),
            );
            const products = await Promise.all(productPromises);
            return products;
          }

          // No promotions or empty product lists
          return [];
        } catch (error) {
          console.error("Error fetching promoted products:", error);
          return [];
        }
      };
      return {
        id: "promo",
        categoryName: "Ưu Đãi",
        key: "uu-dai",
        products: [], // This will be filled asynchronously
        fetchProducts: fetchPromotedProducts,
      } as CategoryResDto & { fetchProducts: () => Promise<ProductResDto[]> };
    } else {
      // Đảm bảo truyền đúng categoryId cho API
      const originalCategory = categories.find(
        (cat) => cat.id === dropdownType,
      );
      console.log(
        `Finding category for ID ${dropdownType}:`,
        originalCategory?.categoryName,
      );

      if (originalCategory) {
        return {
          ...originalCategory,
          fetchProducts: async () => {
            try {
              console.log(
                `Fetching products for category ${originalCategory.categoryName} (ID: ${originalCategory.id})`,
              );
              const productsResponse = await productApi.getList({
                page: 0,
                size: 8,
                categoryId: originalCategory.id, // Filtering by categoryId in API
              });

              // Add back client-side filtering to ensure we only get products from this category
              // This is a safeguard in case the API doesn't filter correctly
              const filteredProducts = productsResponse.data.filter(
                (product) => product.categoryId === originalCategory.id,
              );

              console.log(
                `API returned ${productsResponse.data.length} products, filtered to ${filteredProducts.length} for category ${originalCategory.categoryName}`,
              );

              return filteredProducts;
            } catch (error) {
              console.error(
                `Error fetching products for category ${originalCategory.categoryName}:`,
                error,
              );
              return [];
            }
          },
        };
      }
    }
    return null;
  };

  // Navigation items với query parameter URLs - sử dụng data từ API
  const navItems: NavItem[] = [
    {
      id: "promo",
      name: "Ưu Đãi",
      path: "/products?promotion=true",
      color: "#7A7A7A",
      fontSize: "12px",
    },
    ...categories.map((category) => ({
      id: category.id,
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
    console.log(`Mouse enter on dropdown ID: ${dropdownId}`);
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

  // Loading state
  if (loadingCategories) {
    return (
      <header className="fixed z-50 w-full bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="ml-[47px] h-6">
              <TechzoneLogo />
            </div>
            <div className="h-8 w-1/2 animate-pulse rounded-lg bg-gray-200"></div>
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200"></div>
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Realtime search handler tối ưu với variant-aware search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.trim() === "") {
      setSearchResults([]);
      setShowSuggestions(false);
      setLastSearched("");
      return;
    }
    // Không gọi API nếu từ khóa không đổi
    if (value.trim() === lastSearched) return;
    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await productApi.getList({
          page: 0,
          size: 50, // Lấy nhiều hơn để có thể filter variants
          search: value.trim(),
        });

        // Sử dụng variant-aware search
        const searchResults = searchProductsWithVariants(
          res.data,
          value.trim(),
          {
            searchInVariants: true,
            groupVariants: false,
            includeDescriptions: true,
          },
        );

        // Lấy tối đa 10 kết quả
        const limitedResults = searchResults.slice(0, 10);

        setSearchResults(limitedResults);
        setShowSuggestions(true);
        setLastSearched(value.trim());
      } catch {
        setSearchResults([]);
        setShowSuggestions(false);
      } finally {
        setIsSearching(false);
      }
    }, 450); // debounce 450ms
  };

  // Click suggestion: direct to product detail
  const handleSuggestionClick = (productId: string) => {
    setShowSuggestions(false);
    setSearchTerm("");
    setSearchResults([]);
    setLastSearched("");
    navigate(`/products/${productId}`);
  };

  return (
    <header
      className={`fixed z-50 w-full bg-white ${isScrolled ? "shadow-md" : ""}`}
    >
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
      </div>
      {/* Main header */}
      <div className="container mx-auto px-4 py-2">
        <div className="relative flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="mt-1 flex-shrink-0">
            <div className="ml-[47px] h-6">
              <TechzoneLogo />
            </div>
          </Link>

          {/* Desktop Navigation - Với Overflow Scroll */}
          <nav className="relative mx-4 mt-[14px] hidden w-full max-w-3xl overflow-visible lg:block">
            {/* Left Arrow - Hiện khi có thể scroll left */}
            {showLeftArrow && (
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 z-10 flex h-10 w-8 -translate-y-1/2 items-center justify-start bg-gradient-to-r from-white to-transparent"
                aria-label="Scroll left"
              >
                <FiChevronLeft className="text-gray-700" size={20} />
              </button>
            )}

            {/* Nav Items với Overflow */}
            <div
              ref={navRef}
              className="scrollbar-hide flex items-center space-x-6 overflow-x-auto scroll-smooth px-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {navItems.map((item) => {
                // Check if this nav item has a dropdown based on query params
                const categoryId = new URLSearchParams(
                  item.path.split("?")[1],
                ).get("category");
                const isPromotion = item.path.includes("promotion=true");
                const hasDropdown = categoryId || isPromotion;

                // Explicitly pass the dropdown ID, ensuring it's either "promotion" or the actual category ID
                const dropdownId = isPromotion ? "promotion" : categoryId || "";

                return (
                  <div
                    key={item.id}
                    className="group relative flex-shrink-0 py-2"
                    onMouseEnter={() => {
                      if (hasDropdown) {
                        // Pass the exact dropdown ID - either "promotion" or the category ID
                        console.log(
                          `Setting hover for: ${dropdownId} (${item.name})`,
                        );
                        handleMouseEnter(dropdownId);
                      } else {
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
                    <Link
                      to={item.path}
                      onClick={(e) => handleNavItemClick(item.path, e)}
                      className={`relative whitespace-nowrap py-1 text-[15px] font-bold text-black after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-0 after:bg-black after:transition-all after:content-[''] hover:text-black hover:after:w-full`}
                    >
                      {item.name}
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Right Arrow - Hiện khi có thể scroll right */}
            {showRightArrow && (
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 z-10 flex h-10 w-8 -translate-y-1/2 items-center justify-end bg-gradient-to-l from-white to-transparent"
                aria-label="Scroll right"
              >
                <FiChevronRight className="text-gray-700" size={20} />
              </button>
            )}
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
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() =>
                    searchResults.length > 0 && setShowSuggestions(true)
                  }
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                />
                {/* Suggestions dropdown */}
                {showSuggestions && (
                  <div className="absolute left-0 top-full z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-lg bg-white shadow-lg">
                    {isSearching ? (
                      <div className="p-3 text-center text-xs text-gray-400">
                        Đang tìm kiếm...
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((product) => (
                        <div
                          key={product.id}
                          className="flex cursor-pointer items-center px-3 py-2 hover:bg-gray-100"
                          onMouseDown={() => handleSuggestionClick(product.id)}
                        >
                          <img
                            src={getProductImageUrl(product.image)}
                            alt={extractBaseName(product.productName)}
                            className="mr-3 h-8 w-8 rounded object-cover"
                          />
                          <span className="line-clamp-1 text-sm text-gray-800">
                            {highlightKeyword(
                              extractBaseName(product.productName),
                              searchTerm,
                            )}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-xs text-gray-400">
                        Không tìm thấy sản phẩm phù hợp
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Mobile Search Icon */}
            <button
              className="md:hidden"
              onClick={toggleSearch}
              aria-label="Search"
            >
              <FiSearch size={20} />
            </button>
            {/* Shopping Cart */}
            <IconButton
              onClick={() => {
                if (!isAuthenticated) {
                  toast.error("Đăng nhập để xem giỏ hàng");
                  return;
                }
                navigate("/cart");
              }}
              aria-label="cart"
              className="focus:outline-none"
            >
              <StyledBadge badgeContent={totalItems} color="error">
                <ShoppingCartIcon
                  style={{ fontSize: 18 }}
                  className="text-gray-700"
                />
              </StyledBadge>
            </IconButton>
            {/* User Account */}
            <div className="ml-2 hidden sm:block">
              <IconButton
                onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                aria-label="account"
              >
                <PermIdentityOutlinedIcon
                  style={{ fontSize: 24 }}
                  className="text-gray-700"
                />
              </IconButton>
              <UserMenu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={() => setUserMenuAnchor(null)}
              />
            </div>
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden"
              onClick={toggleMobileMenu}
              aria-label="Menu"
            >
              <FiMenu size={24} />
            </button>
          </div>
        </div>

        {/* Dropdown Menu - Always centered */}
        {activeDropdown && (
          <div
            className="dropdown-area absolute left-1/2 top-full z-50 -translate-x-1/2 transform"
            style={{ marginTop: "-16px" }}
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleDropdownLeave}
          >
            {/* Invisible large hover area */}
            <div className="absolute left-1/2 top-0 h-16 w-[1000px] -translate-x-1/2 bg-transparent" />
            {(() => {
              const dropdownCategory = prepareDropdownData(activeDropdown);
              if (!dropdownCategory) return null;
              return <NavDropdown category={dropdownCategory} />;
            })()}
          </div>
        )}
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
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() =>
                searchResults.length > 0 && setShowSuggestions(true)
              }
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500" />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 transform"
              onClick={toggleSearch}
            >
              <FiX className="text-gray-500" />
            </button>
            {/* Suggestions dropdown */}
            {showSuggestions && (
              <div className="absolute left-0 top-full z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-lg bg-white shadow-lg">
                {isSearching ? (
                  <div className="p-3 text-center text-xs text-gray-400">
                    Đang tìm kiếm...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((product) => (
                    <div
                      key={product.id}
                      className="flex cursor-pointer items-center px-3 py-2 hover:bg-gray-100"
                      onMouseDown={() => handleSuggestionClick(product.id)}
                    >
                      <img
                        src={getProductImageUrl(product.image)}
                        alt={extractBaseName(product.productName)}
                        className="mr-3 h-8 w-8 rounded object-cover"
                      />
                      <span className="line-clamp-1 text-sm text-gray-800">
                        {highlightKeyword(
                          extractBaseName(product.productName),
                          searchTerm,
                        )}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-gray-400">
                    Không tìm thấy sản phẩm phù hợp
                  </div>
                )}
              </div>
            )}
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
          </div>
          <div className="p-4">
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
                onClick={(e) => {
                  toggleMobileMenu();
                  handleNavItemClick(item.path, e);
                }}
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
