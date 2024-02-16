import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Elements } from "./mapElements";
import { Selector } from "./selector";
import { dragCalculator, zoomCalculator, setDragStatus } from "../assets/store";

export function Floormap({ graphRef, svgRef, animation }) {
  console.count("Floormap rendered");
  const dispatch = useDispatch();
  const dragStatus = useSelector((state) => state.elementStatus.dragStatus);
  const zoom = useSelector((state) => state.elementStatus.zoom);
  const boothInfo = useSelector((state) => state.elementStatus.boothInfo);
  const realSize = useSelector((state) => state.elementStatus.realSize);
  const height = useSelector((state) => state.elementStatus.height);
  const tagsHeight = useSelector((state) => state.elementStatus.tagsHeight);
  const [viewBox, setViewBox] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });
  const handleStart = (e) => {
    let distance = e.touches ? e.touches[0].clientX + e.touches[0].clientY : e.clientX + e.clientY;
    dispatch(setDragStatus({ moving: true, distance }));
  };
  const handleEnd = (e) => {
    let distance = e.changedTouches ? e.changedTouches[0].clientX + e.changedTouches[0].clientY : e.clientX + e.clientY;
    dispatch(setDragStatus({ moving: false, previousTouch: null, previousTouchLength: null, distance: distance - dragStatus.distance }));
  };
  const handleTouchDragZoom = (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (dragStatus.previousTouch) dispatch(dragCalculator(touch.clientX - dragStatus.previousTouch.clientX, touch.clientY - dragStatus.previousTouch.clientY));
      dispatch(setDragStatus({ previousTouch: touch, previousTouchLength: e.touches.length }));
    } else {
      if (dragStatus.previousTouchLength && dragStatus.previousTouchLength !== e.touches.length) {
        handleEnd(e);
        return;
      }
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const x = (touch1.clientX + touch2.clientX) / 2;
      const y = (touch1.clientY + touch2.clientY) / 2;
      const d = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      dispatch(setDragStatus({ previousTouch: d }));
      if (dragStatus.previousTouch) zoomCalculator(x, y, graphRef, svgRef, d / dragStatus.previousTouch);
    }
  };
  const handleMouseDrag = ({ movementX, movementY }) => dispatch(dragCalculator(movementX, movementY));
  const handleWheelZoom = ({ clientX, clientY, deltaY }) => {
    let r = deltaY > 0 ? 0.95 : deltaY < 0 ? 1.05 : 1;
    dispatch(zoomCalculator(clientX, clientY, graphRef, svgRef, r));
  };

  useEffect(() => setViewBox({ x1: 0, y1: 0, x2: realSize.w, y2: realSize.h }), [realSize.w, realSize.h]);
  return (
    <div className="fp-floormap d-flex align-items-center" style={{ height: height + tagsHeight }}>
      <Selector graphRef={graphRef} svgRef={svgRef} animation={animation} />
      <div className={`fp-viewBox ${dragStatus.moving ? "moving" : ""}`} ref={graphRef} onWheel={handleWheelZoom} onMouseDown={handleStart} onMouseUp={handleEnd} onMouseLeave={handleEnd} onMouseMove={handleMouseDrag} onTouchStart={handleStart} onTouchEnd={handleEnd} onTouchCancel={handleEnd} onTouchMove={handleTouchDragZoom}>
        <svg id="floormap" className={boothInfo ? "active" : ""} ref={svgRef} style={{ translate: `${zoom.x + dragStatus.x}px ${zoom.y + dragStatus.y}px`, scale: `${zoom.scale}`, backgroundColor: "#f1f1f1" }} width="100%" height="100%" viewBox={`${viewBox.x1} ${viewBox.y1} ${viewBox.x2} ${viewBox.y2}`} xmlns="http://www.w3.org/2000/svg">
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
}
