import React from "react";
import { ModalProps, Modal as RNModal } from "react-native";
import Toast from "react-native-toast-message";

export function AppModal(props: ModalProps) {
  return (
    <RNModal {...props}>
      {props.children}
      {/* 
        Injects a Toast instance into every modal so that alerts 
        render above the modal overlay instead of behind it.
      */}
      <Toast />
    </RNModal>
  );
}
