import presto from "presto-client";

interface Column {
  name: string;
  // Plus some other fields we don't care about
}

const client = new presto.Client({ user: "test" });

const queryPresto = (sql: string): Promise<unknown[]> =>
  new Promise((resolve, reject) => {
    const allRows = [] as unknown[];
    client.execute({
      query: sql,
      catalog: "memory",
      schema: "default",
      source: "nodejs-client",
      data: (_error: Error, rows: unknown[][], columns: Column[]) =>
        allRows.push(rows.map((row) => rowToObject(row, columns))),
      success: () => resolve(allRows),
      error: reject,
    });
  });

// rowToObject([1, 2], [{name: "x"}, {name: "y"}])
// returns
// [{x: 1, y: 2}]
const rowToObject = (row: unknown[], columns: Column[]) =>
  Object.assign(...row.map((x, i) => ({ [columns[i].name]: x })), {});

export default queryPresto;
