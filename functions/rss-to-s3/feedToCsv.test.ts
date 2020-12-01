import feedToCsv from "./feedToCsv";

describe("feedToCsv", () => {
  it("should convert a feed to a csv", () => {
    const feed = {
      items: [
        { title: "Florida man strangles beetle" },
        { title: "Queen of England releases rap album" },
      ],
    };
    expect(feedToCsv(feed)).toMatchInlineSnapshot(`
      "\\"title\\"
      \\"Florida man strangles beetle\\"
      \\"Queen of England releases rap album\\""
    `);
  });

  it("should handle a feed which is missing the items field", () => {
    const feed = {};
    expect(feedToCsv(feed)).toMatchInlineSnapshot(`"\\"title\\""`);
  });

  it("should handle a feed with 0 items in the items field", () => {
    const feed = { items: [] };
    expect(feedToCsv(feed)).toMatchInlineSnapshot(`"\\"title\\""`);
  });

  it("should handle items with missing titles", () => {
    const feed = {
      items: [{}, { title: "Queen of England releases rap album" }],
    };
    expect(feedToCsv(feed)).toMatchInlineSnapshot(`
      "\\"title\\"
      \\"Queen of England releases rap album\\""
    `);
  });
});
