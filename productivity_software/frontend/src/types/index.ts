/**
 * Common types for the application
 */

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_image?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  created_at: string;
  updated_at: string;
  assignee_id?: string;
  creator_id: string;
  project_id?: string;
  tags?: string[];
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
  ARCHIVED = 'archived'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Project Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
  members: string[];
  color?: string;
}

// Calendar Event Types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  created_at: string;
  updated_at: string;
  creator_id: string;
  participants: string[];
  is_all_day: boolean;
  recurrence_rule?: string;
}

// Document Types
export interface Document {
  id: string;
  title: string;
  content?: string;
  type: DocumentType;
  created_at: string;
  updated_at: string;
  owner_id: string;
  folder_id?: string;
  shared_with: string[];
  version: number;
  size?: number;
  file_url?: string;
}

export enum DocumentType {
  TEXT = 'text',
  SPREADSHEET = 'spreadsheet',
  PRESENTATION = 'presentation',
  PDF = 'pdf',
  IMAGE = 'image',
  OTHER = 'other'
}

// Notification Types
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  action_url?: string;
  sender_id?: string;
  recipient_id: string;
}

export enum NotificationType {
  TASK_ASSIGNED = 'task_assigned',
  TASK_COMPLETED = 'task_completed',
  COMMENT_ADDED = 'comment_added',
  DOCUMENT_SHARED = 'document_shared',
  MEETING_REMINDER = 'meeting_reminder',
  SYSTEM = 'system'
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Error Types
export interface ApiError {
  message: string;
  field?: string;
  code?: string;
}

// Form Types
export interface LoginFormValues {
  email: string;
  password: string;
}

// Component Prop Types
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark' | 'light' | 'link';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
} 