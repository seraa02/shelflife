# ---------------------------------------------------------------------------
# HTTP API (API Gateway v2) — lower latency and cost than REST API (v1)
# ---------------------------------------------------------------------------

resource "aws_apigatewayv2_api" "main" {
  name          = "${local.name_prefix}-api"
  protocol_type = "HTTP"
  description   = "ShelfLife order management HTTP API."

  # CORS — permissive for dev/demo; tighten allow_origins in prod
  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["PATCH", "OPTIONS"]
    allow_headers = ["Content-Type", "X-Admin-Key"]
    max_age       = 300
  }

  tags = local.common_tags
}

# ---------------------------------------------------------------------------
# Integration — proxy all request/response details to Lambda (payload v2.0)
# ---------------------------------------------------------------------------

resource "aws_apigatewayv2_integration" "order_status" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.order_status.invoke_arn
  payload_format_version = "2.0"
}

# ---------------------------------------------------------------------------
# Route — single endpoint exposed by this API
# ---------------------------------------------------------------------------

resource "aws_apigatewayv2_route" "patch_order_status" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "PATCH /orders/{orderId}/status"
  target    = "integrations/${aws_apigatewayv2_integration.order_status.id}"
}

# ---------------------------------------------------------------------------
# Stage — $default auto-deploys every route change immediately
# ---------------------------------------------------------------------------

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true
  tags        = local.common_tags
}

# ---------------------------------------------------------------------------
# Lambda permission — allow API Gateway to invoke the function
# ---------------------------------------------------------------------------

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.order_status.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
