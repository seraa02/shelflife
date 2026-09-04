# ---------------------------------------------------------------------------
# Execution role — least-privilege: only what the function actually needs
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda_exec" {
  name               = "${local.name_prefix}-order-status-exec"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
  tags               = local.common_tags
}

# Gives the function permission to write logs to CloudWatch
resource "aws_iam_role_policy_attachment" "basic_execution" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# ---------------------------------------------------------------------------
# KMS key used by SSM to encrypt SecureString parameters
# ---------------------------------------------------------------------------

data "aws_kms_key" "ssm" {
  key_id = "alias/aws/ssm"
}

# ---------------------------------------------------------------------------
# Inline policy — SSM read + KMS decrypt (nothing more)
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "lambda_ssm" {
  statement {
    sid     = "ReadSSMParameters"
    effect  = "Allow"
    actions = ["ssm:GetParameter"]
    resources = [
      aws_ssm_parameter.database_url.arn,
      aws_ssm_parameter.admin_key.arn,
    ]
  }

  statement {
    sid       = "DecryptSSMSecureStrings"
    effect    = "Allow"
    actions   = ["kms:Decrypt"]
    resources = [data.aws_kms_key.ssm.arn]
  }
}

resource "aws_iam_role_policy" "lambda_ssm" {
  name   = "ssm-read"
  role   = aws_iam_role.lambda_exec.id
  policy = data.aws_iam_policy_document.lambda_ssm.json
}
