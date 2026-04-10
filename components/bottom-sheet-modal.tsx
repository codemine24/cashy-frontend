import React, { useEffect, useRef } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  ModalProps,
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
      <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
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
      </KeyboardAvoidingView>
      <Toast />
    </RNModal>
  );
}
