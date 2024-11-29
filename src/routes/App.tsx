import { Suspense, useRef, useEffect } from "react";
import { useLoaderData, Await, useParams, useAsyncValue } from "react-router-dom";
import { resizeAsync, setElementStatus, pageLoadAsync, dataFormat, useAppDispatch, useAppSelector } from "@store";
import { Header, Sidebar, Floormap, Tooltip, PageLoading, Login, type ResultListProps } from "@components";
import { getSearchParam } from "@functions";
import type { GetMapElemsResponse } from "@types";

export const App: React.FC = () => {
  const { data } = useLoaderData() as { data: Promise<GetMapElemsResponse> };
  return (
    <Suspense fallback={<PageLoading />}>
      <Await resolve={data}>
        <FloormapApp />
      </Await>
    </Suspense>
  );
};

const FloormapApp: React.FC = () => {
  const dispatch = useAppDispatch();
  const sidebarWidth = useAppSelector((state) => state.elementStatus.sidebarWidth);
  const tagsHeight = useAppSelector((state) => state.elementStatus.tagsHeight);
  const smallScreen = useAppSelector((state) => state.elementStatus.smallScreen);
  const sidebar = useAppSelector((state) => state.elementStatus.sidebar);
  const loaded = useAppSelector((state) => state.floorData.loaded);
  const currentLogin = useAppSelector((state) => state.elementStatus.login);
  const graphRef = useRef(null);
  const svgRef = useRef(null);
  const { data, login } = useAsyncValue() as GetMapElemsResponse;
  const { category } = useParams();
  const isEdit = getSearchParam("edit") == 1;
  useEffect(() => {
    resizeAsync()(dispatch);
  }, [sidebar, smallScreen]);
  useEffect(() => {
    dispatch(setElementStatus({ login }));
    dataFormat({ data })(dispatch);
    pageLoadAsync()(dispatch);
    resizeAsync()(dispatch);
    window.addEventListener("resize", () => resizeAsync()(dispatch));
    return () => window.removeEventListener("resize", () => resizeAsync()(dispatch));
  }, []);
  if (loaded) {
    if (isEdit) {
      return currentLogin ? <MapWithSidebar sidebarWidth={sidebarWidth} tagsHeight={tagsHeight} smallScreen={smallScreen} graphRef={graphRef} svgRef={svgRef} /> : <Login />;
    } else if (category === "booths") {
      return <MapWithSidebar sidebarWidth={sidebarWidth} tagsHeight={tagsHeight} smallScreen={smallScreen} graphRef={graphRef} svgRef={svgRef} />;
    } else if (category === "areas") {
      return <MapWithTooltip graphRef={graphRef} svgRef={svgRef} />;
    }
  }
};

const MapWithSidebar: React.FC<ResultListProps & { sidebarWidth: number; tagsHeight: number; smallScreen: boolean }> = ({ sidebarWidth, tagsHeight, smallScreen, graphRef, svgRef }) => {
  const dispatch = useAppDispatch();
  return (
    <div className="fp-main" style={{ "--sidebar-width": `${sidebarWidth}px`, "--tags-height": `${tagsHeight}px` } as React.CSSProperties}>
      <Sidebar graphRef={graphRef} svgRef={svgRef} />
      <Header />
      <div className="fp-graph d-flex align-items-center" onClick={() => smallScreen && dispatch(setElementStatus({ sidebar: false }))}>
        <Floormap graphRef={graphRef} svgRef={svgRef} />
      </div>
    </div>
  );
};

const MapWithTooltip: React.FC<ResultListProps> = ({ graphRef, svgRef }) => (
  <div className="fp-main" style={{ "--sidebar-width": `${0}px`, "--tags-height": `${0}px` } as React.CSSProperties}>
    <Sidebar graphRef={graphRef} svgRef={svgRef} />
    <Floormap graphRef={graphRef} svgRef={svgRef} />
    <Tooltip />
  </div>
);
