import { handler } from "./index";
import AWS from "aws-sdk";
import ServerMock from "mock-http-server";
import { promises as fs } from "fs";
import { promisify } from "util";
import { execSync } from "child_process";

const terraformOutput = JSON.parse(
  execSync("terraform output -json", { cwd: ".." }).toString("utf-8")
);

const event = {
  url: "http://localhost:9000/rss.xml",
  bucket: terraformOutput.data_lake_bucket_name.value,
  keyPrefix: "rss-to-s3-test/",
};

const server = new ServerMock({ host: "localhost", port: 9000 });

beforeAll(async () => {
  server.on({
    method: "GET",
    path: "/rss.xml",
    reply: {
      status: 200,
      body: await fs.readFile("./rss-sample.xml"),
    },
  });
  await promisify(server.start)();
});

afterAll(() => promisify(server.stop)());

describe("rss-to-s3", () => {
  it("should write RSS data to S3", async () => {
    const result = await handler(event);

    const s3 = new AWS.S3();
    const object = await s3
      .getObject({
        Bucket: terraformOutput.data_lake_bucket_name.value,
        Key: result.key,
      })
      .promise();

    if (!object.Body) {
      throw new Error("object body was empty");
    }

    const data = object.Body.toString("utf-8");
    expect(data).toMatchSnapshot();
  });

  it("should add a prefix the object key", async () => {
    const result = await handler(event);
    expect(result.key).toMatch(/^rss-to-s3-test\//);
  });

  it("should add a csv suffix the object key", async () => {
    const result = await handler(event);
    expect(result.key).toMatch(/.csv$/);
  });

  it("should write to a different object on every invocation", async () => {
    const result1 = await handler(event);
    const result2 = await handler(event);
    expect(result1.key).not.toEqual(result2.key);
  });
});
