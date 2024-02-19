import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider, Link } from "react-router-dom";
import store from "./assets/store";
import { getMapElems } from "./components/functions";
import ErrorPage from "./routes/error";
import App from "./routes/App";
import "./assets/styles/floormap-main.scss";

const router = createBrowserRouter([
  {
    path: "/floormap/",
    element: (
      <>
        <Link to={`/floormap/2023/boothes`}>2023 Boothes</Link>
        <Link to={`/floormap/2023/area`}>2023 Area</Link>
      </>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/floormap/:year/:category",
    element: <App />,
    errorElement: <ErrorPage />,
    loader: getMapElems,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
