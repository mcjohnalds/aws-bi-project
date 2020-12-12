import queryPresto from "./queryPresto";
import { promises as fs } from "fs";

describe("createBBCReport", () => {
  it("should create a view of the bbc report without duplicates", async () => {
    jest.setTimeout(1000 * 10);
    await queryPresto("drop table if exists bbc");
    await queryPresto("create table bbc (title varchar, date varchar)");
    await queryPresto(
      `insert into bbc values
      ('foo', '2020-01-01'),
      ('bar', '2020-01-02'),
      ('bar', '2020-01-02')`
    );

    const sql = await fs.readFile("src/createBBCReport.sql", "utf-8");
    await queryPresto(sql);

    const rows = await queryPresto("select * from bbc_report order by date");
    expect(rows).toEqual([
      { title: "foo", date: "2020-01-01" },
      { title: "bar", date: "2020-01-02" },
    ]);
  });
});
