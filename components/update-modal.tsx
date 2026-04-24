import { Button } from '@/components/ui/button';
import { H3, Muted, P } from '@/components/ui/typography';
import { CrossIcon } from '@/icons/cross-icon';
import { Modal, TouchableOpacity, View } from 'react-native';
import { VersionInfo } from '@/utils/updateService';

interface UpdateModalProps {
  visible: boolean;
  versionInfo?: VersionInfo;
  onUpdateNow: () => void;
  onSkip: () => void;
  isForceUpdate?: boolean;
}

export function UpdateModal({
  visible,
  versionInfo,
  onUpdateNow,
  onSkip,
  isForceUpdate = false,
}: UpdateModalProps) {
  
  const handleUpdateNow = () => {
    onUpdateNow();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={isForceUpdate ? () => {} : onSkip}
      statusBarTranslucent={true}
    >
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="bg-background rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <H3 className="flex-1">
              {isForceUpdate ? 'Update Required' : 'Update Available'}
            </H3>
            {!isForceUpdate && (
              <TouchableOpacity
                onPress={onSkip}
                className="p-1"
              >
                <CrossIcon className="size-4 text-foreground" />
              </TouchableOpacity>
            )}
          </View>

          {/* Message */}
          <View className="mb-6">
            <Muted className="mb-3">
              {isForceUpdate 
                ? 'This update is required to continue using the app. Please update to the latest version.'
                : 'A new version of Cashy is available with improvements and new features.'
              }
            </Muted>
            
            {versionInfo && (
              <View className="bg-muted/50 rounded-lg p-3">
                <P className="text-sm font-medium text-foreground mb-1">
                  Version {versionInfo.version}
                </P>
                {versionInfo.release_notes && (
                  <Muted className="text-sm leading-5">
                    {versionInfo.release_notes}
                  </Muted>
                )}
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View className={isForceUpdate ? '' : 'flex-row gap-3'}>
            {!isForceUpdate && (
              <Button
                onPress={onSkip}
                className="flex-1"
                variant="outline"
                size="sm"
              >
                <View className="flex-row items-center justify-center">
                  <Muted className="text-foreground font-medium">Skip</Muted>
                </View>
              </Button>
            )}

            <Button
              onPress={handleUpdateNow}
              className={isForceUpdate ? 'w-full' : 'flex-1'}
              size="sm"
            >
              <View className="flex-row items-center justify-center">
                <Muted className="text-primary-foreground font-medium">
                  Update Now
                </Muted>
              </View>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}