import { Suspense } from "react";
import { useLoaderData, Await } from "react-router-dom";
import { Loading } from "../components/loading";
import FloormapMain from "./floormapMain";

export default function App() {
  const { data } = useLoaderData();
  return (
    <Suspense fallback={<Loading />}>
      <Await resolve={data}>
        <FloormapMain />
      </Await>
    </Suspense>
  );
}
