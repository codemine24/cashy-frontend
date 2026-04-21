import { checkForUpdates, applyOTAUpdate, openStore } from "@/utils/updateService";
import { useEffect, useState } from "react";

export function useAppUpdate() {
  const [loading, setLoading] = useState(true);
  const [update, setUpdate] = useState<any>(null);

  useEffect(() => {
    runCheck();
  }, []);

  const runCheck = async () => {
    setLoading(true);
    const result = await checkForUpdates();
    setUpdate(result);
    setLoading(false);
  };

  const installOTAUpdate = async () => {
    return await applyOTAUpdate();
  };

  const openStoreUpdate = async () => {
    return await openStore();
  };

  return {
    loading,
    update,
    refresh: runCheck,
    installOTAUpdate,
    openStoreUpdate,
  };
}