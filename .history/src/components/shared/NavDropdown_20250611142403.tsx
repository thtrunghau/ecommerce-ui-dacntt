import React from "react";
import type { CategoryResDto, ProductResDto } from "../../types";
import { Link } from "react-router-dom";

interface NavDropdownProps {
  category: DropdownCategory;
}

const NavDropdown: React.FC<NavDropdownProps> = ({ category }) => {
  return (
    <div className="animate-fadeIn absolute left-1/2 top-full z-50 mt-3 w-[900px] -translate-x-1/2 rounded-xl border border-gray-100 bg-white shadow-xl">
      <div className="px-8 py-6">
        <h3 className="mb-6 text-lg font-bold text-gray-800">
          Sản phẩm nổi bật
        </h3>
        <div className="grid grid-cols-4 gap-6">
          {category.products.map(
            (product: {
              id: number;
              name: string;
              image: string;
              isNew?: boolean;
              path: string;
            }) => (
              <Link
                to={product.path}
                key={product.id}
                className="group flex flex-col items-center rounded-xl bg-gray-50 p-4 transition-shadow hover:shadow-lg"
              >
                <div className="relative mb-3 flex h-24 w-32 items-center justify-center overflow-hidden rounded-lg bg-white">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/products/placeholder.png";
                    }}
                  />
                  {product.isNew && (
                    <span className="absolute left-2 top-2 rounded bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                      MỚI
                    </span>
                  )}
                </div>
                <span className="mt-2 text-center text-[15px] font-medium text-gray-900">
                  {product.name}
                </span>
              </Link>
            ),
          )}
        </div>
      </div>
    </div>
  );
};

export default NavDropdown;
