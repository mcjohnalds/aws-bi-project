import feedToCsv from "./feedToCsv";

describe("feedToCsv", () => {
  it("should convert a feed to a csv", () => {
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
    expect(feedToCsv(feed)).toMatchInlineSnapshot(`
      "\\"title\\",\\"timestamp\\"
      \\"Florida man strangles beetle\\",\\"2020-01-01T01:01:01.000Z\\"
      \\"Queen of England releases rap album\\",\\"2020-02-02T02:02:02.000Z\\""
    `);
  });

  it("should handle a feed which is missing the items field", () => {
    const feed = {};
    expect(feedToCsv(feed)).toMatchInlineSnapshot(
      `"\\"title\\",\\"timestamp\\""`
    );
  });

  it("should handle a feed with 0 items in the items field", () => {
    const feed = { items: [] };
    expect(feedToCsv(feed)).toMatchInlineSnapshot(
      `"\\"title\\",\\"timestamp\\""`
    );
  });

  it("should handle items with missing fieldss", () => {
    const feed = {
      items: [
        {},
        {
          title: "Queen of England releases rap album",
          isoDate: "2020-02-02T02:02:02.000Z",
        },
      ],
    };
    expect(feedToCsv(feed)).toMatchInlineSnapshot(`
      "\\"title\\",\\"timestamp\\"
      \\"Queen of England releases rap album\\",\\"2020-02-02T02:02:02.000Z\\""
    `);
  });
});
