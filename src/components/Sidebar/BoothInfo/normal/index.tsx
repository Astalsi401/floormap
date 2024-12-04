import { useState } from "react";
import store, { setSearchCondition, setElementStatus, initEditForm, useAppDispatch, useAppSelector } from "@store";
import { getSearchParam } from "@functions";
import { AddCorp } from "../edit";
import type { FilterBooth, FilterEvent, FilterRoom, OriginalCorp } from "@types";

export const BoothTags: React.FC<{ tags: string[]; corpId: string }> = ({ tags, corpId }) => {
  const dispatch = useAppDispatch();
  const colors = useAppSelector((state) => state.elementStatus.colors);
  const handleTagClick = (value: string) => {
    dispatch(setSearchCondition({ tag: value, string: "" }));
    dispatch(setElementStatus({ boothInfo: false }));
  };
  return (
    <div className="fp-booth-tags d-flex flex-wrap p-2">
      {tags.map((tag) => (
        <div key={`BoothInfoDetail-${corpId}-${tag}`} className="fp-input-tag shadow text-small" style={{ "--cat": colors.scale(tag) } as React.CSSProperties} onClick={() => handleTagClick(tag)}>
          {tag}
        </div>
      ))}
    </div>
  );
};

export const BoothCoprs: React.FC<{ id: string; corps: OriginalCorp[]; corpId: string; data: FilterBooth[] | FilterRoom[] }> = ({ id, corps, corpId, data }) => {
  const isEdit = getSearchParam("edit") === 1;
  const dispatch = useAppDispatch();
  const exhibitor = useAppSelector((state) => state.mapText.exhibitor);
  const colors = useAppSelector((state) => state.elementStatus.colors);
  const currentCorps = isEdit ? useAppSelector((state) => state.editForm.corps) : corps;
  const lang = useAppSelector((state) => state.searchCondition.lang);
  const handleCorpClick = ({ currentCorpId }: { currentCorpId: string }) => {
    if (currentCorpId.endsWith("-add")) {
      dispatch(setElementStatus({ boothInfoData: { ...store.getState().elementStatus.boothInfoData, corpId: currentCorpId, org: "", info: "" } }));
    } else {
      dispatch(setElementStatus({ boothInfoData: data.find((d) => d.corpId === currentCorpId) }));
      initEditForm({ id })(dispatch);
    }
  };
  return (
    <div className="p-2">
      {currentCorps.length > 0 && <div className="my-1 text-large">{exhibitor}</div>}
      <div className="my-1 fp-booth-tags d-flex flex-wrap">
        {currentCorps.map((d) => (
          <div key={`BoothInfoDetail-${d.corpId}`} className="fp-input-tag shadow text-small" style={{ "--cat": d.corpId === corpId ? "rgb(0, 0, 128, 0.3)" : colors.scale("") } as React.CSSProperties} onClick={() => handleCorpClick({ currentCorpId: d.corpId })}>
            {d.org[lang]}
          </div>
        ))}
        {isEdit && <AddCorp />}
      </div>
    </div>
  );
};

export const CorpDescribe: React.FC<{ info: string; corpId: string }> = ({ info, corpId }) => (
  <div className="p-2 text-small">
    {info.split("\n").map((d, i) => (
      <div key={`BoothInfoDetail-describe-${corpId}-${d}-${i}`}>{d}</div>
    ))}
  </div>
);

export const BoothEvents: React.FC<{ events: FilterEvent[] }> = ({ events }) => {
  const activity = useAppSelector((state) => state.mapText.activity);
  return (
    <div className="p-2">
      <div className="my-1 text-large">{activity}</div>
      <div className="my-1">
        {events.map((d, i) => (
          <Event key={`BoothInfoDetail-event-${d.title}-${i}`} {...d} />
        ))}
      </div>
    </div>
  );
};

const Event: React.FC<FilterEvent> = ({ timeList, title, topic, active }) => {
  const [showEventInfo, setShowEventInfo] = useState(false);
  const format = (datetime: number) => (Array(2).join("0") + datetime).slice(-2);
  return (
    <div className={`fp-event my-1 p-1 ${active ? "active" : ""}`} onClick={() => setShowEventInfo(!showEventInfo)}>
      <span style={{ "--i": 0 } as React.CSSProperties}></span>
      <span style={{ "--i": 2 } as React.CSSProperties}></span>
      <div className="text-small">{topic}</div>
      <div>{title}</div>
      <div className={`${timeList.length > 1 ? "time-list" : ""} ${showEventInfo ? "active" : ""}`}>
        {timeList.map((time) => {
          const startDate = `${format(time.start.getMonth() + 1)}/${format(time.start.getDate())}`;
          const startTime = `${format(time.start.getHours())}:${format(time.start.getMinutes())}`;
          const endDate = `${format(time.end.getMonth() + 1)}/${format(time.end.getDate())}`;
          const endTime = `${format(time.end.getHours())}:${format(time.end.getMinutes())}`;
          const timeString = startDate === endDate ? `${startDate} ${startTime}-${endTime}` : `${startDate}-${endDate} ${startTime}-${endTime}`;
          return (
            <div key={`Event-${title}-${timeString}`} className="text-small">
              {timeString}
            </div>
          );
        })}
      </div>
    </div>
  );
};
