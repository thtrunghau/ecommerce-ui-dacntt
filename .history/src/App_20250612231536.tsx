import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/shared/Header";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Footer from "./components/shared/Footer";
import { AuthProvider } from "./contexts/AuthContext";
import RegisterStandalone from "./pages/RegisterStandalone";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-grow pt-24 lg:pt-28">
            {" "}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register/standalone" element={<RegisterStandalone />} />
              <Route path="/login" element={<Login />} />
              {/* Add other routes here as needed */}
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
