// Admin AI Usage Management Types

export type AdminAIUsage = {
  id: string;
  user_id: string;
  usage_date: string;
  predictions_used: number;
  insights_used: number;
  chatbot_used: number;
  total_used: number;
  created_at: string;
  updated_at: string;
  // Joined data
  user_email?: string;
  user_name?: string;
  user_avatar?: string;
};

export type AdminAIUsageStats = {
  totalUsage: number;
  totalUsers: number;
  avgUsagePerUser: number;
  usageGrowth: { date: string; count: number }[];
  featureDistribution: { feature: string; count: number; percentage: number }[];
  // New helpful metrics
  activeUsersToday: number;
  usersAtLimit: number;
  peakUsageHour: number | null;
  topFeature: { name: string; count: number };
  dailyGrowth: number; // percentage
  topUsers: { 
    user_id: string; 
    email: string; 
    full_name?: string | null;
    avatar_url?: string | null;
    total_usage: number; 
    predictions_used: number;
    insights_used: number;
    chatbot_used: number;
  }[];
};

export type AdminAIUsageFilters = {
  startDate?: string;
  endDate?: string;
  userId?: string;
  minUsage?: number;
  maxUsage?: number;
};
