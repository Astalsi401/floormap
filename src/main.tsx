import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider, Link } from "react-router-dom";
import store from "@store";
import { getMapElems } from "@functions";
import { App, ErrorPage } from "@routes";
import "@styles/floormap-main.scss";

const router = createBrowserRouter(
  [
    {
      path: "/floormap/",
      element: (
        <>
          <div>
            <Link to={`/floormap/2023/booths`}>2023 Booths</Link>
          </div>
          <div>
            <Link to={`/floormap/2024/areas`}>2024 Area</Link>
          </div>
          <div>
            <Link to={`/floormap/2024/booths`}>2024 booths</Link>
          </div>
          <div>
            <Link to={`/floormap/2024/booths?edit=1`}>2024 Booths edit</Link>
          </div>
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
  ],
  {
    future: { v7_relativeSplatPath: true, v7_fetcherPersist: true, v7_normalizeFormMethod: true, v7_partialHydration: true, v7_skipActionErrorRevalidation: true },
  }
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </Provider>
  </React.StrictMode>
);
