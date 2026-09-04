output "api_endpoint" {
  description = "Base URL of the HTTP API (API Gateway v2)."
  value       = aws_apigatewayv2_api.main.api_endpoint
}

output "patch_url" {
  description = "Full PATCH URL template — replace {orderId} with a real order ID."
  value       = "${aws_apigatewayv2_api.main.api_endpoint}/orders/{orderId}/status"
}

output "lambda_function_name" {
  description = "Lambda function name — use with 'aws logs tail' or 'aws lambda invoke'."
  value       = aws_lambda_function.order_status.function_name
}

output "log_group_name" {
  description = "CloudWatch log group that receives Lambda output."
  value       = aws_cloudwatch_log_group.lambda.name
}
