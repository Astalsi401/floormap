import { useRouteError, isRouteErrorResponse } from "react-router-dom";

export const ErrorPage: React.FC = () => {
  const error = useRouteError();
  console.error(error);
  return (
    <div id="error-page text-center">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{isRouteErrorResponse(error) ? error.data.message || error.statusText : error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown error"}</i>
      </p>
    </div>
  );
};
