import { useEffect, useRef, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { icon_base64 } from "../components/icons";
import { setElementStatus, setTooltip } from "../assets/store";

export function Elements({ type, size }) {
  const dispatch = useDispatch();
  const floor = useSelector((state) => state.searchCondition.floor);
  const data = useSelector((state) => state.floorData.filterData).filter((d) => d.floor === floor && d.draw);
  const distance = useSelector((state) => state.elementStatus.dragStatus.distance);
  const boothInfo = useSelector((state) => state.elementStatus.boothInfo);
  const boothInfoData = useSelector((state) => state.elementStatus.boothInfoData);
  const elementActions = {
    wall: (d, i) => <Wall key={d.id} d={d} />,
    pillar: (d, i) => <Pillar key={d.id} d={d} />,
    text: (d, i) => <Text key={d.id} d={d} />,
    room: (d, i) => <Room key={d.id} d={d} i={i} size={size} handleBoothClick={handleBoothClick} />,
    icon: (d, i) => <Room key={d.id} d={d} i={i} size={size} />,
    booth: (d, i) => <Booth key={d.id} d={d} size={size} handleBoothClick={handleBoothClick} />,
  };
  const handleBoothClick = (d) => {
    if (distance !== 0) return;
    if (boothInfo && boothInfoData.id === d.id) {
      dispatch(setElementStatus({ boothInfo: false }));
    } else {
      dispatch(setElementStatus({ boothInfo: true, boothInfoData: d }));
    }
  };
  return <g className={`${type}-g`}>{data.filter((d) => d.type === type).map((d, i) => elementActions[type](d, i))}</g>;
}

const drawPath = (path) => path.map((p) => (p.node === "L" ? `${p.node}${p.x} ${p.y}` : `${p.node}${p.x1} ${p.y1} ${p.x2} ${p.y2} ${p.x} ${p.y}`)).join("") + "Z";
const Wall = ({ d }) => <path stroke="black" fill={d.fill} strokeWidth={d.strokeWidth} d={`M${d.x} ${d.y}${drawPath(d.p)}`} />;
const Pillar = ({ d }) => {
  const path = d.p.map((p) => ({ node: p.node, x: p.x + d.x, y: p.y + d.y }));
  return <path fill="rgba(0, 0, 0, 0.2)" d={`M${d.x} ${d.y}${drawPath(path)}`} />;
};
const Text = ({ d }) => (
  <text textAnchor="middle" fontWeight="bold" fill={d.color} fontSize={400 * d.size} x={d.x} y={d.y}>
    {d.text.join("")}
  </text>
);
const Room = ({ d, i, size, handleBoothClick }) => {
  const boothInfo = useSelector((state) => state.elementStatus.boothInfo);
  const boothInfoData = useSelector((state) => state.elementStatus.boothInfoData);
  const fontSize = size * d.size;
  const lineHeight = fontSize * 1.2;
  const icon_l = 500;
  const opacity = d.type === "room" && boothInfo && boothInfoData.id === d.id ? 1 : d.opacity;
  return (
    <g className={`${d.type}${opacity === 1 ? " active" : ""}`} transform={`translate(${d.x},${d.y})`} onClick={d.type === "room" ? () => handleBoothClick(d) : null}>
      <path stroke={"black"} strokeWidth={d.strokeWidth} fill={d.text.length === 0 || d.type === "icon" ? "none" : "#f1f1f1"} fillOpacity={d.opacity} d={`M0 0${drawPath(d.p)}`} />
      <g transform={`translate(${d.w / 2},${d.h / 2 - ((d.text.length - 1) * lineHeight) / 2})`} fontSize={fontSize}>
        {d.text.map((t, j) => (
          <text key={`text-${i}-${j}`} textAnchor="middle" fontWeight="bold" fill="black" fillOpacity={d.opacity} y={j * lineHeight}>
            {t}
          </text>
        ))}
      </g>
      {d.icon.length > 0 ? (
        <>
          <clipPath id={`${d.type}-${d.floor}-${i}`}>
            <rect className="icon" width={icon_l} height={icon_l} x={(d.w - icon_l) / 2} y={(d.h - icon_l) / 2} />
          </clipPath>
          <image width={icon_l} height={icon_l} x={(d.w - icon_l) / 2} y={(d.h - icon_l) / 2} visibility="visible" clipPath={`url(#icon-${d.floor}-${i})`} xlinkHref={icon_base64[d.icon]} opacity={d.opacity} />
        </>
      ) : (
        <></>
      )}
    </g>
  );
};
const BoothText = ({ t, j, lineHeight, opacity, boothWidth }) => {
  const textRef = useRef();
  const [text, setText] = useState(t);
  const getTextWidth = useCallback(() => {
    let self = textRef.current,
      textLength = self.getComputedTextLength(),
      txt = self.textContent;
    while (textLength > boothWidth && txt.length > 0) {
      txt = txt.slice(0, -1);
      self.textContent = txt + "\u2026";
      textLength = self.getComputedTextLength();
    }
    return txt;
  });
  useEffect(() => {
    setText(t);
  }, [t]);
  useEffect(() => {
    getTextWidth();
  }, [text]);
  return (
    <text key={`key-${j}`} ref={textRef} textAnchor="middle" fontWeight="bold" fill="black" fillOpacity={opacity} y={j * lineHeight}>
      {text}
    </text>
  );
};

const Booth = ({ d, size, handleBoothClick }) => {
  const dispatch = useDispatch();
  const boothInfo = useSelector((state) => state.elementStatus.boothInfo);
  const boothInfoData = useSelector((state) => state.elementStatus.boothInfoData);
  const colors = useSelector((state) => state.elementStatus.colors);
  const fontSize = size * d.size;
  const lineHeight = fontSize * 1.2;
  const opacity = boothInfo && boothInfoData.id === d.id ? 1 : d.opacity;
  const { category } = useParams();
  const handleAreaPage = ({ clientX, clientY }) => {
    if (category !== "areas") return;
    const tooltipWidth = 200;
    const margin = 20;
    const isLeft = clientX < window.innerWidth / 2;
    const x = isLeft ? clientX + margin : clientX - tooltipWidth - margin;
    dispatch(setTooltip({ x: x, y: clientY }));
  };
  return (
    <g key={d.id} id={d.id} className={`booth ${opacity === 1 ? "active" : ""}`} transform={`translate(${d.x},${d.y})`} onClick={() => handleBoothClick(d)} onPointerMove={handleAreaPage} onPointerEnter={() => dispatch(setTooltip({ id: `No. ${d.id}`, cat: d.cat, active: true }))} onPointerLeave={() => dispatch(setTooltip({ id: "", cat: "", active: false }))}>
      <path stroke={"black"} fill={colors.scale(d.cat)} strokeWidth={1} fillOpacity={opacity} d={`M0 0${drawPath(d.p)}`} />;
      <g transform={`translate(${d.w / 2},${d.h / 2 - ((d.text.length - 1) * lineHeight) / 2})`} fontSize={fontSize}>
        {d.text.map((t, j) => (
          <BoothText key={`${d.id}-${t}-${j}`} t={t} j={j} lineHeight={lineHeight} opacity={opacity} boothWidth={d.w} />
        ))}
      </g>
      <text className="booth-id" fill="black" fillOpacity={opacity} fontSize={size * 0.3} x={20} y={d.h - 20}>
        {d.id}
      </text>
    </g>
  );
};
