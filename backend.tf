terraform {
  backend "s3" {
    bucket = "aws-bi-project-249867787172"
    key    = "terraform.tfstate"
    region = "ap-southeast-2"
  }
}