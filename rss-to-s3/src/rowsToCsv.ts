import { parse } from "json2csv";

const rowsToCsv = (rows: Row[]): string =>
  parse(rows, { fields: ["title", "date"] });

export default rowsToCsv;
