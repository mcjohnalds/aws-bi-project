import AWS from "aws-sdk";
import { execSync } from "child_process";

const terraformOutput = JSON.parse(
  execSync("terraform output -json", { cwd: ".." }).toString("utf-8")
);

it("should put BBC data into bucket", async () => {
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

  const s3 = new AWS.S3();
  const object = await s3
    .getObject({
      Bucket: terraformOutput.data_lake_bucket_name.value,
      Key: key,
    })
    .promise();
  const data = object.Body!.toString("utf-8");
  if (data.length < 10) {
    throw new Error("Expected some data, got:\n" + data);
  }
});
