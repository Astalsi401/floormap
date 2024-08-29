import { useSelector } from "react-redux";
import "@styles/elements/tooltip.scss";

export const Tooltip = () => {
  const { id, cat, text, x, y, active, width } = useSelector((state) => state.tooltip);
  const numOfBooths = useSelector((state) => state.mapText.numOfBooths);
  return (
    <div className={`tooltip p-1 position-absolute shadow text-center text-bold ${active ? "d-block" : "d-none"}`} style={{ width: width, left: x, top: y }}>
      {id}
      <br />
      {cat}
      <br />
      {numOfBooths}: {text}
    </div>
  );
};
