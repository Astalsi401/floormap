import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { icon_base64, icon_colors } from "@icons";
import { getSearchParam } from "@functions";
import store, { setElementStatus, setTooltip, setEditForm, initEditForm, useAppDispatch, useAppSelector } from "@store";
import { FilterBooth, FilterPillar, FilterRoom, FilterText, FilterWall, PathType, ResPillar, ResWall } from "@types";

export const Elements: React.FC<{ type: string; size?: number }> = ({ type, size = 200 }) => {
  const dispatch = useAppDispatch();
  const floor = useAppSelector((state) => state.searchCondition.floor);
  const data = useAppSelector((state) => state.floorData.filterData).filter((d) => String(d.floor) === floor && d.draw && d.type === type);
  const boothInfo = useAppSelector((state) => state.elementStatus.boothInfo);
  const boothInfoId = useAppSelector((state) => state.elementStatus.boothInfoData.id);

  const elementActions: {
    wall: ({ d, i }: { d: FilterWall; i?: number }) => JSX.Element;
    pillar: ({ d, i }: { d: FilterPillar; i?: number }) => JSX.Element;
    text: ({ d, i }: { d: FilterText; i?: number }) => JSX.Element;
    room: ({ d, i }: { d: FilterRoom; i?: number }) => JSX.Element;
    icon: ({ d, i }: { d: FilterRoom; i?: number }) => JSX.Element;
    booth: ({ d, i }: { d: FilterBooth; i?: number }) => JSX.Element;
    [key: string]: ({ d, i }: { d: any; i?: number }) => JSX.Element;
  } = {
    wall: ({ d }) => <Wall key={d.id} d={d} />,
    pillar: ({ d }) => <Pillar key={d.id} d={d} />,
    text: ({ d }) => <Text key={d.id} d={d} />,
    room: ({ d, i }) => <Room key={d.id} d={d} i={i || 0} size={size} handleBoothClick={handleBoothClick} />,
    icon: ({ d, i }) => <Room key={d.id} d={d} i={i || 0} size={size} />,
    booth: ({ d, i }) => <Booth key={d.id} d={d} i={i || 0} size={size} handleBoothClick={handleBoothClick} />,
  };
  const handleBoothClick = (d: FilterBooth | FilterRoom) => {
    if (store.getState().elementStatus.dragStatus.distance !== 0) return;
    dispatch(setElementStatus(boothInfo && boothInfoId === d.id ? { boothInfo: false } : { boothInfo: true, boothInfoData: d }));
    initEditForm({ id: d.id })(dispatch);
  };
  return <g className={`${type}-g`}>{data.map((d, i) => elementActions[type]({ d, i }))}</g>;
};
const drawPath = (path: PathType[]) => path.map((p) => (p.node === "L" ? `${p.node}${p.x} ${p.y}` : `${p.node}${p.x1} ${p.y1} ${p.x2} ${p.y2} ${p.x} ${p.y}`)).join("") + "Z";
const Wall: React.FC<{ d: ResWall }> = ({ d }) => <path stroke="black" fill={d.fill} strokeWidth={d.strokeWidth} d={`M${d.x} ${d.y}${drawPath(d.p)}`} />;
const Pillar: React.FC<{ d: ResPillar }> = ({ d }) => <path fill="rgba(0, 0, 0, 0.2)" d={`M${d.x} ${d.y}${drawPath(d.p.map((p) => ({ node: p.node, x: p.x + d.x, y: p.y + d.y })))}`} />;
const Text: React.FC<{ d: { x: number; y: number; text: string; color: string; size: number } }> = ({ d }) => (
  <g>
    {d.text.split("\n").map((t, j) => (
      <text key={`text-${j}`} textAnchor="middle" fontWeight="bold" fill={d.color} fontSize={400 * d.size} x={d.x} y={d.y + 400 * d.size * j}>
        {t}
      </text>
    ))}
  </g>
);
type RoomProps = { d: FilterRoom; i: number; size: number; handleBoothClick?: (d: FilterRoom) => void };
const Room: React.FC<RoomProps> = ({ d, i, size, handleBoothClick }) => {
  const boothInfo = useAppSelector((state) => state.elementStatus.boothInfo);
  const boothInfoData = useAppSelector((state) => state.elementStatus.boothInfoData);
  const fontSize = size * d.size;
  const lineHeight = fontSize * 1.2;
  const icon_l = 500;
  const opacity = d.type === "room" && boothInfo && boothInfoData.id === d.id ? 1 : d.opacity;
  return (
    <g className={`${d.type}${opacity === 1 ? " active" : ""}`} transform={`translate(${d.x},${d.y})`} onClick={handleBoothClick ? () => handleBoothClick(d) : undefined}>
      <path stroke={"black"} strokeWidth={d.strokeWidth} fill={d.text.length === 0 || d.type === "icon" ? "none" : "#f1f1f1"} fillOpacity={d.opacity} d={`M0 0${drawPath(d.p)}`} />
      <g transform={`translate(${d.w / 2},${d.h / 2 - ((d.text.split("\n").length - 1) * lineHeight) / 2})`} fontSize={fontSize}>
        {d.text.split("\n").map((t, j) => (
          <text key={`text-${i}-${j}`} textAnchor="middle" fontWeight="bold" fill="black" fillOpacity={d.opacity} y={j * lineHeight}>
            {t}
          </text>
        ))}
      </g>
      {d?.icon && d.icon.length > 0 && (
        <>
          <clipPath id={`${d.type}-${d.floor}-${i}`}>
            <rect className="icon" width={icon_l} height={icon_l} x={(d.w - icon_l) / 2} y={(d.h - icon_l) / 2} />
          </clipPath>
          <image width={icon_l} height={icon_l} x={(d.w - icon_l) / 2} y={(d.h - icon_l) / 2} visibility="visible" clipPath={`url(#icon-${d.floor}-${i})`} style={{ filter: icon_colors[d.icon] }} xlinkHref={icon_base64[d.icon]} opacity={1} />
        </>
      )}
    </g>
  );
};
type BoothProps = { d: FilterBooth; i: number; size: number; handleBoothClick: (d: FilterBooth) => void };
const Booth: React.FC<BoothProps> = ({ d, i, size, handleBoothClick }) => {
  const dispatch = useAppDispatch();
  const boothInfo = useAppSelector((state) => state.elementStatus.boothInfo);
  const boothInfoId = useAppSelector((state) => state.elementStatus.boothInfoData.id);
  const colors = useAppSelector((state) => state.elementStatus.colors);
  const width = useAppSelector((state) => state.tooltip.width);
  const margin = useAppSelector((state) => state.tooltip.margin);
  const { category } = useParams();
  const edit = getSearchParam("edit") === 1;
  const [selected, setSelected] = useState(false);
  const textShift = { x: d?.shift?.x || 0, y: d?.shift?.y || 0 };
  const opacity = boothInfo && boothInfoId === d.id ? 1 : d.opacity;
  const icon_l = Math.min(d.w, d.h);
  const hasIcon = d?.icon && d.icon.length > 0;
  const handleBoothSelected = ({ ctrlKey, shiftKey }: React.MouseEvent) => {
    const prev = store.getState().editForm.booths || [];
    if (ctrlKey) {
      dispatch(setEditForm({ booths: prev.includes(d.id) ? prev : [...prev, d.id] }));
      setSelected(true);
    }
    if (shiftKey) {
      dispatch(setEditForm({ booths: prev.filter((select) => select !== d.id || select === boothInfoId) }));
      setSelected(false);
    }
  };
  const handleAreaPage = ({ clientX, clientY }: React.MouseEvent) => {
    const isLeft = clientX < window.innerWidth / 2;
    const x = isLeft ? clientX + margin : clientX - width - margin;
    dispatch(setTooltip({ x, y: clientY }));
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    edit && boothInfo && (e.ctrlKey || e.shiftKey) && handleBoothSelected(e);
    category === "areas" && !edit && handleAreaPage(e);
  };
  const handleClick = () => handleBoothClick(d);
  const activeTooltip = () => dispatch(setTooltip({ id: `No. ${d.id}`, cat: d.cat, text: d.text.replace("\n", ""), active: true }));
  const initialTooltip = () => dispatch(setTooltip({ id: "", cat: "", text: "", active: false }));
  useEffect(() => setSelected(edit && boothInfo && store.getState().editForm.booths?.includes(d.id)), [edit, boothInfoId]);
  return (
    <g key={d.id} id={d.id} className={`booth ${opacity === 1 ? "active" : ""}`} transform={`translate(${d.x},${d.y})`} onClick={handleClick} onMouseMove={handleMouseMove} onMouseEnter={activeTooltip} onMouseLeave={initialTooltip}>
      <path stroke={selected && boothInfo ? "rgb(207, 97, 97)" : "black"} fill={selected && boothInfo ? "rgb(207, 97, 97)" : colors.scale(d.cat)} strokeWidth={selected && boothInfo ? 5 : 1} fillOpacity={opacity} d={`M0 0${drawPath(d.p)}`} />
      <BoothTextGroup d={d} size={size} textShift={textShift} opacity={opacity} />
      {hasIcon && (
        <>
          <clipPath id={`${d.type}-${d.floor}-${i}`}>
            <rect className="icon" width={icon_l} height={icon_l} x={(d.w - icon_l) / 2} y={(d.h - icon_l) / 2} />
          </clipPath>
          <image width={icon_l} height={icon_l} x={(d.w - icon_l) / 2} y={(d.h - icon_l) / 2} visibility="visible" clipPath={`url(#icon-${d.floor}-${i})`} style={{ filter: icon_colors[d.icon] }} xlinkHref={icon_base64[d.icon]} opacity={1} />
        </>
      )}
      {!hasIcon && (
        <text className="booth-id" fill="black" fillOpacity={opacity} fontSize={size * 0.3} x={20 + textShift.x} y={d.h - 20 + textShift.y}>
          {d.id}
        </text>
      )}
    </g>
  );
};
const BoothTextGroup: React.FC<{ d: FilterBooth; size: number; textShift: { x: number; y: number }; opacity: number }> = ({ d, size, textShift, opacity }) => {
  const boothInfoId = useAppSelector((state) => state.elementStatus.boothInfoData.id);
  const lang = useAppSelector((state) => state.searchCondition.lang);
  const editSize = useAppSelector((state) => state.editForm?.size?.[lang]);
  const editText = useAppSelector((state) => state.editForm?.text?.[lang]);
  const fontSize = size * (boothInfoId === d.id ? editSize || d.size : d.size);
  const lineHeight = fontSize * 1.2;
  const boothText = boothInfoId === d.id ? editText || d.text : d.text;
  return (
    <g transform={`translate(${d.w / 2 + textShift.x},${d.h / 2 - ((boothText.split("\n").length - 1) * lineHeight) / 2 + textShift.y})`} fontSize={fontSize}>
      {boothText.split("\n").map((t, j) => (
        <BoothText key={`${d.id}-${t}-${j}`} t={t} j={j} lineHeight={lineHeight} fontSize={fontSize} opacity={opacity} boothWidth={d.w} />
      ))}
    </g>
  );
};
const BoothText: React.FC<{ t: string; j: number; lineHeight: number; fontSize: number; opacity: number; boothWidth: number }> = ({ t, j, lineHeight, fontSize, opacity, boothWidth }) => {
  const textRef = useRef<null | SVGTextElement>(null);
  const getTextWidth = useCallback(() => {
    if (!textRef.current) return;
    textRef.current.textContent = t;
    let self = textRef.current,
      textLength = self.getComputedTextLength(),
      txt = self.textContent || "";
    while (textLength > boothWidth && txt.length > 0) {
      txt = txt.slice(0, -1);
      self.textContent = txt + "\u2026";
      textLength = self.getComputedTextLength();
    }
    return txt;
  }, [t, fontSize, boothWidth]);
  useEffect(() => {
    getTextWidth();
  }, [t, fontSize]);
  return <text key={`key-${j}`} ref={textRef} textAnchor="middle" fontWeight="bold" fill="black" fillOpacity={opacity} y={j * lineHeight} />;
};
