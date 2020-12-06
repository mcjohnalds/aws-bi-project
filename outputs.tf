output "data_lake_bucket_name" {
  value = aws_s3_bucket.data_lake.id
}

output "rss_to_s3_function_name" {
  value = aws_lambda_function.rss_to_s3.id
}

output "aws_glue_catalog_database_name" {
  value = aws_glue_catalog_database.main.name
}