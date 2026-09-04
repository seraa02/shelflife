# ---------------------------------------------------------------------------
# Build step — runs `npm ci` inside lambda-src whenever source files change.
# The trigger hash means Terraform re-runs the build only on real changes.
# ---------------------------------------------------------------------------

resource "null_resource" "lambda_build" {
  triggers = {
    handler_hash  = filesha256("${path.module}/../lambda-src/handler.mjs")
    package_hash  = filesha256("${path.module}/../lambda-src/package.json")
  }

  provisioner "local-exec" {
    command     = "npm ci --omit=dev"
    working_dir = "${path.module}/../lambda-src"
  }
}

# ---------------------------------------------------------------------------
# Package — zip the lambda-src directory (node_modules included after build)
# ---------------------------------------------------------------------------

data "archive_file" "lambda" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda-src"
  output_path = "${path.module}/../lambda-src.zip"
  excludes    = [".gitignore"]

  depends_on = [null_resource.lambda_build]
}

# ---------------------------------------------------------------------------
# CloudWatch log group — pre-create so retention is set before first invocation
# ---------------------------------------------------------------------------

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${local.name_prefix}-order-status"
  retention_in_days = 14
  tags              = local.common_tags
}

# ---------------------------------------------------------------------------
# Lambda function
# ---------------------------------------------------------------------------

resource "aws_lambda_function" "order_status" {
  function_name = "${local.name_prefix}-order-status"
  description   = "PATCH /orders/{orderId}/status — updates order status in PostgreSQL."

  # Deployment package
  filename         = data.archive_file.lambda.output_path
  source_code_hash = data.archive_file.lambda.output_base64sha256

  # Runtime
  runtime       = "nodejs20.x"
  handler       = "handler.handler"
  architectures = ["arm64"] # Graviton2 — ~20% cheaper, same performance for I/O-bound work

  # Execution role
  role = aws_iam_role.lambda_exec.arn

  # Tuning — pg queries are fast; 256 MB is plenty for a Node process
  timeout     = 10
  memory_size = 256

  # Pass SSM parameter *names* as env vars — not the secrets themselves.
  # The handler fetches values from SSM at cold start.
  environment {
    variables = {
      DATABASE_URL_PARAM = aws_ssm_parameter.database_url.name
      ADMIN_KEY_PARAM    = aws_ssm_parameter.admin_key.name
    }
  }

  # Ensure the log group exists before the first invocation creates log streams
  depends_on = [
    aws_cloudwatch_log_group.lambda,
    aws_iam_role_policy_attachment.basic_execution,
  ]

  tags = local.common_tags
}
