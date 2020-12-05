import Parser from "rss-parser";

const feedToRows = (feed: Parser.Output): Row[] => {
  const items = feed.items || [];
  return items
    .filter((item) => item.title)
    .map((item) => ({
      title: item.title || "",
      date: (item.isoDate || "").replace(/T..:..:...000Z$/, ""),
    }));
};

export default feedToRows;
