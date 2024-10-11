import { useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { icon_base64 } from "@icons";
import { getSearchParam } from "@functions";
import store, { setElementStatus, setTooltip, setEditForm, initEditForm } from "@store";

export const Elements = ({ type, size }) => {
  const dispatch = useDispatch();
  const floor = useSelector((state) => state.searchCondition.floor);
  const data = useSelector((state) => state.floorData.filterData).filter((d) => String(d.floor) === floor && d.draw && d.type === type);
  const boothInfo = useSelector((state) => state.elementStatus.boothInfo);
  const boothInfoId = useSelector((state) => state.elementStatus.boothInfoData.id);
  const elementActions = {
    wall: (d, i) => <Wall key={d.id} d={d} />,
    pillar: (d, i) => <Pillar key={d.id} d={d} />,
    text: (d, i) => <Text key={d.id} d={d} />,
    room: (d, i) => <Room key={d.id} d={d} i={i} size={size} handleBoothClick={handleBoothClick} />,
    icon: (d, i) => <Room key={d.id} d={d} i={i} size={size} />,
    booth: (d, i) => <Booth key={d.id} d={d} size={size} handleBoothClick={handleBoothClick} />,
  };
  const handleBoothClick = (d) => {
    if (store.getState().elementStatus.dragStatus.distance !== 0) return;
    dispatch(setElementStatus(boothInfo && boothInfoId === d.id ? { boothInfo: false } : { boothInfo: true, boothInfoData: d }));
    initEditForm({ id: d.id })(dispatch);
  };
  return <g className={`${type}-g`}>{data.map((d, i) => elementActions[type](d, i))}</g>;
};
const drawPath = (path) => path.map((p) => (p.node === "L" ? `${p.node}${p.x} ${p.y}` : `${p.node}${p.x1} ${p.y1} ${p.x2} ${p.y2} ${p.x} ${p.y}`)).join("") + "Z";
const Wall = ({ d }) => <path stroke="black" fill={d.fill} strokeWidth={d.strokeWidth} d={`M${d.x} ${d.y}${drawPath(d.p)}`} />;
const Pillar = ({ d }) => <path fill="rgba(0, 0, 0, 0.2)" d={`M${d.x} ${d.y}${drawPath(d.p.map((p) => ({ node: p.node, x: p.x + d.x, y: p.y + d.y })))}`} />;
const Text = ({ d }) => (
  <text textAnchor="middle" fontWeight="bold" fill={d.color} fontSize={400 * d.size} x={d.x} y={d.y}>
    {d.text.replace("\n", "")}
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
      <g transform={`translate(${d.w / 2},${d.h / 2 - ((d.text.split("\n").length - 1) * lineHeight) / 2})`} fontSize={fontSize}>
        {d.text.split("\n").map((t, j) => (
          <text key={`text-${i}-${j}`} textAnchor="middle" fontWeight="bold" fill="black" fillOpacity={d.opacity} y={j * lineHeight}>
            {t}
          </text>
        ))}
      </g>
      {d.icon.length > 0 && (
        <>
          <clipPath id={`${d.type}-${d.floor}-${i}`}>
            <rect className="icon" width={icon_l} height={icon_l} x={(d.w - icon_l) / 2} y={(d.h - icon_l) / 2} />
          </clipPath>
          <image width={icon_l} height={icon_l} x={(d.w - icon_l) / 2} y={(d.h - icon_l) / 2} visibility="visible" clipPath={`url(#icon-${d.floor}-${i})`} xlinkHref={icon_base64[d.icon]} opacity={1} />
        </>
      )}
    </g>
  );
};
const Booth = ({ d, size, handleBoothClick }) => {
  const dispatch = useDispatch();
  const boothInfo = useSelector((state) => state.elementStatus.boothInfo);
  const boothInfoId = useSelector((state) => state.elementStatus.boothInfoData.id);
  const colors = useSelector((state) => state.elementStatus.colors);
  const width = useSelector((state) => state.tooltip.width);
  const margin = useSelector((state) => state.tooltip.margin);
  const booths = useSelector((state) => state.editForm.booths);
  const edit = getSearchParam("edit") === 1;
  const selected = edit && boothInfo && booths?.includes(d.id);
  const textShift = { x: d?.shift?.x || 0, y: d?.shift?.y || 0 };
  const opacity = boothInfo && boothInfoId === d.id ? 1 : d.opacity;
  const { category } = useParams();
  const handleBoothSelected = ({ ctrlKey, shiftKey }) => {
    const prev = store.getState().editForm.booths || [];
    ctrlKey && dispatch(setEditForm({ booths: prev.includes(d.id) ? prev : [...prev, d.id] }));
    shiftKey && dispatch(setEditForm({ booths: prev.filter((select) => select !== d.id) }));
  };
  const handleAreaPage = ({ clientX, clientY }) => {
    const isLeft = clientX < window.innerWidth / 2;
    const x = isLeft ? clientX + margin : clientX - width - margin;
    dispatch(setTooltip({ x: x, y: clientY }));
  };
  const handleMouseMove = (e) => {
    edit && boothInfo && (e.ctrlKey || e.shiftKey) && handleBoothSelected(e);
    category === "areas" && handleAreaPage(e);
  };
  const handleClick = () => handleBoothClick(d);
  const activeTooltip = () => dispatch(setTooltip({ id: `No. ${d.id}`, cat: d.cat, text: d.text.replace("\n", ""), active: true }));
  const initialTooltip = () => dispatch(setTooltip({ id: "", cat: "", text: "", active: false }));
  return (
    <g key={d.id} id={d.id} className={`booth ${opacity === 1 ? "active" : ""}`} transform={`translate(${d.x},${d.y})`} onClick={handleClick} onMouseMove={handleMouseMove} onMouseEnter={activeTooltip} onMouseLeave={initialTooltip}>
      <path stroke={selected ? "rgb(207, 97, 97)" : "black"} fill={selected ? "rgb(207, 97, 97)" : colors.scale(d.cat)} strokeWidth={selected ? 5 : 1} fillOpacity={opacity} d={`M0 0${drawPath(d.p)}`} />
      <BoothTextGroup d={d} size={size} textShift={textShift} opacity={opacity} />
      <text className="booth-id" fill="black" fillOpacity={opacity} fontSize={size * 0.3} x={20 + textShift.x} y={d.h - 20 + textShift.y}>
        {d.id}
      </text>
    </g>
  );
};
const BoothTextGroup = ({ d, size, textShift, opacity }) => {
  const boothInfoId = useSelector((state) => state.elementStatus.boothInfoData.id);
  const lang = useSelector((state) => state.searchCondition.lang);
  const editSize = useSelector((state) => state.editForm?.size?.[lang]);
  const fontSize = size * (boothInfoId === d.id ? editSize || d.size : d.size);
  const lineHeight = fontSize * 1.2;
  return (
    <g transform={`translate(${d.w / 2 + textShift.x},${d.h / 2 - ((d.text.split("\n").length - 1) * lineHeight) / 2 + textShift.y})`} fontSize={fontSize}>
      {d.text.split("\n").map((t, j) => (
        <BoothText key={`${d.id}-${t}-${j}`} t={t} j={j} lineHeight={lineHeight} fontSize={fontSize} opacity={opacity} boothWidth={d.w} />
      ))}
    </g>
  );
};
const BoothText = ({ t, j, lineHeight, fontSize, opacity, boothWidth }) => {
  const textRef = useRef();
  const getTextWidth = useCallback(() => {
    textRef.current.textContent = t;
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
    getTextWidth();
  }, [t, fontSize]);
  return <text key={`key-${j}`} ref={textRef} textAnchor="middle" fontWeight="bold" fill="black" fillOpacity={opacity} y={j * lineHeight} />;
};
