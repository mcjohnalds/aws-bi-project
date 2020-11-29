import AWS from "aws-sdk";

it("should put BBC data into bucket", async () => {
  const lambda = new AWS.Lambda();
  const result = await lambda
    .invoke({
      FunctionName: process.env.RSS_TO_S3_FUNCTION_NAME!,
      Payload: JSON.stringify({
        url: "https://feeds.bbci.co.uk/news/uk/rss.xml",
        bucket: process.env.DATA_LAKE_BUCKET_NAME!,
        keyPrefix: "bbc-",
      }),
    })
    .promise();

  const key = JSON.parse(result.Payload!.toString("utf-8")).key;

  const s3 = new AWS.S3();
  const object = await s3
    .getObject({
      Bucket: process.env.DATA_LAKE_BUCKET_NAME!,
      Key: key,
    })
    .promise();
  const data = object.Body!.toString("utf-8");
  if (data.length < 10) {
    throw new Error("Expected some data, got:\n" + data);
  }
});
