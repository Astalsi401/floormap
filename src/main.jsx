import React from "react";
import ReactDOM from "react-dom/client";
import { Outlet, createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./routes/error";
import Root from "./routes/root";

const router = createBrowserRouter([
  {
    path: "/floormap/",
    element: <Root category="Home" />,
    errorElement: <ErrorPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
