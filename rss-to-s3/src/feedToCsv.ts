import Parser from "rss-parser";
import { parse } from "json2csv";

// Convert an RSS feed to a CSV file
const feedToCsv = (feed: Parser.Output): string => {
  const items = feed.items || [];
  const input = items
    .filter((item) => item.title)
    .map((item) => ({ title: item.title, timestamp: item.isoDate }));
  return parse(input, { fields: ["title", "timestamp"] });
};

export default feedToCsv;
