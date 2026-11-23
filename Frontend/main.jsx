import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";
import App from "./App";
import { AuthProvider } from "./store/AuthContext";
import { WishlistProvider } from "./store/WishlistContext";
import "./styles/tailwind.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <WishlistProvider>
        <App />
        <Toaster position="top-right" richColors />
      </WishlistProvider>
    </AuthProvider>
  </React.StrictMode>,
);
