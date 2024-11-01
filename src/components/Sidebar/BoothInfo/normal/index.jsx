import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import store, { setSearchCondition, setElementStatus, initEditForm, defaultString } from "@store";
import { getSearchParam } from "@functions";
import { AddCorp } from "../edit";

export const BoothTags = ({ tags, corpId }) => {
  const dispatch = useDispatch();
  const colors = useSelector((state) => state.elementStatus.colors);
  const handleTagClick = (value) => {
    dispatch(setSearchCondition({ tag: value, string: "" }));
    dispatch(setElementStatus({ boothInfo: false }));
  };
  return (
    <div className="fp-booth-tags d-flex flex-wrap p-2">
      {tags.map((tag) => (
        <div key={`BoothInfoDetail-${corpId}-${tag}`} className="fp-input-tag shadow text-small" style={{ "--cat": colors.scale(tag) }} onClick={() => handleTagClick(tag)}>
          {tag}
        </div>
      ))}
    </div>
  );
};

export const BoothCoprs = ({ id, corps, corpId, data }) => {
  const dispatch = useDispatch();
  const exhibitor = useSelector((state) => state.mapText.exhibitor);
  const colors = useSelector((state) => state.elementStatus.colors);
  const currentCorps = useSelector((state) => state.editForm.corps);
  const lang = useSelector((state) => state.searchCondition.lang);
  const isEdit = getSearchParam("edit") === 1;
  const handleCorpClick = ({ currentCorpId }) => {
    if (currentCorpId.endsWith("-add")) {
      dispatch(setElementStatus({ boothInfoData: { ...store.getState().elementStatus.boothInfoData, corpId: currentCorpId, org: "", info: "" } }));
    } else {
      dispatch(setElementStatus({ boothInfoData: data.find((d) => d.corpId === currentCorpId) }));
      initEditForm({ id })(dispatch);
    }
  };
  return (
    <div className="p-2">
      <div className="my-1 text-large">{exhibitor}</div>
      <div className="my-1 fp-booth-tags d-flex flex-wrap">
        {(isEdit ? currentCorps : corps).map((d) => (
          <div key={`BoothInfoDetail-${d.corpId}`} className="fp-input-tag shadow text-small" style={{ "--cat": d.corpId === corpId ? "rgb(0, 0, 128, 0.3)" : colors.scale("") }} onClick={() => handleCorpClick({ currentCorpId: d.corpId })}>
            {isEdit ? d.org[lang] : d.org}
          </div>
        ))}
        {isEdit && <AddCorp />}
      </div>
    </div>
  );
};

export const CorpDescribe = ({ info, corpId }) => (
  <div className="p-2 text-small">
    {info.split("\n").map((d, i) => (
      <div key={`BoothInfoDetail-describe-${corpId}-${d}-${i}`}>{d}</div>
    ))}
  </div>
);

export const BoothEvents = ({ events }) => {
  const activity = useSelector((state) => state.mapText.activity);
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

const Event = ({ timeList, title, topic, active }) => {
  const [showEventInfo, setShowEventInfo] = useState(false);
  const format = (datetime) => (Array(2).join("0") + datetime).slice(-2);
  return (
    <div className={`fp-event my-1 p-1 ${active ? "active" : ""}`} onClick={() => setShowEventInfo(!showEventInfo)}>
      <span style={{ "--i": 0 }}></span>
      <span style={{ "--i": 2 }}></span>
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
