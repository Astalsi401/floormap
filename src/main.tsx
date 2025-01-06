import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import store from "@store";
import { getMapElems } from "@functions";
import { App, Home, ErrorPage } from "@routes";
import "@styles/floormap-main.scss";

const routes = [
  {
    path: "/floormap/",
    element: <Home />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/floormap/:exhibition/:year/:category",
    element: <App />,
    errorElement: <ErrorPage />,
    loader: getMapElems,
  },
];
const router = createBrowserRouter(routes, { future: { v7_relativeSplatPath: true, v7_fetcherPersist: true, v7_normalizeFormMethod: true, v7_partialHydration: true, v7_skipActionErrorRevalidation: true } });

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </Provider>
  </React.StrictMode>
);
