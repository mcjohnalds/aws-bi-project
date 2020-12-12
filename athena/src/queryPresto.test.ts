import queryPresto from "./queryPresto";

describe("queryPresto", () => {
  it("should run queries in prestodb", async () => {
    jest.setTimeout(1000 * 20);
    await queryPresto("drop table if exists dogs");
    await queryPresto("create table dogs (name varchar, age bigint)");
    await queryPresto("insert into dogs values ('rex', 3), ('molly', 10)");
    const results = await queryPresto("select * from dogs");
    expect(results).toEqual([
      { name: "rex", age: 3 },
      { name: "molly", age: 10 },
    ]);
  });
});
