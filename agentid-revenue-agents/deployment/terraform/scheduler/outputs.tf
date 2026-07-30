output "job_name" {
  description = "Cloud Scheduler job resource name."
  value       = google_cloud_scheduler_job.revenue_cycle.id
}

output "job_state" {
  description = "Configured schedule state."
  value       = var.paused ? "PAUSED" : "ENABLED"
}

output "trigger_uri" {
  description = "Agent Runtime ambient trigger URI."
  value       = local.trigger_uri
}

output "scheduler_service_account" {
  description = "Least-privilege identity used by Cloud Scheduler."
  value       = google_service_account.scheduler.email
}
