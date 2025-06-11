import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/shared/Header";
import Home from "./pages/Home";
import Footer from "./components/shared/Footer";

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen flex-col">
        <Header/>
        <main className="flex-grow pt-24 lg:pt-28">
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Add other routes here as needed */}
          </Routes>
        </main>
        <Footer/>
      </div>
    </Router>
  );
}
