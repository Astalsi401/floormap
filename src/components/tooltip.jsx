import { useSelector } from "react-redux";
import "../assets/styles/elements/tooltip.scss";

export function Tooltip() {
  const { id, cat, x, y, active } = useSelector((state) => state.tooltip);
  return (
    <div className={`tooltip position-absolute shadow text-center p-1 ${active ? "d-block" : "d-none"}`} style={{ width: 200, left: x, top: y }}>
      {id}
      <br />
      {cat}
    </div>
  );
}
