import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products";
import { default as CartPage } from "./pages/Cart";
import Checkout from "./pages/Checkout";
import LoginStandalone from "./pages/auth/LoginStandalone";
import RegisterStandalone from "./pages/auth/RegisterStandalone";
import ProductDetail from "./pages/ProductDetail";
import ReviewOrder from "./pages/ReviewOrder";
import Forbidden from "./pages/Forbidden";
import ProtectedRoute from "./components/auth/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/products",
    element: <Products />,
  },
  {
    path: "/products/:idOrSlug",
    element: <ProductDetail />,
  },
  {
    path: "/cart",
    element: (
      <ProtectedRoute>
        <CartPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/review-order",
    element: (
      <ProtectedRoute>
        <ReviewOrder />
      </ProtectedRoute>
    ),
  },
  {
    path: "/checkout",
    element: (
      <ProtectedRoute>
        <Checkout />
      </ProtectedRoute>
    ),
  },
  {
    path: "/auth/login",
    element: <LoginStandalone />,
  },
  {
    path: "/auth/register",
    element: <RegisterStandalone />,
  },
  {
    path: "/forbidden",
    element: <Forbidden />,
  },
]);
