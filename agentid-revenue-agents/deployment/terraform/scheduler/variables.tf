variable "project_id" {
  description = "Google Cloud project hosting AgentID."
  type        = string
}

variable "project_number" {
  description = "Numeric Google Cloud project identifier."
  type        = string
}

variable "region" {
  description = "Region for Cloud Scheduler and Agent Runtime."
  type        = string
}

variable "reasoning_engine_id" {
  description = "Deployed Agent Runtime reasoning engine ID."
  type        = string
}

variable "schedule" {
  description = "Unix cron cadence for the revenue cycle."
  type        = string
  default     = "0 */6 * * *"
}

variable "time_zone" {
  description = "IANA time zone used to interpret the schedule."
  type        = string
  default     = "Etc/UTC"
}

variable "paused" {
  description = "Whether the schedule is paused."
  type        = bool
  default     = true
}
