import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Elements } from "./Elements";
import { Selector } from "./Selector";
import { setDragStatus, useAppDispatch, useAppSelector } from "@store";
import { dragCalculator, zoomCalculator, getSearchParam } from "@functions";
import { type ResultListProps } from "@components";
import type { DragStatus } from "@types";

export const Floormap: React.FC<ResultListProps> = ({ graphRef, svgRef }) => {
  const dispatch = useAppDispatch();
  const dragStatus = useAppSelector((state) => state.elementStatus.dragStatus);
  const boothInfo = useAppSelector((state) => state.elementStatus.boothInfo);
  const realSize = useAppSelector((state) => state.elementStatus.realSize);
  const height = useAppSelector((state) => state.elementStatus.height);
  const tagsHeight = useAppSelector((state) => state.elementStatus.tagsHeight);
  const { category } = useParams();
  const [viewBox, setViewBox] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });
  const handleStart = (newDragStatus: DragStatus) => dispatch(setDragStatus(newDragStatus));
  const handleMouseStart = (e: React.MouseEvent) => handleStart({ moving: true, distance: e.clientX + e.clientY });
  const handleTouchStart = (e: React.TouchEvent) => handleStart({ moving: true, distance: e.touches[0].clientX + e.touches[0].clientY });
  const handleEnd = (x: number, y: number) => {
    if (!graphRef.current) return;
    Object.assign(graphRef.current.dataset, { prevX: null, prevY: null, prevD: null });
    dispatch(setDragStatus({ moving: false, distance: x + y - dragStatus.distance }));
  };
  const handleMouseEnd = (e: React.MouseEvent) => handleEnd(e.clientX, e.clientY);
  const handleTouchEnd = (e: React.TouchEvent) => handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
  const handleTouchDrag = (touches: React.TouchList) => {
    if (!graphRef.current) return;
    const [touch] = Array.from(touches),
      prevX = Math.round(Number(graphRef.current.dataset.prevX)),
      prevY = Math.round(Number(graphRef.current.dataset.prevY));
    prevX && prevY && dragStatus.moving && requestAnimationFrame(() => svgRef.current && dragCalculator({ x: touch.clientX - prevX, y: touch.clientY - prevY, svg: svgRef.current }));
    Object.assign(graphRef.current.dataset, { prevX: touch.clientX, prevY: touch.clientY });
  };
  const handleTouchZoom = (touches: React.TouchList) => {
    if (!graphRef.current || !svgRef.current) return;
    const [touch1, touch2] = Array.from(touches),
      x = (touch1.clientX + touch2.clientX) / 2,
      y = (touch1.clientY + touch2.clientY) / 2,
      d = Math.round(Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY)),
      prevD = Math.round(Number(graphRef.current.dataset.prevD));
    prevD && requestAnimationFrame(() => graphRef.current && svgRef.current && zoomCalculator({ clientX: x, clientY: y, graph: graphRef.current, svg: svgRef.current, r: d / prevD }));
    graphRef.current.dataset.prevD = String(d);
  };
  const handleTouchDragZoom = ({ touches }: React.TouchEvent) => (touches.length === 1 ? handleTouchDrag(touches) : handleTouchZoom(touches));
  const handleMouseDrag = ({ movementX, movementY }: React.MouseEvent) => dragStatus.moving && requestAnimationFrame(() => svgRef.current && dragCalculator({ x: movementX, y: movementY, svg: svgRef.current }));
  const handleWheelZoom = ({ clientX, clientY, deltaY }: React.WheelEvent) => requestAnimationFrame(() => graphRef.current && svgRef.current && zoomCalculator({ clientX, clientY, graph: graphRef.current, svg: svgRef.current, r: deltaY > 0 ? 0.95 : deltaY < 0 ? 1.05 : 1 }));
  useEffect(() => {
    setViewBox({ x1: 0, y1: 0, x2: realSize.w, y2: realSize.h });
  }, [realSize.w, realSize.h]);
  return (
    <div className="fp-floormap d-flex align-items-center" style={{ height: height + tagsHeight }}>
      {(category !== "areas" || getSearchParam("edit") === 1) && <Selector graphRef={graphRef} svgRef={svgRef} />}
      <div className={`fp-viewBox ${dragStatus.moving ? "moving" : ""}`} ref={graphRef} onWheel={handleWheelZoom} onMouseDown={handleMouseStart} onMouseUp={handleMouseEnd} onMouseLeave={handleMouseEnd} onMouseMove={handleMouseDrag} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchEnd} onTouchMove={handleTouchDragZoom}>
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
