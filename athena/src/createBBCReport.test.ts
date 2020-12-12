import queryPresto from "./queryPresto";
import { promises as fs } from "fs";

describe("createBBCReport", () => {
  it("should create a view of the bbc report", async () => {
    jest.setTimeout(1000 * 20);
    await queryPresto("drop table if exists bbc");
    await queryPresto("create table bbc (title varchar, isoDate varchar)");
    await queryPresto(
      `insert into bbc values
      ('foo', '2020-01-01T01:01:01.000Z'),
      ('bar', '2020-01-02T01:01:01.000Z'),
      ('bar', '2020-01-02T01:01:01.000Z')`
    );

    const sql = await fs.readFile("src/createBBCReport.sql", "utf-8");
    await queryPresto(sql);

    const rows = await queryPresto("select * from bbc_report order by date");
    // Note that there are no duplicates and that the timestamps have been
    // converted to dates
    expect(rows).toEqual([
      { title: "foo", date: "2020-01-01" },
      { title: "bar", date: "2020-01-02" },
    ]);
  });
});
