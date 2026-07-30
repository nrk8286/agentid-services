locals {
  job_name = "agentid-revenue-cycle-6h"
  trigger_uri = join("", [
    "https://${var.region}-aiplatform.googleapis.com/reasoningEngines/v1/",
    "projects/${var.project_number}/locations/${var.region}/",
    "reasoningEngines/${var.reasoning_engine_id}/api/apps/app/trigger/pubsub",
  ])
  event = jsondecode(file("${path.module}/../../scheduled-revenue-cycle.json"))
  pubsub_envelope = {
    message = {
      data = base64encode(jsonencode(local.event))
      attributes = {
        source = "cloud_scheduler"
      }
    }
    subscription = "projects/${var.project_id}/subscriptions/${local.job_name}"
  }
}

resource "google_project_service" "cloud_scheduler" {
  project            = var.project_id
  service            = "cloudscheduler.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "secret_manager" {
  project            = var.project_id
  service            = "secretmanager.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "gmail" {
  project            = var.project_id
  service            = "gmail.googleapis.com"
  disable_on_destroy = false
}

resource "google_secret_manager_secret" "runtime_token" {
  project   = var.project_id
  secret_id = "agentid-runtime-token"

  replication {
    auto {}
  }

  depends_on = [google_project_service.secret_manager]
}

resource "google_secret_manager_secret_iam_member" "runtime_token_accessor" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.runtime_token.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:service-${var.project_number}@gcp-sa-aiplatform-re.iam.gserviceaccount.com"
}

resource "google_service_account" "scheduler" {
  project      = var.project_id
  account_id   = "agentid-revenue-scheduler"
  display_name = "AgentID Revenue Scheduler"

  depends_on = [google_project_service.cloud_scheduler]
}

resource "google_project_iam_custom_role" "reasoning_engine_invoker" {
  project     = var.project_id
  role_id     = "agentidRevenueInvoker"
  title       = "AgentID Revenue Runtime Invoker"
  description = "Can invoke Agent Runtime without administering Vertex AI resources."
  permissions = [
    "aiplatform.reasoningEngines.query",
  ]
}

resource "google_project_iam_member" "scheduler_runtime_invoker" {
  project = var.project_id
  role    = google_project_iam_custom_role.reasoning_engine_invoker.name
  member  = "serviceAccount:${google_service_account.scheduler.email}"
}

resource "google_cloud_scheduler_job" "revenue_cycle" {
  project     = var.project_id
  region      = var.region
  name        = local.job_name
  description = "Runs the policy-controlled AgentID revenue cycle every six hours."
  schedule    = var.schedule
  time_zone   = var.time_zone
  paused      = var.paused

  attempt_deadline = "600s"

  retry_config {
    retry_count          = 3
    max_retry_duration   = "600s"
    min_backoff_duration = "30s"
    max_backoff_duration = "120s"
    max_doublings        = 2
  }

  http_target {
    uri         = local.trigger_uri
    http_method = "POST"
    body        = base64encode(jsonencode(local.pubsub_envelope))

    headers = {
      "Content-Type" = "application/json"
    }

    oauth_token {
      service_account_email = google_service_account.scheduler.email
      scope                 = "https://www.googleapis.com/auth/cloud-platform"
    }
  }

  depends_on = [
    google_project_iam_member.scheduler_runtime_invoker,
    google_project_service.cloud_scheduler,
  ]
}
