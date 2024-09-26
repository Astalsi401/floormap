import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { manualToggleElement, toggleElement, setSearchCondition, setElementStatus, regexAsync, searchChange, setStore, setData } from "@store";
import { zoomCalculator, dragCalculator, getSearchParam, getMapElems, boothData, getFilterData } from "@functions";

export const Advanced = () => {
  const advanced = useSelector((state) => state.elementStatus.advanced);
  return (
    <div className={`fp-advanced py-5 ${advanced ? "active" : ""}`}>
      {[
        { title: "展區", col: "cat" },
        { title: "主題", col: "topic" },
      ].map((d) => (
        <Category key={d.title} title={d.title} col={d.col} />
      ))}
    </div>
  );
};

export const Search = () => {
  const dispatch = useDispatch();
  const { string, regex, tag, floor, lang } = useSelector((state) => state.searchCondition);
  const sidebar = useSelector((state) => state.elementStatus.sidebar);
  const advanced = useSelector((state) => state.elementStatus.advanced);
  const colors = useSelector((state) => state.elementStatus.colors);
  const mapText = useSelector((state) => state.mapText);
  const data = useSelector((state) => state.floorData.data);
  const types = useSelector((state) => state.types);
  const searched = string.length === 0 && tag.length === 0;
  const [inputTimer, setInputTimer] = useState(null);
  const handleInput = ({ target: { name, value } }) => {
    clearTimeout(inputTimer);
    const timer = setTimeout(() => setInputTimer(null), 500);
    setInputTimer(timer);
    dispatch(manualToggleElement({ name: "advanced", value: false }));
    dispatch(setSearchCondition({ [name]: value }));
  };
  useEffect(() => {
    if (inputTimer) return;
    dispatch(regexAsync());
  }, [string, inputTimer]);
  useEffect(() => {
    dispatch(searchChange({ data: getFilterData({ data, types, tag, lang, regex }) }));
  }, [tag, floor, lang, regex]);
  useEffect(() => {
    const url = new URL(window.location.href);
    Object.keys({ string, tag, floor, lang }).forEach((key) => (eval(key).length === 0 ? url.searchParams.delete(key) : url.searchParams.set(key, eval(key))));
    history.pushState(null, "", url.href);
  }, [string, tag, floor, lang]);
  return (
    <div className="fp-search d-flex align-items-center justify-content-center">
      <div className={`fp-filter px-1 ${advanced ? "active" : ""}`} onClick={() => dispatch(toggleElement({ name: "advanced" }))}>
        <FilterIcon />
      </div>
      <div className="fp-input d-flex flex-wrap align-items-center px-1">
        {tag.length !== 0 && (
          <div className="fp-input-tag shadow text-small" title={mapText.remove} onClick={() => dispatch(setSearchCondition({ tag: "" }))} style={{ "--cat": colors.scale(tag) }}>
            {tag}
          </div>
        )}
        <input className="fp-input-text d-block text-large" name="string" type="text" value={string} onChange={handleInput} placeholder={mapText.searchPlaceholder} />
      </div>
      <div className={`fp-toggle d-flex align-items-center justify-content-center ${searched ? "" : "active"}`} title={searched ? "" : mapText.clear} onClick={() => sidebar && dispatch(setSearchCondition({ string: "" }))}>
        <span />
      </div>
    </div>
  );
};

export const ResultList = ({ svgRef, graphRef }) => {
  const types = useSelector((state) => state.types);
  const data = useSelector((state) => state.floorData.filterData).filter((d) => types.includes(d.type) && types.includes(d.type) && d.sidebar && d.text.length > 0 && d.opacity > 0.1 && d.text.length !== 0);
  return (
    <div className="fp-result pb-5">
      {data.map((d) => (
        <Result key={`Result-${d.corpId || d.id}`} d={d} svgRef={svgRef} graphRef={graphRef} />
      ))}
    </div>
  );
};

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

const Category = ({ title, col }) => {
  const dispatch = useDispatch();
  const types = useSelector((state) => state.types);
  const data = useSelector((state) => state.floorData.filterData).filter((d) => types.includes(d.type));
  const sum = data.reduce((acc, d) => {
    const key = d[col];
    acc[key] ? acc[key]++ : (acc[key] = 1);
    return acc;
  }, {});
  return (
    <div className="py-3 my-3">
      <div className="text-x-large text-bold px-2">{title}</div>
      {Object.keys(sum)
        .filter((d) => !["false", ""].includes(d))
        .map((d) => (
          <div
            key={`${title}-${d}`}
            className="fp-category px-4 py-1"
            onClick={() => {
              dispatch(setSearchCondition({ tag: d }));
              dispatch(toggleElement({ name: "advanced" }));
            }}
          >
            {d} ({sum[d]})
          </div>
        ))}
    </div>
  );
};

const FilterIcon = () => (
  <>
    <span />
    <svg width="100%" height="100%" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
      <defs>
        <path id="filter-bar" d="M0 0H350A20 20 90 1 1 350 40H0A20 20 90 1 1 0 0" />
      </defs>
      <use xlinkHref="#filter-bar" x={75} y={100} />
      <use xlinkHref="#filter-bar" x={75} y={230} />
      <use xlinkHref="#filter-bar" x={75} y={360} />
    </svg>
  </>
);

const Result = ({ d, svgRef, graphRef }) => {
  const dispatch = useDispatch();
  const colors = useSelector((state) => state.elementStatus.colors);
  const smallScreen = useSelector((state) => state.elementStatus.smallScreen);
  const sidebar = useSelector((state) => state.elementStatus.sidebar);
  const sidebarWidth = useSelector((state) => state.elementStatus.sidebarWidth);
  const tagsHeight = useSelector((state) => state.elementStatus.tagsHeight);
  const isBooth = d.type === "booth";
  const id = isBooth ? `${d.id}-${d.org}` : `${d.text.join("")}-${d.floor}`;
  const bg = isBooth ? colors.scale(d.cat) : "#acacac";
  const name = isBooth ? d.org : d.text.join("");
  const loc = isBooth ? `${d.id} / ${d.floor}F` : `${d.floor}F`;
  const handleResultClick = () => {
    if (!sidebar) return;
    dispatch(setElementStatus({ boothInfo: true, boothInfoData: d }));
    dispatch(setSearchCondition({ floor: d.floor }));
    // 定位選取攤位中心點至地圖中心點
    const svgPoint = svgRef.current.createSVGPoint();
    svgPoint.x = d.x + d.w / 2;
    svgPoint.y = d.y + d.h / 2;
    const CTM = svgRef.current.getScreenCTM();
    const transformedPoint = svgPoint.matrixTransform(CTM);
    const { offsetLeft: x, offsetTop: y, offsetWidth: w, offsetHeight: h } = graphRef.current;
    const center = { x: w / 2 + x, y: smallScreen ? (sidebarWidth + tagsHeight) / 2 : h / 2 + y };
    zoomCalculator({ clientX: transformedPoint.x, clientY: transformedPoint.y, graph: graphRef.current, svg: svgRef.current, r: 1.5, rMax: 1.5, animate: true });
    dragCalculator({ x: center.x - transformedPoint.x, y: center.y - transformedPoint.y, svg: svgRef.current, animate: true });
  };
  return (
    <div id={id} className="fp-result-item d-flex align-items-center px-2 py-1" style={{ "--cat": bg }} onClick={handleResultClick}>
      <div className="fp-result-item-name text-large">{name}</div>
      <div className="fp-result-item-loc text-small">{loc}</div>
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

const BoothInfoDetail = () => {
  const boothInfoData = useSelector((state) => state.elementStatus.boothInfoData);
  const types = useSelector((state) => state.types);
  const data = useSelector((state) => state.floorData.filterData).filter((d) => types.includes(d.type));
  const { type, text, org, id, floor, cat, topic, tag, info, event, note, corpId } = boothInfoData;
  const edit = getSearchParam("edit");
  const isBooth = type === "booth";
  const loc = isBooth ? [cat, topic] : [note];
  const tags = Object.keys(boothInfoData).length === 0 ? [] : [...loc, ...tag].filter((d) => d !== "");
  const booth = data.find((d) => d.id === id);
  const corps = booth && booth.corps ? booth.corps : [];
  const events = event.filter((d) => d.title !== "");
  return (
    <div className="fp-info pb-5">
      <div className="fp-info-item d-flex align-items-center px-2 py-1">
        <div className="fp-result-item-name text-x-large text-bold">{text.join("")}</div>
        <div className="fp-result-item-loc text-small">{isBooth ? `${id} / ${floor}F` : `${floor}F`}</div>
      </div>
      <div className="p-2 text-large">{org}</div>
      {edit === 1 && <SelectedBooths id={id} />}
      <BoothTags tags={tags} corpId={corpId} />
      {corps.length > 1 && <BoothCoprs corps={corps} corpId={corpId} />}
      {info && <BoothDescribe info={info} corpId={corpId} />}
      {events.length > 0 && <BoothEvents events={events} />}
    </div>
  );
};

const SelectedBooths = ({ id }) => {
  const dispatch = useDispatch();
  const selectedBooths = useSelector((state) => state.selectedBooths);
  const { regex, tag, lang } = useSelector((state) => state.searchCondition);
  const types = useSelector((state) => state.types);
  const { year, category } = useParams();
  const reset = () => dispatch(setStore({ selectedBooths: [] }));
  const save = async () => {
    navigator.clipboard.writeText(`"booths": [${selectedBooths.map((d) => `"${d}"`).join(", ")}], `);
    import.meta.env.MODE === "development" &&
      (await fetch(`http://localhost:3002/api/add-selected-booth/${year}/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(selectedBooths),
      }));
    let {
      data: { data },
    } = await getMapElems({ params: { year, category } });
    data = boothData(data);
    dispatch(setData({ data }));
    dispatch(searchChange({ data: getFilterData({ data, types, tag, lang, regex }) }));
  };
  return (
    <div className="fp-selected-booths p-2">
      <div className="">已選擇的攤位：</div>
      <button className="fp-btn" onClick={reset}>
        reset
      </button>
      <button className="fp-btn" onClick={save}>
        save
      </button>
      <div className="fp-booth-tags d-flex flex-wrap p-2">
        {selectedBooths.map((boothID) => (
          <div key={`selected-booth-${boothID}`} className="fp-input-tag shadow text-small">
            {boothID}
          </div>
        ))}
      </div>
    </div>
  );
};

const BoothTags = ({ tags, corpId }) => {
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

const BoothCoprs = ({ corps, corpId }) => {
  const dispatch = useDispatch();
  const exhibitor = useSelector((state) => state.mapText.exhibitor);
  const colors = useSelector((state) => state.elementStatus.colors);
  const handleCorpClick = (corpId) => dispatch(setElementStatus({ boothInfoData: data.find((d) => d.corpId === corpId) }));
  return (
    <div className="p-2">
      <div className="my-1 text-large">{exhibitor}</div>
      <div className="my-1 fp-booth-tags d-flex flex-wrap">
        {corps.map((d) => (
          <div key={`BoothInfoDetail-${d.corpId}`} className="fp-input-tag shadow text-small" style={{ "--cat": d.corpId === corpId ? "rgb(0, 0, 128, 0.3)" : colors.scale("") }} onClick={() => handleCorpClick(d.corpId)}>
            {d.org}
          </div>
        ))}
      </div>
    </div>
  );
};

const BoothDescribe = ({ info, corpId }) => (
  <div className="p-2 text-small">
    {info.split("\n").map((d, i) => (
      <div key={`BoothInfoDetail-describe-${corpId}-${d}-${i}`}>{d}</div>
    ))}
  </div>
);

const BoothEvents = ({ events }) => {
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
