import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/shared/Header";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Footer from "./components/shared/Footer";
import { AuthProvider } from "./contexts/AuthContext";
import RegisterStandalone from "./pages/RegisterStandalone";
import LoginStandalone from "./pages/LoginStandalone";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        {" "}
        <Routes>
          {/* Standalone routes without header/footer */}
          <Route path="/register/standalone" element={<RegisterStandalone />} />
          <Route path="/login/standalone" element={<LoginStandalone />} />

          {/* Routes with header/footer layout */}
          <Route
            path="/*"
            element={
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-grow pt-24 lg:pt-28">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    {/* Add other routes here as needed */}
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
