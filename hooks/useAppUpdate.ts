import { useState } from 'react';
import { checkForUpdates, openPlayStore, UpdateCheckResult } from '@/utils/updateService';

export function useAppUpdate() {
  const [updateCheckResult, setUpdateCheckResult] = useState<UpdateCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const checkUpdates = async () => {
    setIsChecking(true);
    try {
      const result = await checkForUpdates();
      setUpdateCheckResult(result);
      
      if (result.hasUpdate && result.versionInfo) {
        setShowModal(true);
      }
    } catch (error) {
      console.error('Failed to check updates:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleUpdateNow = async () => {
    try {
      await openPlayStore();
    } catch (error) {
      console.error('Failed to open Play Store:', error);
    }
  };

  const handleSkip = () => {
    setShowModal(false);
  };

  const isForceUpdate = updateCheckResult?.versionInfo?.isForceUpdate || false;

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