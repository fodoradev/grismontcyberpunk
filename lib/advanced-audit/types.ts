/** An answer snapshot stores primitive response values keyed by stable question ID. */
export type AdvancedAuditAnswers = Record<string, string | number>;

/** The completed report is stored as an immutable, versioned JSON object. */
export type AdvancedAuditReport = Record<string, unknown>;

export type AdvancedAuditSubmission = {
  id: string;
  resumeToken: string;
  contentVersion: string;
  status: "in_progress" | "completed";
  answers: AdvancedAuditAnswers;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
};

export type AdvancedAuditStoredReport = {
  submissionId: string;
  reportToken: string;
  contentVersion: string;
  result: AdvancedAuditReport;
  createdAt: Date;
};

export type CompleteAdvancedAuditResult =
  | { kind: "created"; reportToken: string }
  | { kind: "existing"; reportToken: string }
  | { kind: "not-found" };
