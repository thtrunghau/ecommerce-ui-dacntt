import React, { useState, useMemo } from "react";
import {
  Chip,
  Slider,
  FormControlLabel,
  Checkbox,
  Collapse,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import type { ProductResDto } from "../../../types";
import {
  // extractBaseName, // Removed: no longer needed for brands
  parseVariantInfo,
} from "../../../utils/productVariants";
import { formatPrice } from "../../../utils/formatPrice";

interface AdvancedFiltersProps {
  products: ProductResDto[];
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  priceRange: [number, number];
  setPriceRange: React.Dispatch<React.SetStateAction<[number, number]>>;
  // selectedBrands: string[]; // Removed
  // setSelectedBrands: React.Dispatch<React.SetStateAction<string[]>>; // Removed
  selectedColors: string[];
  setSelectedColors: React.Dispatch<React.SetStateAction<string[]>>;
  selectedStorages: string[];
  setSelectedStorages: React.Dispatch<React.SetStateAction<string[]>>;
  inStockOnly: boolean;
  setInStockOnly: React.Dispatch<React.SetStateAction<boolean>>;
  onClearFilters: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  products,
  searchTerm,
  setSearchTerm,
  priceRange,
  setPriceRange,
  // selectedBrands, // Removed
  // setSelectedBrands, // Removed
  selectedColors,
  setSelectedColors,
  selectedStorages,
  setSelectedStorages,
  inStockOnly,
  setInStockOnly,
  onClearFilters,
}) => {
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    search: true,
    price: true,
    // brands: true, // Removed
    colors: true,
    storage: true,
    stock: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Extract available options from products
  const availableOptions = useMemo(() => {
    // const brands = new Set<string>(); // Removed
    const colors = new Set<string>();
    const storages = new Set<string>();
    let minPrice = Infinity;
    let maxPrice = 0;

    products.forEach((product) => {
      // Removed: brand extraction
      // Extract variants
      const variantInfo = parseVariantInfo(product.productName);
      variantInfo.variants.forEach((variant) => {
        if (variant.type === "color") {
          colors.add(variant.value);
        } else if (variant.type === "storage") {
          storages.add(variant.value);
        }
      });

      // Price range
      minPrice = Math.min(minPrice, product.price);
      maxPrice = Math.max(maxPrice, product.price);
    });

    return {
      // brands: Array.from(brands).sort(), // Removed
      colors: Array.from(colors).sort(),
      storages: Array.from(storages).sort((a, b) => {
        const aNum = parseInt(a);
        const bNum = parseInt(b);
        return aNum - bNum;
      }),
      priceRange: [minPrice === Infinity ? 0 : minPrice, maxPrice] as [
        number,
        number,
      ],
    };
  }, [products]);

  // Removed: handleBrandToggle

  const handleColorToggle = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  };

  const handleStorageToggle = (storage: string) => {
    setSelectedStorages((prev) =>
      prev.includes(storage)
        ? prev.filter((s) => s !== storage)
        : [...prev, storage],
    );
  };

  // Cleaned up activeFiltersCount: removed selectedBrands
  const activeFiltersCount =
    (searchTerm ? 1 : 0) +
    (priceRange[0] !== availableOptions.priceRange[0] ||
    priceRange[1] !== availableOptions.priceRange[1]
      ? 1
      : 0) +
    // selectedBrands.length + // Removed
    selectedColors.length +
    selectedStorages.length +
    (inStockOnly ? 1 : 0);

  const FilterSection: React.FC<{
    title: string;
    section: string;
    children: React.ReactNode;
  }> = ({ title, section, children }) => (
    <div className="border-b border-gray-200 pb-4">
      <button
        onClick={() => toggleSection(section)}
        className="flex w-full items-center justify-between text-left font-medium text-gray-900"
      >
        <span>{title}</span>
        <ExpandMoreIcon
          className={`h-5 w-5 transition-transform ${
            expandedSections[section] ? "rotate-180" : ""
          }`}
        />
      </button>
      <Collapse in={expandedSections[section]}>
        <div className="mt-3">{children}</div>
      </Collapse>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Bộ lọc
          {activeFiltersCount > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              {activeFiltersCount}
            </span>
          )}
        </h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Search */}
      <FilterSection title="Tìm kiếm" section="search">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-full border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Khoảng giá" section="price">
        <div className="px-2">
          <Slider
            value={priceRange}
            onChange={(_, newValue) =>
              setPriceRange(newValue as [number, number])
            }
            valueLabelDisplay="auto"
            min={availableOptions.priceRange[0]}
            max={availableOptions.priceRange[1]}
            step={100000}
            valueLabelFormat={(value) => formatPrice(value)}
            className="text-blue-600"
          />
          <div className="mt-2 flex justify-between text-sm text-gray-600">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </FilterSection>

      {/* Colors */}
      {availableOptions.colors.length > 0 && (
        <FilterSection title="Màu sắc" section="colors">
          <div className="flex flex-wrap gap-2">
            {availableOptions.colors.map((color) => (
              <Chip
                key={color}
                label={color}
                onClick={() => handleColorToggle(color)}
                variant={selectedColors.includes(color) ? "filled" : "outlined"}
                color={selectedColors.includes(color) ? "primary" : "default"}
                size="small"
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Storage */}
      {availableOptions.storages.length > 0 && (
        <FilterSection title="Dung lượng" section="storage">
          <div className="flex flex-wrap gap-2">
            {availableOptions.storages.map((storage) => (
              <Chip
                key={storage}
                label={storage}
                onClick={() => handleStorageToggle(storage)}
                variant={
                  selectedStorages.includes(storage) ? "filled" : "outlined"
                }
                color={
                  selectedStorages.includes(storage) ? "primary" : "default"
                }
                size="small"
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Stock Status */}
      <FilterSection title="Tình trạng kho" section="stock">
        <FormControlLabel
          control={
            <Checkbox
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              color="primary"
            />
          }
          label="Chỉ hiển thị sản phẩm còn hàng"
        />
      </FilterSection>

      {/*
        NOTE: Nếu input search vẫn bị mất focus, hãy kiểm tra ở component cha (ProductsSection) để đảm bảo state searchTerm và setSearchTerm không bị tạo lại mỗi lần render.
        Đảm bảo state được quản lý ở cấp cao nhất và không truyền inline function/object làm prop.
      */}
    </div>
  );
};

export default AdvancedFilters;
