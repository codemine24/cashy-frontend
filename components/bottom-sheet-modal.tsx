import React, { useEffect, useRef } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  ModalProps,
  Modal as RNModal,
  Platform,
  TouchableOpacity,
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
  const slideAnimation = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      slideAnimation.setValue(300);
      Animated.spring(slideAnimation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnimation, {
        toValue: 300,
        duration: 250,
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
      {/* Backdrop — fully covers screen behind sheet */}
      <TouchableOpacity
        style={{
          position: "absolute", // 👈 absolute so it doesn't affect sheet position
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Sheet anchored to bottom */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"} // 👈 padding on iOS
        style={{
          position: "absolute", // 👈 anchor to bottom, no gap
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <Animated.View
          className="bg-background rounded-t-3xl pb-3"
          style={{
            transform: [{ translateY: slideAnimation }],
          }}
        >
          {children}
        </Animated.View>
      </KeyboardAvoidingView>

      <Toast />
    </RNModal>
  );
}