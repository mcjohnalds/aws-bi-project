import feedToRows from "./feedToRows";

describe("feedToRows", () => {
  it("should convert a feed to rows", () => {
    const feed = {
      items: [
        {
          title: "Florida man strangles beetle",
          isoDate: "2020-01-01T01:01:01.000Z",
        },
        {
          title: "Queen of England releases rap album",
          isoDate: "2020-02-02T02:02:02.000Z",
        },
      ],
    };
    expect(feedToRows(feed)).toEqual([
      { title: "Florida man strangles beetle", date: "2020-01-01" },
      { title: "Queen of England releases rap album", date: "2020-02-02" },
    ]);
  });
});
