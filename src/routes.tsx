import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
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
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StripeSuccess from "./pages/StripeSuccess";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPromotions from "./pages/admin/AdminPromotions";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
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
    path: "/admin",
    element: <AdminLayout />, // layout with sidebar
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute requiredRole={["ROLE_ADMIN", "ROLE_SELLER"]}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "categories",
        element: (
          <ProtectedRoute requiredRole={["ROLE_ADMIN", "ROLE_SELLER"]}>
            <AdminCategories />
          </ProtectedRoute>
        ),
      },
      {
        path: "products",
        element: (
          <ProtectedRoute requiredRole={["ROLE_ADMIN", "ROLE_SELLER"]}>
            <AdminProducts />
          </ProtectedRoute>
        ),
      },
      {
        path: "orders",
        element: (
          <ProtectedRoute requiredRole={["ROLE_ADMIN", "ROLE_SELLER"]}>
            <AdminOrders />
          </ProtectedRoute>
        ),
      },
      {
        path: "users",
        element: (
          <ProtectedRoute requiredRole={["ROLE_ADMIN", "ROLE_SELLER"]}>
            <AdminUsers />
          </ProtectedRoute>
        ),
      },
      {
        path: "promotions",
        element: (
          <ProtectedRoute requiredRole={["ROLE_ADMIN", "ROLE_SELLER"]}>
            <AdminPromotions />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/stripe/success",
    element: <StripeSuccess />,
  },
]);
