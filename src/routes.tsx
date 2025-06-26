import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/ProductSuggestion";
import { default as CartPage } from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import RegisterWithGoogle from "./pages/auth/RegisterWithGoogle";
import ProductDetail from "./pages/ProductDetail";
import ReviewOrder from "./pages/ReviewOrder";
import Forbidden from "./pages/Forbidden";
import ProtectedRoute from "./routes/ProtectedRoute";
import MyOrders from "./pages/MyOrders";
import OrderDetail from "./pages/OrderDetail";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAccounts from "./pages/admin/AdminAccounts";
import SellerAccounts from "./pages/seller/SellerAccounts";

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
    element: <Login />,
  },
  {
    path: "/auth/register-with-google",
    element: (
      <ProtectedRoute unauthOnly>
        <RegisterWithGoogle />
      </ProtectedRoute>
    ),
  },
  {
    path: "/auth/register",
    element: (
      <ProtectedRoute unauthOnly>
        <Register />
      </ProtectedRoute>
    ),
  },
  {
    path: "/forbidden",
    element: <Forbidden />,
  },
  {
    path: "/orders",
    element: <MyOrders />,
  },
  {
    path: "/orders/:orderId",
    element: <OrderDetail />,
  },
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute requiredRole={["ROLE_ADMIN", "ROLE_SELLER"]}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/accounts",
    element: (
      <ProtectedRoute requiredRole="ROLE_ADMIN">
        <AdminAccounts />
      </ProtectedRoute>
    ),
  },
  {
    path: "/seller/accounts",
    element: (
      <ProtectedRoute requiredRole="ROLE_SELLER">
        <SellerAccounts />
      </ProtectedRoute>
    ),
  },
]);
