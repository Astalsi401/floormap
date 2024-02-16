import { useDispatch, useSelector } from "react-redux";
import { manualToggleElement } from "../assets/store";
import { Search, Advanced, ResultList, BoothInfo } from "./sidebarElements";

export const Sidebar = ({ svgRef, graphRef, animation }) => {
  console.count("Sidebar rendered");
  const dispatch = useDispatch();
  const sidebar = useSelector((state) => state.elementStatus.sidebar);
  const smallScreen = useSelector((state) => state.elementStatus.smallScreen);
  return (
    <div className={`fp-sidebar shadow ${sidebar ? "active" : ""}`} onClick={() => dispatch(manualToggleElement({ name: "sidebar", value: true }))}>
      <Search />
      {sidebar || smallScreen ? (
        <>
          <Advanced />
          <BoothInfo />
          <ResultList svgRef={svgRef} graphRef={graphRef} animation={animation} />
        </>
      ) : (
        <></>
      )}
    </div>
  );
};
