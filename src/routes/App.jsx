import { Suspense, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLoaderData, Await, useParams, useAsyncValue } from "react-router-dom";
import { resizeAsync, setElementStatus, pageLoadAsync, dataFormat } from "@store";
import { Header, Sidebar, Floormap, Tooltip, PageLoading, Login } from "@components";
import { getSearchParam, fetchData } from "@functions";

export const App = () => {
  const { data } = useLoaderData();
  return (
    <Suspense fallback={<PageLoading />}>
      <Await resolve={data}>
        <FloormapApp />
      </Await>
    </Suspense>
  );
};

const FloormapApp = () => {
  const dispatch = useDispatch();
  const sidebarWidth = useSelector((state) => state.elementStatus.sidebarWidth);
  const tagsHeight = useSelector((state) => state.elementStatus.tagsHeight);
  const smallScreen = useSelector((state) => state.elementStatus.smallScreen);
  const sidebar = useSelector((state) => state.elementStatus.sidebar);
  const loaded = useSelector((state) => state.floorData.loaded);
  const currentLogin = useSelector((state) => state.elementStatus.login);
  const graphRef = useRef(null);
  const svgRef = useRef(null);
  const { data, login } = useAsyncValue();
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

const MapWithSidebar = ({ sidebarWidth, tagsHeight, smallScreen, graphRef, svgRef }) => (
  <div className="fp-main" style={{ "--sidebar-width": `${sidebarWidth}px`, "--tags-height": `${tagsHeight}px` }}>
    <Sidebar graphRef={graphRef} svgRef={svgRef} />
    <Header />
    <div className="fp-graph d-flex align-items-center" onClick={() => smallScreen && dispatch(setElementStatus({ sidebar: false }))}>
      <Floormap graphRef={graphRef} svgRef={svgRef} />
    </div>
  </div>
);

const MapWithTooltip = ({ graphRef, svgRef }) => (
  <div className="fp-main" style={{ "--sidebar-width": `${0}px`, "--tags-height": `${0}px` }}>
    <Sidebar graphRef={graphRef} svgRef={svgRef} />
    <Floormap graphRef={graphRef} svgRef={svgRef} />
    <Tooltip />
  </div>
);
