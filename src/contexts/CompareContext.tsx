import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { ProductResDto } from "../types";

interface CompareContextType {
  comparedProducts: ProductResDto[];
  addProduct: (product: ProductResDto) => void;
  removeProduct: (productId: string) => void;
  isCompared: (productId: string) => boolean;
  clearCompared: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
};

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [comparedProducts, setComparedProducts] = useState<ProductResDto[]>([]);

  const addProduct = (product: ProductResDto) => {
    setComparedProducts((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeProduct = (productId: string) => {
    setComparedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const isCompared = (productId: string) => {
    return comparedProducts.some((p) => p.id === productId);
  };

  const clearCompared = () => setComparedProducts([]);

  return (
    <CompareContext.Provider
      value={{
        comparedProducts,
        addProduct,
        removeProduct,
        isCompared,
        clearCompared,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};
