import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Header from "./components/shared/Header";
import Home from "./pages/Home";
import Footer from "./components/shared/Footer";
import { AuthProvider } from "./contexts/AuthContext";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/Cart";
import ReviewOrder from "./pages/ReviewOrder";
import MyOrders from "./pages/MyOrders";
import OrderDetail from "./pages/OrderDetail";
import UserProfile from "./pages/UserProfile";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPromotions from "./pages/admin/AdminPromotions";
import ErrorBoundary from "./components/ErrorBoundary";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import RoleBasedChatBox from "./components/common/RoleBasedChatBox";
import AdminCategories from "./pages/admin/AdminCategories";
import StripeSuccess from "./pages/StripeSuccess";
import StripeCancel from "./pages/StripeCancel";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          {/* Toaster cho toàn app */}
          <Toaster position="top-right" />
          <Routes>
            {/* Auth routes */}
            <Route path="/auth">
              <Route path="register" element={<Register />} />
              <Route path="login" element={<Login />} />
            </Route>

            {/* Stripe routes */}
            <Route path="/stripe">
              <Route path="success" element={<StripeSuccess />} />
              <Route path="cancel" element={<StripeCancel />} />
            </Route>
            {/* Main layout routes with header/footer */}
            <Route
              path="/*"
              element={
                <div className="flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-grow pt-24 lg:pt-28">
                    <Routes>
                      {" "}
                      <Route path="/" element={<Home />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/review-order" element={<ReviewOrder />} />
                      <Route
                        path="/products/:idOrSlug"
                        element={<ProductDetail />}
                      />
                      <Route path="/orders" element={<MyOrders />} />
                      <Route
                        path="/orders/:orderId"
                        element={<OrderDetail />}
                      />
                      <Route path="/profile" element={<UserProfile />} />
                    </Routes>
                  </main>
                  <Footer />
                  <RoleBasedChatBox />
                </div>
              }
            />

            {/* Admin layout & routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="promotions" element={<AdminPromotions />} />
              {/* Các module admin khác sẽ thêm ở đây */}
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
