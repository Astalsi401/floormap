import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { zoomCalculator, dragCalculator, manualToggleElement, toggleElement, setSearchCondition, setElementStatus, regexAsync, searchChange } from "../assets/store";

export const Advanced = () => {
  console.count("Advanced rendered");
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
  console.count("Search rendered");
  const dispatch = useDispatch();
  const string = useSelector((state) => state.searchCondition.string);
  const regex = useSelector((state) => state.searchCondition.regex);
  const tag = useSelector((state) => state.searchCondition.tag);
  const floor = useSelector((state) => state.searchCondition.floor);
  const lang = useSelector((state) => state.searchCondition.lang);
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
  const checkText = (targetElements) => regex.test(targetElements.join(" ").replace(/\r|\n/g, "").replace("臺", "台"));
  const getFilterData = () =>
    data.reduce((res, d) => {
      const tags = d.tag[lang];
      const corps = d.corps ? d.corps.map((corp) => corp.org[lang]) : [];
      const infos = d.corps ? d.corps.map((corp) => corp.info[lang]) : [];
      const text = d.text[lang];
      const cat = d.cat[lang];
      const topic = d.topic[lang];
      const targets = [d.id, text.join(""), cat, topic, ...tags];
      const isType = types.includes(d.type);
      const hasTag = isType && tag.length === 0 ? true : [d.id, cat, topic, ...tags].includes(tag);
      let hasText = isType && checkText([...targets, ...infos, ...corps]);
      const opacity = (hasText && hasTag) || d.type === "icon" ? 0.8 : 0.1;
      const events = d.event ? d.event.map((e) => ({ ...e, title: e.title[lang], topic: e.topic[lang] })) : [];
      if (d.corps.length > 0) {
        d.corps.forEach((corp, i) => {
          hasText = checkText([...targets, corp.info[lang], corp.org[lang]]);
          res.push({ ...d, ...corp, text: text, size: d.size[lang], cat: d.cat[lang], topic: d.topic[lang], corps: d.corps.map((c) => ({ ...c, org: c.org[lang], info: c.info[lang] })), org: corp.org[lang], info: corp.info[lang], tag: tags, event: events, opacity: opacity, draw: i === 0, sidebar: hasText && hasTag });
        });
      } else {
        res.push({ ...d, text: text, size: d.size[lang], cat: d.cat[lang], topic: d.topic[lang], tag: tags, event: events, opacity: opacity, draw: true, sidebar: isType });
      }
      return res;
    }, []);
  useEffect(() => {
    if (inputTimer) return;
    dispatch(regexAsync());
  }, [string, inputTimer]);
  useEffect(() => {
    dispatch(searchChange({ data: getFilterData() }));
  }, [tag, floor, lang, regex]);
  useEffect(() => {
    const url = new URL(window.location.href);
    Object.keys({ string, tag, floor, lang }).forEach((key) => {
      eval(key).length === 0 ? url.searchParams.delete(key) : url.searchParams.set(key, eval(key));
    });
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
      <div
        className={`fp-toggle d-flex align-items-center justify-content-center ${searched ? "" : "active"}`}
        title={searched ? "" : mapText.clear}
        onClick={() => {
          if (sidebar) dispatch(setSearchCondition({ string: "" }));
        }}
      >
        <span />
      </div>
    </div>
  );
};

export const ResultList = ({ svgRef, graphRef, animation }) => {
  console.count("ResultList rendered");
  const types = useSelector((state) => state.types);
  const data = useSelector((state) => state.floorData.filterData).filter((d) => types.includes(d.type) && types.includes(d.type) && d.sidebar && d.text.length > 0 && d.opacity > 0.1 && d.text.length !== 0);
  return (
    <div className="fp-result pb-5">
      {data.map((d) => (
        <Result key={`Result-${d.corpId ? d.corpId : d.id}`} d={d} svgRef={svgRef} graphRef={graphRef} animation={animation} />
      ))}
    </div>
  );
};

export const BoothInfo = () => {
  console.count("BoothInfo rendered");
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

const FilterIcon = () => {
  return (
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
};

const Result = ({ d, svgRef, graphRef, animation }) => {
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
    animation();
    // 定位選取攤位中心點至地圖中心點
    const svgPoint = svgRef.current.createSVGPoint();
    svgPoint.x = d.x + d.w / 2;
    svgPoint.y = d.y + d.h / 2;
    const CTM = svgRef.current.getScreenCTM();
    const transformedPoint = svgPoint.matrixTransform(CTM);
    const { offsetLeft: x, offsetTop: y, offsetWidth: w, offsetHeight: h } = graphRef.current;
    const center = { x: w / 2 + x, y: smallScreen ? (sidebarWidth + tagsHeight) / 2 : h / 2 + y };
    dispatch(zoomCalculator(transformedPoint.x, transformedPoint.y, graphRef, svgRef, 1.5, 1.5));
    dispatch(dragCalculator(center.x - transformedPoint.x, center.y - transformedPoint.y, true));
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
  console.count("BoothInfoDetail rendered");
  const dispatch = useDispatch();
  const colors = useSelector((state) => state.elementStatus.colors);
  const boothInfoData = useSelector((state) => state.elementStatus.boothInfoData);
  const mapText = useSelector((state) => state.mapText);
  const types = useSelector((state) => state.types);
  const data = useSelector((state) => state.floorData.filterData).filter((d) => types.includes(d.type));
  const { type, text, org, id, floor, cat, topic, tag, info, event, note, corpId } = boothInfoData;
  const isBooth = type === "booth";
  const loc = isBooth ? [cat, topic] : [note];
  const tags = Object.keys(boothInfoData).length === 0 ? [] : [...loc, ...tag].filter((d) => d !== "");
  const booth = data.find((d) => d.id === id);
  const corps = booth && booth.corps ? booth.corps : [];
  const events = event.filter((d) => d.title !== "");
  const handleTagClick = (value) => {
    dispatch(setSearchCondition({ tag: value, string: "" }));
    dispatch(setElementStatus({ boothInfo: false }));
  };
  const handleCorpClick = (corpId) => dispatch(setElementStatus({ boothInfoData: data.find((d) => d.corpId === corpId) }));
  return (
    <div className="fp-info pb-5">
      <div className="fp-info-item d-flex align-items-center px-2 py-1">
        <div className="fp-result-item-name text-x-large text-bold">{text.join("")}</div>
        <div className="fp-result-item-loc text-small">{isBooth ? `${id} / ${floor}F` : `${floor}F`}</div>
      </div>
      <div className="p-2 text-large">{org}</div>
      <div className="fp-booth-tags d-flex flex-wrap p-2">
        {tags.map((tag) => (
          <div key={`BoothInfoDetail-${corpId}-${tag}`} className="fp-input-tag shadow text-small" style={{ "--cat": colors.scale(tag) }} onClick={() => handleTagClick(tag)}>
            {tag}
          </div>
        ))}
      </div>
      {corps.length > 1 && (
        <div className="p-2">
          <div className="my-1 text-large">{mapText.exhibitor}</div>
          <div className="my-1 fp-booth-tags d-flex flex-wrap">
            {corps.map((d) => (
              <div key={`BoothInfoDetail-${d.corpId}`} className="fp-input-tag shadow text-small" style={{ "--cat": d.corpId === corpId ? "rgb(0, 0, 128, 0.3)" : colors.scale("") }} onClick={() => handleCorpClick(d.corpId)}>
                {d.org}
              </div>
            ))}
          </div>
        </div>
      )}
      {info && (
        <div className="p-2 text-small">
          {info.split("\n").map((d, i) => (
            <div key={`BoothInfoDetail-describe-${corpId}-${d}-${i}`}>{d}</div>
          ))}
        </div>
      )}
      {events.length > 0 && (
        <div className="p-2">
          <div className="my-1 text-large">{mapText.activity}</div>
          <div className="my-1">
            {events.map((d, i) => (
              <Event key={`BoothInfoDetail-event-${d.title}-${i}`} {...d} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
