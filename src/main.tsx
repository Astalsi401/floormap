import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider, Link } from "react-router-dom";
import store from "@store";
import { getMapElems } from "@functions";
import { App, ErrorPage } from "@routes";
import "@styles/floormap-main.scss";

const routes = [
  {
    path: "/floormap/",
    element: (
      <>
        <div>
          <Link to={`/floormap/tai-nex/2023/booths`}>醫療展 2023 Booths</Link>
        </div>
        <div>
          <Link to={`/floormap/tai-nex/2024/areas`}>醫療展 2024 Area</Link>
        </div>
        <div>
          <Link to={`/floormap/tai-nex/2024/booths`}>醫療展 2024 booths</Link>
        </div>
        <div>
          <Link to={`/floormap/tai-nex/2024/booths?edit=1`}>醫療展 2024 Booths edit</Link>
        </div>
        <div>
          <Link to={`/floormap/tai-nex/2025/areas?edit=1`}>醫療展 2025 Area edit</Link>
        </div>
        <div>
          <Link to={`/floormap/twtc/2025/areas?edit=1`}>高齡展 2025 Area edit</Link>
        </div>
      </>
    ),
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
