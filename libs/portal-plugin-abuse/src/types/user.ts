export enum UserRole {
  Admin = "admin",
  Agent = "agent",
  Manager = "manager",
  Viewer = "viewer",
}

export interface UserResponse {
  avatar?: string;
  createdAt: string;
  department?: string;
  email: string;
  id: number;
  isActive: boolean;
  lastActiveAt?: string;
  name: string;
  role: UserRole;
}

export type UserType = "business" | "premium" | "standard";
