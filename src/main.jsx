import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { Outlet, createBrowserRouter, RouterProvider, Link } from "react-router-dom";
import store from "./assets/store";
import { getMapElems } from "./components/functions";
import ErrorPage from "./routes/error";
import Root from "./routes/root";
import "./assets/styles/floormap-main.scss";

const router = createBrowserRouter([
  {
    path: "/floormap/",
    element: <Link to={`/floormap/2023`}>2023</Link>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/floormap/:year",
    element: <Root />,
    errorElement: <ErrorPage />,
    loader: getMapElems,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  //   <React.StrictMode>
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
  //   </React.StrictMode>
);
