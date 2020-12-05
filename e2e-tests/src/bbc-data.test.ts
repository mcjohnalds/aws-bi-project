import AWS from "aws-sdk";
import { execSync } from "child_process";
import parse from "csv-parse/lib/sync";

const terraformOutput = JSON.parse(
  execSync("terraform output -json", { cwd: ".." }).toString("utf-8")
);

it("should put BBC data into bucket", async () => {
  const key = await bbcToS3();
  const buffer = await getFileFromDataLake(key);
  const csv = buffer.toString("utf-8");

  let rows: any[];
  try {
    rows = parse(csv, { columns: true });
  } catch (error) {
    throw new Error(`Couldn't parse CSV:\n\n${csv}`);
  }
  if (rows.length < 10) {
    throw new Error(`CSV is too short:\n\n${csv}`);
  }
  if (typeof rows[0].title !== "string" || rows[0].title === "") {
    throw new Error(`CSV columns are invalid:\n\n${csv}`);
  }
});

// Run the RSS to S3 Lambda against the BBC RSS feed. Returns the key of the
// resulting bucket object.
const bbcToS3 = async (): Promise<string> => {
  const lambda = new AWS.Lambda();
  const result = await lambda
    .invoke({
      FunctionName: terraformOutput.rss_to_s3_function_name.value,
      Payload: JSON.stringify({
        url: "https://feeds.bbci.co.uk/news/uk/rss.xml",
        bucket: terraformOutput.data_lake_bucket_name.value,
        keyPrefix: "bbc-",
      }),
    })
    .promise();
  const key = JSON.parse(result.Payload!.toString("utf-8")).key;
  return key;
};

// Get a file from the data lake.
const getFileFromDataLake = async (key: string): Promise<Buffer> => {
  const s3 = new AWS.S3();
  const object = await s3
    .getObject({
      Bucket: terraformOutput.data_lake_bucket_name.value,
      Key: key,
    })
    .promise();
  return object.Body as Buffer;
};
