export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  related_link: string | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: Notification[];
}
