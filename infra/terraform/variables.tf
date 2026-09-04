variable "aws_region" {
  description = "AWS region to deploy into."
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Project name — used as a prefix for all resource names."
  type        = string
  default     = "shelflife"
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)."
  type        = string
  default     = "dev"
}

variable "database_url" {
  description = "PostgreSQL connection string for the ShelfLife database. Stored as an SSM SecureString."
  type        = string
  sensitive   = true
}

variable "admin_key" {
  description = "Secret key required in X-Admin-Key header to authorise status updates. Stored as an SSM SecureString."
  type        = string
  sensitive   = true
}
