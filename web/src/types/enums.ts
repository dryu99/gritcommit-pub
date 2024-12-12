export enum ScheduleType {
  Once = "ONCE",
  Recurring = "RECURRING",
}

export enum GoalEntryStatus {
  Pending = "PENDING", // due date is still far away
  CommitterVerifying = "COMMITTER_VERIFYING", // due date is today, daily cron job triggers this
  PartnerVerifying = "PARTNER_VERIFYING", // committer email response response triggers this
  Completed = "COMPLETED",
  Failed = "FAILED",
}
