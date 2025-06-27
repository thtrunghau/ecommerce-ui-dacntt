import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="1055648667337-rqum9kirmddk1l8v2e7en4vrhml9skfo.apps.googleusercontent.com">
      <QueryClientProvider client={queryClient}>
        <App />
        <ToastContainer position="top-center" autoClose={2000} />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
