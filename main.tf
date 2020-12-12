terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 2.70"
    }
  }
}

provider "aws" {
  region = "ap-southeast-2"
}

resource "aws_s3_bucket" "data_lake" {
  force_destroy = "true"
}

resource "aws_iam_role" "lambda" {
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_policy" "write_to_data_lake" {
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject"],
      "Resource": ["${aws_s3_bucket.data_lake.arn}/*"]
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda" {
  role       = aws_iam_role.lambda.name
  policy_arn = aws_iam_policy.write_to_data_lake.arn
}

resource "random_pet" "rss_to_s3_lambda_name" {}

resource "aws_lambda_function" "rss_to_s3" {
  function_name    = random_pet.rss_to_s3_lambda_name.id
  filename         = "rss-to-s3/dist/package.zip"
  role             = aws_iam_role.lambda.arn
  handler          = "index.handler"
  source_code_hash = filebase64sha256("rss-to-s3/dist/package.zip")
  runtime          = "nodejs12.x"
  depends_on = [
    aws_iam_role_policy_attachment.lambda,
    aws_s3_bucket.data_lake
  ]
}

resource "aws_glue_catalog_database" "main" {
  name = "aws_bi_project"
}

resource "aws_glue_catalog_table" "bbc" {
  name          = "bbc"
  database_name = aws_glue_catalog_database.main.name
  parameters = {
    EXTERNAL = "TRUE"
  }
  storage_descriptor {
    location      = "s3://${aws_s3_bucket.data_lake.id}/bbc/"
    input_format  = "org.apache.hadoop.mapred.TextInputFormat"
    output_format = "org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat"
    ser_de_info {
      name                  = "hello"
      serialization_library = "org.apache.hadoop.hive.serde2.OpenCSVSerde"
      parameters = {
        "separatorChar"          = ","
        "skip.header.line.count" = "1"
      }
    }
    columns {
      name = "title"
      type = "string"
    }
    columns {
      name = "isoDate"
      type = "string"
    }
  }
}

resource "null_resource" "athena_views" {
  for_each = {
    for filename in fileset("athena/src/", "*.sql") :
    replace(filename, ".sql", "") => file("athena/src/${filename}")
  }

  triggers = {
    md5      = md5(each.value)
    database = aws_glue_catalog_database.main.name
    bucket   = aws_s3_bucket.data_lake.id
  }

  provisioner "local-exec" {
    command = <<EOF
      aws athena start-query-execution \
        --output json \
        --query-string "CREATE OR REPLACE VIEW ${each.key} AS ${each.value}" \
        --query-execution-context "Database=${self.triggers.database}" \
        --result-configuration "OutputLocation=s3://${self.triggers.bucket}/athena" \
      >/dev/null
    EOF
  }

  provisioner "local-exec" {
    when    = destroy
    command = <<EOF
      aws athena start-query-execution \
        --output json \
        --query-string "DROP VIEW IF EXISTS ${each.key}" \
        --query-execution-context "Database=${self.triggers.database}" \
        --result-configuration "OutputLocation=s3://${self.triggers.bucket}/athena" \
      >/dev/null
    EOF
  }
}