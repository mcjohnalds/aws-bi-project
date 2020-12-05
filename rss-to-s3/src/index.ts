import Parser from "rss-parser";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import feedToCsv from "./feedToCsv";

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
  const csv = feedToCsv(feed);
  const s3 = new AWS.S3();
  const key = `${event.keyPrefix}${uuidv4()}`;
  await s3.putObject({ Bucket: event.bucket, Key: key, Body: csv }).promise();
  return { key };
};
