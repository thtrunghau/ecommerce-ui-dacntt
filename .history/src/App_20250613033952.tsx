import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/shared/Header";
import Home from "./pages/Home";
import Footer from "./components/shared/Footer";
import { AuthProvider } from "./contexts/AuthContext";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import RegisterStandalone from "./pages/auth/RegisterStandalone";
import LoginStandalone from "./pages/auth/LoginStandalone";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/Cart";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth routes */}
          <Route path="/auth">
            <Route path="register" element={<RegisterStandalone />} />
            <Route path="login" element={<LoginStandalone />} />
          </Route>

          {/* Main layout routes with header/footer */}
          <Route
            path="/*"
            element={
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-grow pt-24 lg:pt-28">
                  <Routes>                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route
                      path="/products/:idOrSlug"
                      element={<ProductDetail />}
                    />
                  </Routes>
                </main>
                <Footer />
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
