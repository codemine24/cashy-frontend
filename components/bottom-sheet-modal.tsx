import React, { useEffect, useRef } from "react";
import {
  Animated,
  ModalProps,
  Modal as RNModal,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

interface BottomSheetModalProps extends ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomSheetModal({
  visible,
  onClose,
  children,
  ...modalProps
}: BottomSheetModalProps) {
  const slideAnimation = useRef(new Animated.Value(200)).current;

  useEffect(() => {
    if (visible) {
      slideAnimation.setValue(200); // Reset to starting position
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnimation, {
        toValue: 200,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnimation]);

  return (
    <RNModal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
      {...modalProps}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.4)" barStyle="light-content" />
      <View className="flex-1 bg-black/40">
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          className="bg-background rounded-t-3xl"
          style={{
            transform: [{ translateY: slideAnimation }],
          }}
        >
          {children}
        </Animated.View>
      </View>
      <Toast />
    </RNModal>
  );
}
