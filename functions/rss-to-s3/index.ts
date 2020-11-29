import Parser from "rss-parser";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

interface Event {
  url: string;
  bucket: string;
  keyPrefix: string;
}

interface Result {
  key: string;
}

export const handler = async (event: Event): Promise<Result> => {
  const parser = new Parser();
  const feed = await parser.parseURL(event.url);

  if (!feed.items) {
    throw new Error("Feed is empty");
  }

  const data = feed.items[0].title || "";

  const s3 = new AWS.S3();
  const key = `${event.keyPrefix}${uuidv4()}`;
  await s3
    .putObject({
      Bucket: event.bucket,
      Key: key,
      Body: data,
    })
    .promise();

  return { key };
};
