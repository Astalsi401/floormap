import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { Elements } from "./mapElements";
import { Selector } from "./selector";
import { setDragStatus } from "@store";
import { dragCalculator, zoomCalculator } from "@functions";

export const Floormap = ({ graphRef, svgRef, animation }) => {
  console.count("Floormap rendered");
  const dispatch = useDispatch();
  const dragStatus = useSelector((state) => state.elementStatus.dragStatus);
  const boothInfo = useSelector((state) => state.elementStatus.boothInfo);
  const realSize = useSelector((state) => state.elementStatus.realSize);
  const height = useSelector((state) => state.elementStatus.height);
  const tagsHeight = useSelector((state) => state.elementStatus.tagsHeight);
  const { category } = useParams();
  const [viewBox, setViewBox] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });
  const handleStart = (e) => dispatch(setDragStatus({ moving: true, distance: e.touches ? e.touches[0].clientX + e.touches[0].clientY : e.clientX + e.clientY }));
  const handleEnd = (e) => {
    Object.assign(graphRef.current.dataset, { prevX: null, prevY: null, prevD: null });
    let distance = e.changedTouches ? e.changedTouches[0].clientX + e.changedTouches[0].clientY : e.clientX + e.clientY;
    dispatch(setDragStatus({ moving: false, distance: distance - dragStatus.distance }));
  };
  const handleTouchDragZoom = ({ touches }) => {
    if (touches.length === 1) {
      // handle drag
      const [touch] = touches;
      const prevX = Math.round(parseFloat(graphRef.current.dataset.prevX));
      const prevY = Math.round(parseFloat(graphRef.current.dataset.prevY));
      if (prevX && prevY && dragStatus.moving) requestAnimationFrame(() => dragCalculator(touch.clientX - prevX, touch.clientY - prevY, svgRef.current));
      Object.assign(graphRef.current.dataset, { prevX: touch.clientX, prevY: touch.clientY });
    } else {
      // handle zoom
      const [touch1, touch2] = touches;
      const x = (touch1.clientX + touch2.clientX) / 2;
      const y = (touch1.clientY + touch2.clientY) / 2;
      const d = Math.round(Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY));
      const prevD = Math.round(parseFloat(graphRef.current.dataset.prevD));
      if (prevD) requestAnimationFrame(() => zoomCalculator(x, y, graphRef.current, svgRef.current, d / prevD));
      graphRef.current.dataset.prevD = d;
    }
  };
  const handleMouseDrag = ({ movementX, movementY }) => dragStatus.moving && requestAnimationFrame(() => dragCalculator(movementX, movementY, svgRef.current));
  const handleWheelZoom = ({ clientX, clientY, deltaY }) => requestAnimationFrame(() => zoomCalculator(clientX, clientY, graphRef.current, svgRef.current, deltaY > 0 ? 0.95 : deltaY < 0 ? 1.05 : 1));
  useEffect(() => {
    setViewBox({ x1: 0, y1: 0, x2: realSize.w, y2: realSize.h });
  }, [realSize.w, realSize.h]);
  return (
    <div className="fp-floormap d-flex align-items-center" style={{ height: height + tagsHeight }}>
      {category !== "areas" && <Selector graphRef={graphRef} svgRef={svgRef} animation={animation} />}
      <div className={`fp-viewBox ${dragStatus.moving ? "moving" : ""}`} ref={graphRef} onWheel={handleWheelZoom} onMouseDown={handleStart} onMouseUp={handleEnd} onMouseLeave={handleEnd} onMouseMove={handleMouseDrag} onTouchStart={handleStart} onTouchEnd={handleEnd} onTouchCancel={handleEnd} onTouchMove={handleTouchDragZoom}>
        <svg id="floormap" className={boothInfo ? "active" : ""} ref={svgRef} style={{ translate: `0px 0px`, scale: "1", backgroundColor: "#f1f1f1" }} width="100%" height="100%" viewBox={`${viewBox.x1} ${viewBox.y1} ${viewBox.x2} ${viewBox.y2}`} xmlns="http://www.w3.org/2000/svg">
          <Elements type="wall" />
          <Elements type="pillar" />
          <Elements type="text" />
          <Elements type="icon" size={200} />
          <Elements type="room" size={200} />
          <Elements type="booth" size={250} />
        </svg>
      </div>
    </div>
  );
};
