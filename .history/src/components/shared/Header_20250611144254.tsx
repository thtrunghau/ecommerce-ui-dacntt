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
import { mockCategories, mockProducts, mockPromotions } from "../../mockData/mockData";
import type { CategoryResDto, ProductResDto } from "../../types";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";

// Logo component sử dụng hình ảnh TECH ZONE
const SamsungLogo = () => (
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

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null); // Navigation items - exact font sizes and colors from Figma
  const navItems: NavItem[] = [
    {
      id: 1,
      name: "Ưu Đãi",
      path: "/uu-dai",
      color: "#7A7A7A",
      fontSize: "12px",
    },
    {
      id: 2,
      name: "Di động",
      path: "/di-dong",
      color: "#7B7B7B",
      fontSize: "12.2px",
    },
    {
      id: 3,
      name: "TV & AV",
      path: "/tv-av",
      color: "#838382",
      fontSize: "12.5px",
    },
    {
      id: 4,
      name: "Gia Dụng",
      path: "/gia-dung",
      color: "#80807F",
      fontSize: "12px",
    },
    { id: 5, name: "IT", path: "/it", color: "#8E8B89", fontSize: "13.2px" },
    {
      id: 6,
      name: "Phụ kiện",
      path: "/phu-kien",
      color: "#838383",
      fontSize: "12.3px",
    },
    {
      id: 7,
      name: "SmartThings",
      path: "/smartthings",
      color: "#888988",
      fontSize: "12.2px",
    },
    { id: 8, name: "AI", path: "/ai", color: "#908F8E", fontSize: "13.5px" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Disable scrolling when menu is open
    document.body.style.overflow = !isMobileMenuOpen ? "hidden" : "";
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
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
              <SamsungLogo />
            </div>
          </Link>
          {/* Desktop Navigation */}
          <nav
            className="mx-4 mt-[14px] hidden lg:flex"
            onMouseLeave={() => setActiveDropdown(null)}
          >
            {navItems.map((item) => {              let dropdownData;
              if (item.name === "Ưu Đãi") {
                // Tạo category ảo cho Ưu đãi
                const promoProducts = mockPromotions.flatMap(promo => 
                  promo.productIds.map(promoId => 
                    mockProducts.find(p => p.id === promoId)
                  )
                ).filter((p): p is ProductResDto => p !== undefined);
                dropdownData = {
                  id: "promo",
                  categoryName: "Ưu Đãi",
                  key: "uu-dai",
                  products: promoProducts
                } as CategoryResDto;
              } else {
                dropdownData = mockCategories.find(
                  (cat) => cat.key === item.path.replace("/", "")
                );
              }
              const hasDropdown = dropdownData?.products && dropdownData.products.length > 0;
              return (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() =>
                    hasDropdown && setActiveDropdown(item.path.replace("/", ""))
                  }
                >
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
                  placeholder="Tim kiem"
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
            </button>
            {/* Shopping Cart */}
            <Link to="/cart" className="relative">
              <ShoppingCartIcon style={{ fontSize: 18 }} className="text-gray-700" />
            </Link>

            {/* User Account */}
            <Link to="/account" className="ml-2 hidden sm:block">
              <PermIdentityOutlinedIcon style={{ fontSize: 24 }} className="text-gray-700" />
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
        </div>        {/* Dropdown render ở đây, dùng absolute để nổi dưới header, không làm dịch chuyển navlink */}
        {activeDropdown && (() => {
          let dropdownCategory;
          if (activeDropdown === "uu-dai") {
            // Tạo category ảo cho Ưu đãi
            const promoProducts = mockPromotions.flatMap(promo => 
              promo.productIds.map(promoId => 
                mockProducts.find(p => p.id === promoId)
              )
            ).filter((p): p is ProductResDto => p !== undefined);
            dropdownCategory = {
              id: "promo",
              categoryName: "Ưu Đãi",
              key: "uu-dai",
              products: promoProducts
            } as CategoryResDto;
          } else {
            dropdownCategory = mockCategories.find((cat) => cat.key === activeDropdown);
          }
          
          if (!dropdownCategory) return null;

          return (
            <div
              onMouseEnter={() => setActiveDropdown(activeDropdown)}
              onMouseLeave={() => setActiveDropdown(null)}
              className="pointer-events-auto"
              style={{
                position: "absolute",
                left: "50%",
                top: "100%",
                transform: "translateX(-50%)",
                zIndex: 50,
              }}
            >
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
