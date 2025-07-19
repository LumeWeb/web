// Import types from Admin schema (prioritized for shared types)
import type {
  BlockContentResponse,
  CaseAnalyticsResponse,
  CaseResponse,
  CommunicationResponse,
  ErrorResponse,
  EvidenceResponse,
  GlobalSearchResponse,
  PaginationInfo,
  ReporterResponse,
  ScanResponse,
  ScanResultResponse,
  SubjectResponse,
  BlockContentCreateRequest,
  BlockListResponse,
  CaseUpdateRequest,
  CommunicationUpdateRequest,
  // BlocklistFilterParams,
} from "./admin-client/abuseManagementAdminAPI.schemas";
import {
  CasePriority,
  CaseStatus,
  CaseType,
  ReportSource,
  BlockAction,
  BlockReason,
  BlockSeverity,
  BlockSource,
  CommunicationDirection,
  CommunicationType,
  ScanStatus,
  EvidenceSource,
} from "./admin-client/abuseManagementAdminAPI.schemas";

// Import types unique to User schema
import type {
  AbuseReportRequest,
  AbuseReportResponse,
  AttachmentUploadResponse,
  JWTResponse,
  PublicCaseResponse,
  TokenRefreshRequest,
  TokenRefreshResponse,
  ValidateTokenResponse,
} from "./user-client/abuseReportAPI.schemas";

// Import Admin HTTP APIs
export * from "./admin-client/analytics";
export * from "./admin-client/authenticated";
export * from "./admin-client/blocklist";
export * from "./admin-client/cases";
export * from "./admin-client/communications";
export * from "./admin-client/evidence";
export * from "./admin-client/reporters";
export * from "./admin-client/scans";
export * from "./admin-client/search";
export * from "./admin-client/subjects";

// Import User HTTP APIs
export * from "./user-client/default";

// Manually define types that were ONLY in the deleted types folder
export interface Attachment {
  content_type: string;
  filename: string;
  id: string;
  size: number;
  uploaded_at: string;
}

export enum RefineResource {
  AbuseReport = "reports",
  Blocklist = "blocklist",
  Case = "cases",
  Communication = "communication",
  CaseCommunication = "case.communication",
  CaseEvidence = "case.evidence",
  Evidence = "evidence",
  Reporter = "reporter",
  ReporterCase = "reporter-case",
  Scan = "scan",
  ScanResult = "scan-result",
  Subject = "subject",
  SubjectCase = "subject-case",
}

// Re-export all types
export type {
  CommunicationResponse,
  AbuseReportRequest,
  CaseResponse,
  ReporterResponse,
  SubjectResponse,
  ScanResponse,
  ScanResultResponse,
  EvidenceResponse,
  BlockContentResponse,
  CaseAnalyticsResponse,
  GlobalSearchResponse,
  PaginationInfo,
  ErrorResponse,
  BlockContentCreateRequest,
  BlockListResponse,
  CaseUpdateRequest,
  CommunicationUpdateRequest,
  /*  BlockContentRequest,
  BlockedContentListResponse,*/

  // From User schema
  AbuseReportResponse,
  AttachmentUploadResponse,
  JWTResponse,
  PublicCaseResponse,
  TokenRefreshRequest,
  TokenRefreshResponse,
  ValidateTokenResponse,
};

export {
  // From Admin schema
  CasePriority,
  CaseStatus,
  CaseType,
  ReportSource,
  BlockAction,
  BlockReason,
  BlockSeverity,
  BlockSource,
  CommunicationDirection,
  CommunicationType,
  ScanStatus,
  EvidenceSource,
};
