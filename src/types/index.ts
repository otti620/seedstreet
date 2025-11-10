// src/types/index.ts

// Define TypeScript interfaces for data structures

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_id: number | null;
  email: string | null;
  name: string | null;
  role: 'investor' | 'founder' | 'admin' | null;
  onboarding_complete: boolean;
  bookmarked_startups: string[];
  interested_startups: string[];
  bio: string | null;
  location: string | null;
  phone: string | null;
  last_seen: string | null;
  show_welcome_flyer: boolean;
  total_committed: number;
  pro_account: boolean;
}

export interface Startup {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  pitch: string;
  description: string | null;
  category: string;
  room_members: number;
  active_chats: number;
  interests: number;
  founder_name: string;
  location: string;
  founder_id: string;
  amount_sought: number | null;
  currency: string | null;
  funding_stage: string | null;
  ai_risk_score: number | null;
  market_trend_analysis: string | null;
  amount_raised: number;
  valuation: number | null;
  status: 'Pending' | 'Approved' | 'Rejected'; // Added status
  date_created?: string; // Added for AdminDashboard
  views?: number; // Added for FounderDashboard
}

export interface Chat {
  id: string;
  startup_id: string;
  startup_name: string;
  startup_logo: string;
  last_message_text: string;
  last_message_timestamp: string;
  unread_count: number;
  investor_id: string;
  founder_id: string;
  user_ids: string[];
  unread_counts: { [key: string]: number };
  investor_name: string; // Added
  founder_name: string; // Added
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_name: string;
  text: string;
  created_at: string;
  read: boolean;
}

export interface CommunityPost {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar_id: number | null;
  content: string;
  image_url: string | null;
  created_at: string;
  likes: string[];
  comments_count: number;
  is_hidden: boolean;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_avatar_id: number | null;
  content: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
  related_entity_id: string | null;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  type: string;
  description: string;
  timestamp: string;
  entity_id: string | null;
  icon: string | null;
}

export interface FlaggedMessage {
  id: string;
  message_id: string;
  original_message_id: string | null;
  chat_id: string;
  sender: string;
  sender_id: string | null;
  chat_type: 'DM' | 'Community';
  startup_name: string | null;
  reason: string;
  timestamp: string;
  status: 'Pending' | 'Resolved' | 'Dismissed';
  reported_by: string;
}

export interface ScreenParams {
  startupId?: string;
  startupName?: string;
  postId?: string;
  chat?: Chat;
  chatId?: string;
  authActionType?: 'forgotPassword' | 'changePassword';
  startupRoomId?: string;
}

export interface MaintenanceModeSettings {
  enabled: boolean;
  message: string;
}

export interface MaintenanceModeScreenProps { // Moved here
  message?: string;
}