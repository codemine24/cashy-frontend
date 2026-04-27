import React, { useEffect, useRef } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  ModalProps,
  Platform,
  Modal as RNModal,
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
  const slideAnimation = useRef(new Animated.Value(100)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slideAnimation.setValue(300);
      backdropOpacity.setValue(0);

      Animated.parallel([
        Animated.spring(slideAnimation, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 8,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnimation, {
          toValue: 300,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, backdropOpacity, slideAnimation]);

  return (
    <RNModal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
      {...modalProps}
    >
      {/* Backdrop */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          opacity: backdropOpacity,
        }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, justifyContent: "flex-end" }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <Animated.View
          className="bg-background rounded-t-3xl"
          style={{
            transform: [{ translateY: slideAnimation }],
          }}
        >
          <View>{children}</View>
        </Animated.View>
      </KeyboardAvoidingView>

      <Toast />
    </RNModal>
  );
}
