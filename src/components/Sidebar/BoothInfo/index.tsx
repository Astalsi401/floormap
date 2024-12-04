import store, { setElementStatus, METHOD, useAppDispatch, useAppSelector } from "@store";
import { getSearchParam } from "@functions";
import { BoothText, FontSize, SelectedBooths, SelectedCategory, SaveBtn, ResetBtn } from "./edit";
import { BoothTags, BoothCoprs, CorpDescribe, BoothEvents } from "./normal";
import { FilterBooth, FilterRoom } from "@types";

export const BoothInfo: React.FC = () => {
  const dispatch = useAppDispatch();
  const boothInfo = useAppSelector((state) => state.elementStatus.boothInfo);
  const handleBackBtnClick = () => dispatch(setElementStatus({ boothInfo: false }));
  return (
    <div className={`fp-booth-info ${boothInfo ? "active" : ""}`}>
      <div className="fp-back-btn shadow" onClick={handleBackBtnClick}>
        <div className="fp-back d-flex align-items-center justify-content-center mx-auto active">
          <span />
        </div>
      </div>
      <BoothInfoDetail />
    </div>
  );
};

const BoothInfoDetail: React.FC = () => {
  const data = useAppSelector((state) => state.floorData.filterData).filter((d) => store.getState().types.includes(d.type)) as FilterBooth[] | FilterRoom[];
  const boothInfoData = useAppSelector((state) => state.elementStatus.boothInfoData);
  const corps = useAppSelector((state) => state.editForm.corps);
  const { type, text, org, id, floor, cat, topic, tag, info, event, corpId } = boothInfoData;
  const isEdit = getSearchParam("edit") === 1;
  const isBooth = type === "booth";
  const loc = [cat, topic];
  const tags = Object.keys(boothInfoData).length === 0 ? [] : [...loc, ...tag].filter((d) => d !== "");
  const events = event?.filter((d) => d.title !== "");
  return (
    <div className="fp-info pb-5">
      <div className="fp-info-item d-flex align-items-center px-2 py-1">
        {isBooth && isEdit ? <BoothText className="fp-result-item-name text-x-large text-bold" name="text" value={text} placeholder="請輸入單位簡稱" /> : <div className="fp-result-item-name text-x-large text-bold">{text?.replace(/\n/g, "")}</div>}
        <div className="fp-result-item-loc text-small">{isBooth ? `${id} / ${floor}F` : `${floor}F`}</div>
      </div>
      {isBooth && isEdit && corps.length > 0 ? <BoothText className="p-2 text-large" name="org" value={org} placeholder="請輸入單位全名" corpId={corpId} /> : <div className="p-2 text-large">{org}</div>}
      {isBooth && isEdit && (
        <>
          <FontSize />
          <SelectedBooths id={id} />
          <SelectedCategory />
        </>
      )}
      {!isEdit && <BoothTags tags={tags} corpId={corpId || ""} />}
      <BoothCoprs id={id} corps={corps} corpId={corpId || ""} data={data} />
      {isBooth && isEdit && corps.length > 0 ? <BoothText className="p-2 text-small" name="info" value={info} placeholder="請輸入簡介" corpId={corpId} /> : info && <CorpDescribe info={info} corpId={corpId || ""} />}
      {events && events.length > 0 && <BoothEvents events={events} />}
      {isEdit && (
        <>
          <SaveBtn id={id} meth={METHOD.POST} />
          <ResetBtn id={id} />
          <SaveBtn className="btn-delete" id={id} meth={METHOD.DELETE} />
        </>
      )}
    </div>
  );
};
