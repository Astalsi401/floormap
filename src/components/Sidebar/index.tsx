import { useParams } from "react-router-dom";
import { setElementStatus, useAppDispatch, useAppSelector } from "@store";
import { Search, Advanced, ResultList, BoothInfo, type ResultListProps } from "./Elements";
import { getSearchParam } from "@functions";

export const Sidebar: React.FC<ResultListProps> = ({ svgRef, graphRef }) => {
  const dispatch = useAppDispatch();
  const sidebar = useAppSelector((state) => state.elementStatus.sidebar);
  const smallScreen = useAppSelector((state) => state.elementStatus.smallScreen);
  const { category } = useParams();
  const handleSidebarClick = (e: React.MouseEvent) => {
    const backBtn = document.querySelector(".fp-back-btn");
    !(backBtn === e.target || backBtn?.contains(e.target as Node)) && dispatch(setElementStatus({ sidebar: true }));
  };
  return (
    <div className={`fp-sidebar shadow ${sidebar ? "active" : ""} ${category === "areas" && getSearchParam("edit") === 0 ? "d-none" : ""}`} onClick={handleSidebarClick}>
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
export type { ResultListProps };
