import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import "./index.css";        // mantenha se você tiver esse arquivo
import { Toaster } from "react-hot-toast";
import { FaUser } from "react-icons/fa";



ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);