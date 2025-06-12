import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products";
import { default as CartPage } from "./pages/Cart";
import Checkout from "./pages/Checkout";
import LoginStandalone from "./pages/auth/LoginStandalone";
import RegisterStandalone from "./pages/auth/RegisterStandalone";
import ProductDetail from "./pages/ProductDetail";
import ReviewOrder from "./pages/ReviewOrder";

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
    element: <CartPage />,
  },
  {
    path: "/checkout",
    element: <Checkout />,
  },
  {
    path: "/auth/login",
    element: <LoginStandalone />,
  },
  {
    path: "/auth/register",
    element: <RegisterStandalone />,
  },
]);
