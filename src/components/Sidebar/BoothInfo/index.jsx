import { useSelector, useDispatch } from "react-redux";
import store, { setElementStatus } from "@store";
import { getSearchParam } from "@functions";
import { BoothText, FontSize, SelectedBooths, SelectedCategory, SaveBtn } from "./edit";
import { BoothTags, BoothCoprs, CorpDescribe, BoothEvents } from "./normal";

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
  const data = useSelector((state) => state.floorData.filterData).filter((d) => store.getState().types.includes(d.type));
  const boothInfoData = useSelector((state) => state.elementStatus.boothInfoData);
  const corps = useSelector((state) => state.editForm.corps);
  const { type, text, org, id, floor, cat, topic, tag, info, event, note, corpId } = boothInfoData;
  const isEdit = getSearchParam("edit") === 1;
  const isHost = corpId ? corpId.endsWith("-0") : true;
  const isBooth = type === "booth";
  const loc = isBooth ? [cat, topic] : [note];
  const tags = Object.keys(boothInfoData).length === 0 ? [] : [...loc, ...tag].filter((d) => d !== "");
  const events = event.filter((d) => d.title !== "");
  return (
    <div className="fp-info pb-5">
      <div className="fp-info-item d-flex align-items-center px-2 py-1">
        {isBooth && isEdit && isHost ? <BoothText className="fp-result-item-name text-x-large text-bold" name="text" value={text} placeholder="請輸入單位簡稱" /> : <div className="fp-result-item-name text-x-large text-bold">{text.replace("\n", "")}</div>}
        <div className="fp-result-item-loc text-small">{isBooth ? `${id} / ${floor}F` : `${floor}F`}</div>
      </div>
      {isBooth && isEdit && corps.length > 0 ? <BoothText className="p-2 text-large" name="org" value={org} placeholder="請輸入單位全名" corpId={corpId} /> : <div className="p-2 text-large">{org}</div>}
      {isBooth && isEdit && isHost && <FontSize id={id} />}
      {isBooth && isEdit && isHost && <SelectedBooths id={id} />}
      {isBooth && isEdit && isHost && <SelectedCategory />}
      {!isEdit && <BoothTags tags={tags} corpId={corpId} />}
      <BoothCoprs id={id} corps={corps} corpId={corpId} data={data} />
      {isBooth && isEdit && corps.length > 0 ? <BoothText className="p-2 text-small" name="info" value={info} placeholder="請輸入簡介" corpId={corpId} /> : info && <CorpDescribe info={info} corpId={corpId} />}
      {events.length > 0 && <BoothEvents events={events} />}
      {isEdit && <SaveBtn id={id} />}
    </div>
  );
};
