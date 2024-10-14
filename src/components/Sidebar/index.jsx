import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { setElementStatus } from "@store";
import { Search, Advanced, ResultList, BoothInfo } from "./Elements";
import { getSearchParam } from "@functions";

export const Sidebar = ({ svgRef, graphRef }) => {
  const dispatch = useDispatch();
  const sidebar = useSelector((state) => state.elementStatus.sidebar);
  const smallScreen = useSelector((state) => state.elementStatus.smallScreen);
  const { category } = useParams();
  return (
    <div className={`fp-sidebar shadow ${sidebar ? "active" : ""} ${category === "areas" && getSearchParam("edit") === 0 ? "d-none" : ""}`} onClick={() => dispatch(setElementStatus({ sidebar: true }))}>
      <Search />
      {(sidebar || smallScreen) && (
        <>
          <Advanced />
          <BoothInfo />
          <ResultList svgRef={svgRef} graphRef={graphRef} />
        </>
      )}
    </div>
  );
};
