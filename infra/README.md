# ShelfLife — Order Status Lambda (Terraform)

This directory provisions a serverless equivalent of the `PATCH /api/orders/:id/status`
Express route as an **AWS Lambda function** backed by **API Gateway HTTP API v2**,
with secrets stored in **SSM Parameter Store** — all managed by Terraform.

## What this demonstrates

| Skill | Where |
|---|---|
| IaC resource lifecycle | `terraform/` — create, update, destroy via `terraform apply` |
| Least-privilege IAM | `terraform/iam.tf` — only `ssm:GetParameter` + `kms:Decrypt` |
| Secrets management | `terraform/ssm.tf` — SecureString params, never plaintext env vars |
| Lambda packaging | `terraform/lambda.tf` — `null_resource` build trigger + `archive_file` |
| Cold-start caching | `lambda-src/handler.mjs` — module-scope `pool` + `adminKey` |
| API Gateway HTTP API | `terraform/api_gateway.tf` — v2, payload format 2.0, CORS |

---

## Prerequisites

| Tool | Version |
|---|---|
| [Terraform](https://developer.hashicorp.com/terraform/install) | >= 1.9 |
| [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) | v2, configured with credentials |
| Node.js | >= 20 (for the local `npm ci` build step) |

AWS credentials must have permission to create IAM roles, Lambda functions,
SSM parameters, API Gateway resources, and CloudWatch log groups.

---

## Setup

### 1. Configure variables

```bash
cd infra/
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars — fill in database_url and admin_key
```

### 2. Initialise Terraform

```bash
cd terraform/
terraform init
```

### 3. Preview the plan

```bash
terraform plan
```

You should see ~13 resources to be created.

### 4. Apply

```bash
terraform apply
```

Terraform runs `npm ci` inside `lambda-src/`, zips the directory, uploads it,
and wires up all the AWS resources. Takes ~60 seconds on first apply.

### 5. Note the outputs

```
api_endpoint         = "https://<id>.execute-api.us-east-1.amazonaws.com"
patch_url            = "https://<id>.execute-api.us-east-1.amazonaws.com/orders/{orderId}/status"
lambda_function_name = "shelflife-dev-order-status"
log_group_name       = "/aws/lambda/shelflife-dev-order-status"
```

---

## Demo

### Update an order's status

Replace `{api_endpoint}` and `{orderId}` with real values from Terraform output and
your database. `{admin_key}` must match the value you set in `terraform.tfvars`.

```bash
curl -X PATCH "{api_endpoint}/orders/{orderId}/status" \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: {admin_key}" \
  -d '{"status": "SHIPPED"}'
```

Expected response:

```json
{
  "id": "clxxxxxxxxxxxxxxxx",
  "status": "SHIPPED",
  "updatedAt": "2024-01-15T12:00:00.000Z",
  ...
}
```

### Watch live logs

```bash
aws logs tail /aws/lambda/shelflife-dev-order-status --follow
```

### Verify the DB update

Connect via Prisma Studio (`npx prisma studio` in `backend/`) or psql:

```sql
SELECT id, status, "updatedAt" FROM "Order" WHERE id = '<orderId>';
```

---

## Valid status transitions

```
PENDING → CONFIRMED → SHIPPED → DELIVERED
                              ↘ CANCELLED
```

The Lambda accepts any of the five statuses in any order (no state-machine
enforcement) — same behaviour as the Express route it mirrors.

---

## Tear down

```bash
cd terraform/
terraform destroy
```

All AWS resources are removed. SSM parameters (which hold secrets) are deleted too.

---

## Architecture diagram

```
HTTP Client
    │
    │ PATCH /orders/{orderId}/status
    │ X-Admin-Key: <secret>
    ▼
API Gateway HTTP API (v2)
    │  route: PATCH /orders/{orderId}/status
    │  payload format 2.0
    ▼
AWS Lambda (Node.js 20, arm64)
    │  cold start: fetch secrets from SSM → init pg.Pool
    │  warm:       query pool directly
    ├─▶ SSM Parameter Store (SecureString × 2)
    └─▶ PostgreSQL (Render / RDS / Neon)
```
