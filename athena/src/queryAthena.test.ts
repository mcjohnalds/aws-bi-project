import queryAthena from "./queryAthena";

describe("queryAthena", () => {
  it("should query athena", async () => {
    expect(await queryAthena("select 1 as foo")).toEqual([{ foo: 1 }]);
  });
});
