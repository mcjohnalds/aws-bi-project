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
  filename         = "functions/rss-to-s3/dist/package.zip"
  role             = aws_iam_role.lambda.arn
  handler          = "index.handler"
  source_code_hash = filebase64sha256("functions/rss-to-s3/dist/package.zip")
  runtime          = "nodejs12.x"
  depends_on = [
    aws_iam_role_policy_attachment.lambda,
    aws_s3_bucket.data_lake
  ]
}