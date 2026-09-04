terraform {
  required_version = ">= 1.9"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
  }

  # Uncomment to store state remotely (recommended for team/CI use).
  # Create the bucket manually first:
  #   aws s3api create-bucket --bucket <your-tfstate-bucket> --region us-east-1
  #
  # backend "s3" {
  #   bucket         = "<your-tfstate-bucket>"
  #   key            = "shelflife/order-status-lambda/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "<your-lock-table>"  # optional but recommended
  # }
}

provider "aws" {
  region = var.aws_region
}

# ---------------------------------------------------------------------------
# Data sources — resolved at plan time, used to build ARNs
# ---------------------------------------------------------------------------

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# ---------------------------------------------------------------------------
# Locals — single source of truth for naming + tagging
# ---------------------------------------------------------------------------

locals {
  name_prefix = "${var.project}-${var.environment}"

  common_tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
