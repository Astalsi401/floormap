import { useRef, useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { langChange, resizeAsync, fetchDataAsync, manualToggleElement, setSearchCondition, searchChange } from "../assets/store";
import { Loading } from "./../components/loading";
import { Header } from "./../components/header";
import { Sidebar } from "./../components/sidebar";
import { Floormap } from "./../components/map";

export default function Root() {
  console.count("Root rendered");
  const dispatch = useDispatch();
  const sidebarWidth = useSelector((state) => state.elementStatus.sidebarWidth);
  const tagsHeight = useSelector((state) => state.elementStatus.tagsHeight);
  const smallScreen = useSelector((state) => state.elementStatus.smallScreen);
  const sidebar = useSelector((state) => state.elementStatus.sidebar);
  const loaded = useSelector((state) => state.floorData.loaded);
  const graphRef = useRef(null);
  const svgRef = useRef(null);

  const animation = () => {
    svgRef.current.style.transition = "0.4s";
    setTimeout(() => (svgRef.current.style.transition = null), 400);
  };
  useEffect(() => {
    dispatch(fetchDataAsync());
    dispatch(resizeAsync());
    window.addEventListener("resize", () => dispatch(resizeAsync()));
    return () => window.removeEventListener("resize", () => dispatch(resizeAsync()));
  }, []);
  useEffect(() => {
    dispatch(resizeAsync());
  }, [sidebar, smallScreen]);
  //   useEffect(() => {
  //     const url = new URL(window.location.href);
  //     const searchParams = new URLSearchParams(url.search);
  //     for (const [k, v] of Object.entries(searchCondition)) {
  //       if (k !== "regex") v.length === 0 ? searchParams.delete(k) : searchParams.set(k, v);
  //     }
  //     url.search = searchParams.toString();
  //     history.pushState(null, "", url.href);
  //   }, [searchCondition]);
  if (!loaded) return <Loading />;
  return (
    <div className="fp-main" style={{ "--sidebar-width": `${sidebarWidth}px`, "--tags-height": `${tagsHeight}px` }}>
      <Sidebar svgRef={svgRef} graphRef={graphRef} animation={animation} />
      <Header />
      <div
        className="fp-graph d-flex align-items-center"
        onClick={() => {
          if (smallScreen) dispatch(manualToggleElement({ name: "sidebar", value: false }));
        }}
      >
        <Floormap graphRef={graphRef} svgRef={svgRef} animation={animation} />
      </div>
    </div>
  );
}
