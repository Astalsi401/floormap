import { useSelector, useDispatch } from "react-redux";
import { setElementStatus } from "@store";
import { getSearchParam } from "@functions";
import { BoothName, SelectedBooths, SelectedCategory, SelectedSave, FontSize } from "./edit";
import { BoothTags, BoothCoprs, BoothDescribe, BoothEvents } from "./normal";

export const BoothInfo = () => {
  const dispatch = useDispatch();
  const boothInfo = useSelector((state) => state.elementStatus.boothInfo);
  return (
    <div className={`fp-booth-info ${boothInfo ? "active" : ""}`}>
      <div className="fp-back-btn shadow" onClick={() => dispatch(setElementStatus({ boothInfo: false }))}>
        <div className="fp-back d-flex align-items-center justify-content-center mx-auto active">
          <span />
        </div>
      </div>
      {boothInfo && <BoothInfoDetail />}
    </div>
  );
};

const BoothInfoDetail = () => {
  const types = useSelector((state) => state.types);
  const data = useSelector((state) => state.floorData.filterData).filter((d) => types.includes(d.type));
  const boothInfoData = useSelector((state) => state.elementStatus.boothInfoData);
  const { type, text, org, id, floor, cat, topic, tag, info, event, note, corpId } = boothInfoData;
  const isEdit = getSearchParam("edit") === 1;
  const isHost = corpId ? corpId.endsWith("-0") : true;
  const isBooth = type === "booth";
  const loc = isBooth ? [cat, topic] : [note];
  const tags = Object.keys(boothInfoData).length === 0 ? [] : [...loc, ...tag].filter((d) => d !== "");
  const booth = data.find((d) => d.id === id);
  const corps = booth && booth.corps ? booth.corps : [];
  const events = event.filter((d) => d.title !== "");
  return (
    <div className="fp-info pb-5">
      <div className="fp-info-item d-flex align-items-center px-2 py-1">
        {isBooth && isEdit && isHost ? <BoothName className="fp-result-item-name text-x-large text-bold" name="text" value={text} placeholder="請輸入單位簡稱" /> : <div className="fp-result-item-name text-x-large text-bold">{text.join("")}</div>}
        <div className="fp-result-item-loc text-small">{isBooth ? `${id} / ${floor}F` : `${floor}F`}</div>
      </div>
      <div className="p-2 text-large">{org}</div>
      {isBooth && isEdit && isHost && <FontSize id={id} />}
      {isBooth && isEdit && isHost && <SelectedBooths />}
      {isBooth && isEdit && isHost && <SelectedCategory />}
      {!isEdit && <BoothTags tags={tags} corpId={corpId} />}
      {corps.length > 1 && <BoothCoprs corps={corps} corpId={corpId} data={data} />}
      {info && <BoothDescribe info={info} corpId={corpId} />}
      {events.length > 0 && <BoothEvents events={events} />}
      {isEdit && <SelectedSave id={id} />}
    </div>
  );
};
