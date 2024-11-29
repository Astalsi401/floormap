import { useAppSelector } from "@store";
import "@styles/elements/tooltip.scss";

export const Tooltip: React.FC = () => {
  const { id, cat, text, x, y, active, width } = useAppSelector((state) => state.tooltip);
  const numOfBooths = useAppSelector((state) => state.mapText.numOfBooths);
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
