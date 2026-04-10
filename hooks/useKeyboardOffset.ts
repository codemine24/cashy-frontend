import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

/**
 * Custom hook to manage keyboard offset for forms
 * Returns dynamic offset value that changes based on keyboard state
 * - 40px when keyboard is hidden (minimal spacing)
 * - 100px when keyboard is shown (pushes content above keyboard)
 */
export function useKeyboardOffset() {
  const [keyboardOffset, setKeyboardOffset] = useState(40);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardOffset(100);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardOffset(40);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return keyboardOffset;
}
