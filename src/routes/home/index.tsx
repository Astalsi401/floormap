import { Link } from "react-router-dom";

export const Home = () => {
  const links = [
    {
      name: "醫療展 2023 Booths",
      url: "/floormap/tai-nex/2023/booths",
    },
    {
      name: "醫療展 2024 Area",
      url: "/floormap/tai-nex/2024/areas",
    },
    {
      name: "醫療展 2024 booths",
      url: "/floormap/tai-nex/2024/booths",
    },
    {
      name: "醫療展 2024 Booths edit",
      url: "/floormap/tai-nex/2024/booths?edit=1",
    },
    {
      name: "醫療展 2025 Area edit",
      url: "/floormap/tai-nex/2025/areas?edit=1",
    },
    {
      name: "高齡展 2025 Area edit",
      url: "/floormap/twtc/2025/areas?edit=1",
    },
  ];
  return (
    <>
      {links.map(({ name, url }) => (
        <div key={url}>
          <Link to={url}>{name}</Link>
        </div>
      ))}
    </>
  );
};
