import { useAppUpdateContext } from "@/context/update-context";
import {
  checkForUpdates,
  openPlayStore,
  UpdateCheckResult,
} from "@/utils/updateService";
import { useCallback, useState } from "react";

export function useAppUpdate() {
  const [updateCheckResult, setUpdateCheckResult] =
    useState<UpdateCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { isModalSkipped, skipModal } = useAppUpdateContext();

  const checkUpdates = useCallback(async () => {
    // Check if user has already skipped the update modal
    if (isModalSkipped) {
      console.log("Update modal already skipped, skipping update check");
      return;
    }

    console.log("Checking for updates...");
    setIsChecking(true);

    try {
      const result = await checkForUpdates();
      setUpdateCheckResult(result);

      if (result.hasUpdate && result.versionInfo) {
        console.log("Update available, showing modal");
        setShowModal(true);
      } else {
        console.log("No update available");
      }
    } catch (error) {
      console.error("Failed to check updates:", error);
    } finally {
      setIsChecking(false);
    }
  }, [isModalSkipped]);

  const handleUpdateNow = async () => {
    try {
      await openPlayStore();
    } catch (error) {
      console.error("Failed to open Play Store:", error);
    }
  };

  const handleSkip = () => {
    setShowModal(false);
    skipModal();
  };

  const isForceUpdate = updateCheckResult?.versionInfo?.is_force_update;

  return {
    isChecking,
    showModal,
    versionInfo: updateCheckResult?.versionInfo,
    isForceUpdate,
    checkUpdates,
    handleUpdateNow,
    handleSkip,
  };
}
