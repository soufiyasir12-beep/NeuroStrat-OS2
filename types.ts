export type Priority = 'High' | 'Medium' | 'Low';

export interface Task {
  id?: number;
  title: string;
  isCompleted: boolean;
  parentId?: number | null;
  createdAt: Date;
  expanded?: boolean;
  priority: Priority;
}

export interface Email {
  id?: number;
  to: string;
  from?: string;
  subject: string;
  body: string;
  status: 'draft' | 'sent' | 'received';
  createdAt: Date;
  sentAt?: Date;
}

export enum View {
  ZEN_TODO = 'ZEN_TODO',
  EMAIL_HUB = 'EMAIL_HUB',
  WHITEBOARD = 'WHITEBOARD',
}

export interface ApiError {
  message: string;
  code?: string;
}