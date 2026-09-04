# ---------------------------------------------------------------------------
# SSM SecureString parameters
# Secrets are passed to the Lambda as parameter *names* via env vars.
# The function fetches the values at cold-start via GetParameter(WithDecryption).
# This keeps plaintext out of the Lambda environment and CloudTrail shows reads.
# ---------------------------------------------------------------------------

resource "aws_ssm_parameter" "database_url" {
  name        = "/${local.name_prefix}/database_url"
  description = "PostgreSQL connection string for the ShelfLife database."
  type        = "SecureString"
  value       = var.database_url

  tags = local.common_tags
}

resource "aws_ssm_parameter" "admin_key" {
  name        = "/${local.name_prefix}/admin_key"
  description = "Secret required in X-Admin-Key header to authorise order status updates."
  type        = "SecureString"
  value       = var.admin_key

  tags = local.common_tags
}
