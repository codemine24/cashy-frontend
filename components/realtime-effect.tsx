import { useAuth } from "@/context/auth-context";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";

export const RealtimeEffect = () => {
    const { authState } = useAuth();
    const userId = authState.user?.id;

    useRealtimeNotifications(userId);

    return null;
};
