import React from "react";
import { useNavigate } from "react-router-dom";
import { useCompare } from "../contexts/CompareContext";
import ErrorState from "../components/common/ErrorState";
import { formatPrice } from "../utils/formatPrice";
import { parseProductDescription } from "../utils/productDescriptionUtils";
import { getProductImageUrl } from "../utils/imageUtils";

const ComparePage: React.FC = () => {
  const { comparedProducts, removeProduct } = useCompare();
  const navigate = useNavigate();

  // Redirect back to home if no products to compare
  if (!comparedProducts.length) {
    return (
      <div className="container mx-auto px-4 py-16">
        <ErrorState
          message="Không có sản phẩm nào để so sánh"
          className="min-h-[400px] rounded-xl bg-white p-12 shadow-sm"
          onRetry={() => navigate("/")}
          buttonText="Quay lại trang chủ"
        />
      </div>
    );
  }

  // Get all unique specs keys from all products
  const allSpecsKeys = Array.from(
    new Set(
      comparedProducts.flatMap((product) => {
        const parsedDescription = product.description
          ? parseProductDescription(product.description)
          : { attribute: {} };
        const specs = parsedDescription.attribute || {};
        return Object.keys(specs);
      }),
    ),
  );

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Section Header */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-block border-b-2 border-black p-2">
          <h2 className="text-4xl font-bold text-black">So sánh sản phẩm</h2>
        </div>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          So sánh thông số kỹ thuật, giá cả và tính năng giữa các sản phẩm
        </p>
        <div className="mt-6 flex items-center justify-center space-x-2">
          <div className="h-1 w-16 rounded-full bg-black"></div>
          <div className="h-1 w-6 rounded-full bg-gray-300"></div>
          <div className="h-1 w-6 rounded-full bg-gray-300"></div>
        </div>
      </div>

      {/* Main comparison table with horizontal scroll for mobile */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          {/* Sticky header with product images */}
          <thead className="sticky top-0 z-10 bg-white">
            <tr>
              <th className="w-1/4 min-w-[160px] border-b border-gray-200 bg-white p-4 text-left"></th>
              {comparedProducts.map((product) => (
                <th
                  key={product.id}
                  className="border-b border-gray-200 p-4 text-center"
                >
                  <div className="relative flex flex-col items-center">
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white text-xs font-medium text-gray-500 shadow-sm transition-all hover:bg-gray-100"
                    >
                      ✕
                    </button>
                    <div className="mb-4 h-40 w-40 overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={getProductImageUrl(product.image)}
                        alt={product.productName}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <h3 className="mb-1 text-lg font-medium text-black">
                      {product.productName}
                    </h3>
                    <p className="mb-3 text-2xl font-bold text-black">
                      {formatPrice(product.price)}
                    </p>
                    <button
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="w-full rounded-full border border-black bg-white px-4 py-2 text-sm font-medium text-black transition-all hover:bg-black hover:text-white"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table body with compare data */}
          <tbody>
            {/* Basic info section */}
            <tr>
              <td
                colSpan={comparedProducts.length + 1}
                className="border-b-2 border-t-2 border-black bg-gray-100 p-4"
              >
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-2 rounded bg-black"></div>
                  <h3 className="text-xl font-bold text-black">
                    Thông tin cơ bản
                  </h3>
                </div>
              </td>
            </tr>
            <tr>
              <td className="border-b border-gray-200 bg-white p-4 font-medium">
                Số lượng còn
              </td>
              {comparedProducts.map((product) => (
                <td
                  key={product.id}
                  className="border-b border-gray-200 bg-white p-4 text-center"
                >
                  {product.quantity} sản phẩm
                </td>
              ))}
            </tr>
            <tr className="bg-gray-50">
              <td className="border-b border-gray-200 p-4 font-medium">
                Tóm tắt
              </td>
              {comparedProducts.map((product) => {
                const parsedDescription = product.description
                  ? parseProductDescription(product.description)
                  : { summary: "" };
                return (
                  <td
                    key={product.id}
                    className="border-b border-gray-200 p-4 text-center"
                  >
                    <div className="max-h-32 overflow-y-auto text-sm">
                      {parsedDescription.summary || "Không có tóm tắt"}
                    </div>
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="border-b border-gray-200 p-4 font-medium">
                Mô tả chi tiết
              </td>
              {comparedProducts.map((product) => {
                const parsedDescription = product.description
                  ? parseProductDescription(product.description)
                  : { description: "" };
                return (
                  <td
                    key={product.id}
                    className="border-b border-gray-200 p-4 text-center"
                  >
                    <div className="max-h-48 overflow-y-auto text-sm">
                      {parsedDescription.description ||
                        "Không có mô tả chi tiết"}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Technical specifications section */}
            <tr>
              <td
                colSpan={comparedProducts.length + 1}
                className="border-b-2 border-t-2 border-black bg-gray-100 p-4 pt-8"
              >
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-2 rounded bg-black"></div>
                  <h3 className="text-xl font-bold text-black">
                    Thông số kỹ thuật
                  </h3>
                </div>
              </td>
            </tr>

            {/* Map through all specs keys */}
            {allSpecsKeys.map((key, index) => (
              <tr
                key={key}
                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="border-b border-gray-200 p-4 font-medium capitalize">
                  {formatSpecName(key)}
                </td>
                {comparedProducts.map((product) => {
                  const parsedDescription = product.description
                    ? parseProductDescription(product.description)
                    : { attribute: {} };
                  const specs = parsedDescription.attribute || {};
                  const value = specs[key as keyof typeof specs];

                  // Make sure we safely render the value as a string
                  const displayValue = value
                    ? typeof value === "string"
                      ? value
                      : JSON.stringify(value)
                    : "—";

                  // Check if this value is different from others
                  const isAllSameValue = comparedProducts.every((p) => {
                    const pd = p.description
                      ? parseProductDescription(p.description)
                      : { attribute: {} };
                    const ps = pd.attribute || {};
                    const pv = ps[key as keyof typeof ps];
                    return pv === value;
                  });

                  // Check if this product has a value for this spec when others might not
                  const hasUniqueValue =
                    value &&
                    comparedProducts.some((p) => {
                      if (p.id === product.id) return false;
                      const pd = p.description
                        ? parseProductDescription(p.description)
                        : { attribute: {} };
                      const ps = pd.attribute || {};
                      const pv = ps[key as keyof typeof ps];
                      return !pv;
                    });

                  return (
                    <td
                      key={product.id}
                      className={`border-b border-gray-200 p-4 text-center ${
                        !isAllSameValue
                          ? "bg-gray-100 font-medium"
                          : hasUniqueValue
                            ? "bg-gray-50 font-medium"
                            : ""
                      }`}
                    >
                      {displayValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="mt-12 flex justify-center">
        <button
          onClick={() => navigate("/")}
          className="rounded-full border-2 border-black bg-white px-8 py-3 text-base font-semibold text-black transition-all hover:bg-black hover:text-white"
        >
          Quay lại trang chủ
        </button>
      </div>
    </div>
  );
};

// Helper function to format spec names for display
const formatSpecName = (key: string): string => {
  return key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .trim();
};

export default ComparePage;
