import { AthenaExpress } from "athena-express";
import * as AWS from "aws-sdk";
import { execSync } from "child_process";

const terraformOutput = JSON.parse(
  execSync("terraform output -json", { cwd: ".." }).toString("utf-8")
);

const athenaExpress = new AthenaExpress({
  aws: AWS,
  s3: `s3://${terraformOutput.data_lake_bucket_name.value}/athena/`,
});

const queryAthena = async (sql: string): Promise<unknown[]> => {
  const results = await athenaExpress.query({
    sql,
    db: terraformOutput.aws_glue_catalog_database_name.value,
  });
  if (!results.Items) {
    throw new Error("Query was empty");
  }
  return results.Items;
};

export default queryAthena;
