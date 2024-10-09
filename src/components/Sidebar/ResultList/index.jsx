import { useSelector, useDispatch } from "react-redux";
import { setSearchCondition, setElementStatus, initEditForm } from "@store";
import { zoomCalculator, dragCalculator } from "@functions";

export const ResultList = ({ svgRef, graphRef }) => {
  const types = useSelector((state) => state.types);
  const data = useSelector((state) => state.floorData.filterData).filter((d) => types.includes(d.type) && types.includes(d.type) && d.sidebar && d.text.length > 0 && d.opacity > 0.1 && d.text.length !== 0);
  return (
    <div className="fp-result pb-5">
      {data.map((d) => (
        <Result key={`Result-${d.corpId ?? d.id}`} d={d} svgRef={svgRef} graphRef={graphRef} />
      ))}
    </div>
  );
};

const Result = ({ d, svgRef, graphRef }) => {
  const dispatch = useDispatch();
  const colors = useSelector((state) => state.elementStatus.colors);
  const smallScreen = useSelector((state) => state.elementStatus.smallScreen);
  const sidebar = useSelector((state) => state.elementStatus.sidebar);
  const sidebarWidth = useSelector((state) => state.elementStatus.sidebarWidth);
  const tagsHeight = useSelector((state) => state.elementStatus.tagsHeight);
  const isBooth = d.type === "booth";
  const id = isBooth ? `${d.id}-${d.org}` : `${d.text.join("")}-${d.floor}`;
  const bg = isBooth ? colors.scale(d.cat) : "#acacac";
  const name = isBooth ? d.org : d.text.join("");
  const loc = isBooth ? `${d.id} / ${d.floor}F` : `${d.floor}F`;
  const handleResultClick = () => {
    if (!sidebar) return;
    initEditForm({ id: d.id })(dispatch);
    dispatch(setElementStatus({ boothInfo: true, boothInfoData: d }));
    dispatch(setSearchCondition({ floor: d.floor }));
    // 定位選取攤位中心點至地圖中心點
    const svgPoint = svgRef.current.createSVGPoint();
    svgPoint.x = d.x + d.w / 2;
    svgPoint.y = d.y + d.h / 2;
    const CTM = svgRef.current.getScreenCTM();
    const transformedPoint = svgPoint.matrixTransform(CTM);
    const { offsetLeft: x, offsetTop: y, offsetWidth: w, offsetHeight: h } = graphRef.current;
    const center = { x: w / 2 + x, y: smallScreen ? (sidebarWidth + tagsHeight) / 2 : h / 2 + y };
    zoomCalculator({ clientX: transformedPoint.x, clientY: transformedPoint.y, graph: graphRef.current, svg: svgRef.current, r: 1.5, rMax: 1.5, animate: true });
    dragCalculator({ x: center.x - transformedPoint.x, y: center.y - transformedPoint.y, svg: svgRef.current, animate: true });
  };
  return (
    <div id={id} className="fp-result-item d-flex align-items-center px-2 py-1" style={{ "--cat": bg }} onClick={handleResultClick}>
      <div className="fp-result-item-name text-large">{name}</div>
      <div className="fp-result-item-loc text-small">{loc}</div>
    </div>
  );
};
