import store, { setElementStatus, setSearchCondition, useAppDispatch, useAppSelector } from "@store";

export const Advanced: React.FC = () => {
  const advanced = useAppSelector((state) => state.elementStatus.advanced);
  return (
    <div className={`fp-advanced py-5 ${advanced ? "active" : ""}`}>
      {[
        { title: "展區", col: "cat" },
        { title: "主題", col: "topic" },
      ].map((d) => (
        <Category key={d.title} title={d.title} col={d.col as "cat" | "topic"} />
      ))}
    </div>
  );
};

const Category: React.FC<{ title: string; col: "cat" | "topic" }> = ({ title, col }) => {
  const dispatch = useAppDispatch();
  const data = useAppSelector((state) => state.floorData.filterData).filter((d) => store.getState().types.includes(d.type));
  const sum = data.reduce<Record<string, number>>((acc, d) => {
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
              dispatch(setElementStatus({ advanced: !store.getState().elementStatus.advanced }));
            }}
          >
            {d} ({sum[d]})
          </div>
        ))}
    </div>
  );
};
