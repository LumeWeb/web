//#region src/admin-client/abuseManagementAdminAPI.schemas.ts
const CaseType = {
	spam: "spam",
	harassment: "harassment",
	content: "content",
	malware: "malware",
	other: "other"
};
const CaseStatus = {
	new: "new",
	in_progress: "in_progress",
	resolved: "resolved",
	closed: "closed"
};
const CasePriority = {
	low: "low",
	medium: "medium",
	high: "high",
	critical: "critical"
};
const ReportSource = {
	web_form: "web_form",
	email: "email",
	api: "api",
	system: "system"
};
const ScanStatus = {
	in_progress: "in_progress",
	failed: "failed"
};
const CommunicationType = {
	email: "email",
	note: "note",
	response: "response"
};
const CommunicationDirection = {
	incoming: "incoming",
	outgoing: "outgoing",
	internal: "internal",
	external: "external"
};
const EvidenceSource = {
	email: "email",
	web_upload: "web_upload",
	api: "api",
	system: "system"
};
const BlockReason = {
	malware: "malware",
	csam: "csam",
	copyright: "copyright",
	harassment: "harassment",
	hate_speech: "hate_speech",
	spam: "spam",
	system_policy: "policy",
	manual: "manual"
};
const BlockSeverity = {
	critical: "critical",
	high: "high",
	medium: "medium",
	low: "low"
};
const BlockAction = {
	reject: "reject",
	quarantine: "quarantine",
	warn: "warn",
	log: "log"
};
const BlockSource = {
	scanner: "scanner",
	report: "report",
	admin: "admin",
	external: "external"
};

const STATUS_BADGE_CONFIG = {
  [CaseStatus.closed]: {
    base: "bg-purple-100 text-purple-800",
    hover: "hover:bg-purple-100",
    dark: "dark:bg-purple-900/30 dark:text-purple-400",
    label: "Archived"
  },
  [CaseStatus.in_progress]: {
    base: "bg-yellow-100 text-yellow-800",
    hover: "hover:bg-yellow-100",
    dark: "dark:bg-yellow-900/30 dark:text-yellow-400",
    label: "In Progress"
  },
  [CaseStatus.new]: {
    base: "bg-blue-100 text-blue-800",
    hover: "hover:bg-blue-100",
    dark: "dark:bg-blue-900/30 dark:text-blue-400",
    label: "New"
  },
  [CaseStatus.resolved]: {
    base: "bg-green-100 text-green-800",
    hover: "hover:bg-green-100",
    dark: "dark:bg-green-900/30 dark:text-green-400",
    label: "Resolved"
  }
};
const PRIORITY_BADGE_CONFIG = {
  [CasePriority.low]: {
    base: "bg-red-100 text-red-800",
    hover: "hover:bg-red-100",
    dark: "dark:bg-red-900/30 dark:text-red-400",
    label: "Critical"
  },
  [CasePriority.high]: {
    base: "bg-orange-100 text-orange-800",
    hover: "hover:bg-orange-100",
    dark: "dark:bg-orange-900/30 dark:text-orange-400",
    label: "High"
  },
  [CasePriority.critical]: {
    base: "bg-gray-100 text-gray-800",
    hover: "hover:bg-gray-100",
    dark: "dark:bg-gray-800 dark:text-gray-400",
    label: "Low"
  },
  [CasePriority.medium]: {
    base: "bg-blue-100 text-blue-800",
    hover: "hover:bg-blue-100",
    dark: "dark:bg-blue-900/30 dark:text-blue-400",
    label: "Medium"
  }
};
const ACTION_BADGE_CONFIG = {
  [BlockAction.log]: {
    base: "bg-blue-100 text-blue-800",
    dark: "dark:bg-blue-900/30 dark:text-blue-400",
    label: "Log"
  },
  [BlockAction.quarantine]: {
    base: "bg-orange-100 text-orange-800",
    dark: "dark:bg-orange-900/30 dark:text-orange-400",
    label: "Quarantine"
  },
  [BlockAction.reject]: {
    base: "bg-red-100 text-red-800",
    dark: "dark:bg-red-900/30 dark:text-red-400",
    label: "Reject"
  },
  [BlockAction.warn]: {
    base: "bg-yellow-100 text-yellow-800",
    dark: "dark:bg-yellow-900/30 dark:text-yellow-400",
    label: "Warn"
  }
};
const REASON_BADGE_CONFIG = {
  [BlockReason.Copyright]: {
    base: "bg-blue-100 text-blue-800",
    dark: "dark:bg-blue-900/30 dark:text-blue-400",
    label: "Copyright"
  },
  [BlockReason.Csam]: {
    base: "bg-purple-100 text-purple-800",
    dark: "dark:bg-purple-900/30 dark:text-purple-400",
    label: "CSAM"
  },
  [BlockReason.Harassment]: {
    base: "bg-orange-100 text-orange-800",
    dark: "dark:bg-orange-900/30 dark:text-orange-400",
    label: "Harassment"
  },
  [BlockReason.HateSpeech]: {
    base: "bg-pink-100 text-pink-800",
    dark: "dark:bg-pink-900/30 dark:text-pink-400",
    label: "Hate Speech"
  },
  [BlockReason.Malware]: {
    base: "bg-red-100 text-red-800",
    dark: "dark:bg-red-900/30 dark:text-red-400",
    label: "Malware"
  },
  [BlockReason.Manual]: {
    base: "bg-gray-100 text-gray-800",
    dark: "dark:bg-gray-800 dark:text-gray-400",
    label: "Manual"
  },
  [BlockReason.Policy]: {
    base: "bg-green-100 text-green-800",
    dark: "dark:bg-green-900/30 dark:text-green-400",
    label: "Policy"
  },
  [BlockReason.Spam]: {
    base: "bg-yellow-100 text-yellow-800",
    dark: "dark:bg-yellow-900/30 dark:text-yellow-400",
    label: "Spam"
  }
};
const SEVERITY_BADGE_CONFIG = {
  [BlockSeverity.Critical]: {
    base: "bg-red-100 text-red-800",
    dark: "dark:bg-red-900/30 dark:text-red-400",
    label: "Critical"
  },
  [BlockSeverity.High]: {
    base: "bg-orange-100 text-orange-800",
    dark: "dark:bg-orange-900/30 dark:text-orange-400",
    label: "High"
  },
  [BlockSeverity.Low]: {
    base: "bg-gray-100 text-gray-800",
    dark: "dark:bg-gray-800 dark:text-gray-400",
    label: "Low"
  },
  [BlockSeverity.Medium]: {
    base: "bg-blue-100 text-blue-800",
    dark: "dark:bg-blue-900/30 dark:text-blue-400",
    label: "Medium"
  }
};
const SOURCE_BADGE_CONFIG = {
  [BlockSource.Admin]: {
    base: "bg-green-100 text-green-800",
    dark: "dark:bg-green-900/30 dark:text-green-400",
    label: "Admin"
  },
  [BlockSource.External]: {
    base: "bg-orange-100 text-orange-800",
    dark: "dark:bg-orange-900/30 dark:text-orange-400",
    label: "External"
  },
  [BlockSource.Report]: {
    base: "bg-blue-100 text-blue-800",
    dark: "dark:bg-blue-900/30 dark:text-blue-400",
    label: "Report"
  },
  [BlockSource.Scanner]: {
    base: "bg-purple-100 text-purple-800",
    dark: "dark:bg-purple-900/30 dark:text-purple-400",
    label: "Scanner"
  }
};

export { ACTION_BADGE_CONFIG, BlockAction, BlockReason, BlockSeverity, BlockSource, CasePriority, CaseStatus, CaseType, CommunicationDirection, CommunicationType, EvidenceSource, PRIORITY_BADGE_CONFIG, REASON_BADGE_CONFIG, ReportSource, SEVERITY_BADGE_CONFIG, SOURCE_BADGE_CONFIG, STATUS_BADGE_CONFIG, ScanStatus };
