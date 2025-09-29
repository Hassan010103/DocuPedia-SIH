// FIX: Removed self-import of 'TeamMember' which was causing a conflict with the local declaration.
export enum Page {
  Dashboard = 'Dashboard',
  Documents = 'Documents',
  Analytics = 'Analytics',
  Teams = 'Teams',
  Inbox = 'Inbox',
  Settings = 'Settings',
  Help = 'Help',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  avatarUrl: string;
}

export type TeamMemberRole = 'Admin' | 'Editor' | 'Viewer';
export type TeamMemberStatus = 'Active' | 'Invited' | 'Inactive';

export interface TeamMember {
  id: string;
  name:string;
  email: string;
  role: TeamMemberRole;
  team: string;
  status: TeamMemberStatus;
  joinDate: string;
  documentsOwned: number;
  avatarUrl: string;
}

export interface DocumentVersion {
  version: number;
  date: string;
  editor: string;
  change: string;
}

export interface Annotation {
    id: string;
    user: { name: string; avatarUrl: string };
    text: string;
    timestamp: string;
}

export interface TimelineEvent {
  type: 'Created' | 'Viewed' | 'Edited' | 'Shared' | 'Summarized' | 'Archived' | 'Signed';
  user: string; // User's name
  timestamp: string;
  details?: string; // e.g., "Shared with Ananya"
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  owner: string;
  uploadedAt: string;
  status: 'summarized' | 'new' | 'error' | 'generating';
  summary?: string;
  tags: string[];
  versions: DocumentVersion[];
  annotations: Annotation[];
  deadline?: string;
  thumbnailUrl?: string;
  department: 'Finance' | 'Marketing' | 'Safety & Compliance' | 'Engineering & Design' | 'HR' | 'Legal' | 'Operations' | 'IT';
  priority: 'High' | 'Medium' | 'Low';
  timeline: TimelineEvent[];
  entities?: string[];
  smartScore: number;
  signature?: string;
}

export interface Notification {
  id: string;
  type: 'summary_ready' | 'share' | 'new_document' | 'mention' | 'error';
  message: string;
  time: string;
  read: boolean;
}

export interface AIAnalysisResult {
    authenticity: {
        score: number;
        reasoning: string;
    };
    keyPoints: string[];
    summary: string;
    suggestedActions: {
        action: string;
        reasoning: string;
        target: string;
    }[];
    reminders: {
        date: string;
        description: string;
    }[];
}

export interface InboxDocument {
    id: string;
    name: string;
    type: string;
    size: string;
    source: 'Email' | 'WhatsApp' | 'API Upload';
    sender: string;
    receivedAt: string;
    isProcessing?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// Knowledge Graph Types
export type NodeType = 'document' | 'user' | 'entity' | 'department';

export interface GraphNode {
    id: string;
    label: string;
    type: NodeType;
    data: Document | TeamMember | { name: string } | { department: string };
    x: number;
    y: number;
    vx: number; // velocity x
    vy: number; // velocity y
}

export interface GraphEdge {
    id: string;
    source: string;
    target: string;
    label: string;
}