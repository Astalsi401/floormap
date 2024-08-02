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
    if (!dragStatus.moving) return;
    let distance = e.changedTouches ? e.changedTouches[0].clientX + e.changedTouches[0].clientY : e.clientX + e.clientY;
    dispatch(setDragStatus({ moving: false, previousTouch: null, previousTouchLength: null, distance: distance - dragStatus.distance }));
  };
  const handleTouchDragZoom = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (dragStatus.previousTouch && dragStatus.moving) requestAnimationFrame(() => dragCalculator(touch.clientX - dragStatus.previousTouch.clientX, touch.clientY - dragStatus.previousTouch.clientY, svgRef.current));
      dispatch(setDragStatus({ previousTouch: touch, previousTouchLength: e.touches.length }));
    } else {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const x = (touch1.clientX + touch2.clientX) / 2;
      const y = (touch1.clientY + touch2.clientY) / 2;
      const d = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      dispatch(setDragStatus({ previousTouch: d }));
      if (dragStatus.previousTouch) requestAnimationFrame(() => zoomCalculator(x, y, graphRef.current, svgRef.current, d / dragStatus.previousTouch));
    }
  };
  const handleMouseDrag = ({ movementX, movementY }) => dragStatus.moving && requestAnimationFrame(() => dragCalculator(movementX, movementY, svgRef.current));
  const handleWheelZoom = ({ clientX, clientY, deltaY }) => {
    let r = deltaY > 0 ? 0.95 : deltaY < 0 ? 1.05 : 1;
    requestAnimationFrame(() => zoomCalculator(clientX, clientY, graphRef.current, svgRef.current, r));
  };
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
