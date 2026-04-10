import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export const useRealtimeNotifications = (userId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to changes in the 'notification' table
    const channel = supabase
      .channel("realtime_notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notification",
          // Only filter by user_id if provided
          ...(userId ? { filter: `user_id=eq.${userId}` } : {}),
        },
        (payload) => {
          // Invalidate relevant queries to update UI
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          queryClient.invalidateQueries({ queryKey: ["books"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
};
