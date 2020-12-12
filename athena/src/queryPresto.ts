import presto from "presto-client";

interface Column {
  name: string;
  // Plus some other fields we don't care about
}

const client = new presto.Client({ user: "test" });

const queryPresto = (sql: string): Promise<unknown[]> =>
  new Promise((resolve, reject) => {
    let allRows = [] as unknown[];
    client.execute({
      query: sql,
      catalog: "memory",
      schema: "default",
      source: "nodejs-client",
      data: (_error: Error, rows: unknown[][], columns: Column[]) =>
        (allRows = allRows.concat(
          rows.map((row) => rowToObject(row, columns))
        )),
      success: () => resolve(allRows),
      error: reject,
    });
  });

// rowToObject([1, 2], [{name: "x"}, {name: "y"}])
// returns
// [{x: 1, y: 2}]
const rowToObject = (row: unknown[], columns: Column[]) =>
  // We need "as any" because of a bug in TS
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Object.assign as any)(...row.map((x, i) => ({ [columns[i].name]: x })), {});

export default queryPresto;
