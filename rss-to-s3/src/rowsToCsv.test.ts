import rowsToCsv from "./rowsToCsv";

describe("rowsToCsv", () => {
  it("should convert rows to csv", () => {
    const rows = [
      { title: "Florida man strangles beetle", date: "2020-01-01" },
      { title: "Queen of England releases rap album", date: "2020-02-02" },
    ];
    expect(rowsToCsv(rows)).toEqual(
      `"title","date"
"Florida man strangles beetle","2020-01-01"
"Queen of England releases rap album","2020-02-02"`
    );
  });
});
