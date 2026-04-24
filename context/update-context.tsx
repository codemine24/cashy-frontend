import React, { createContext, ReactNode, useContext, useState } from "react";

interface UpdateContextType {
  isModalSkipped: boolean;
  skipModal: () => void;
  resetModalState: () => void;
}

const UpdateContext = createContext<UpdateContextType | undefined>(undefined);

interface UpdateProviderProps {
  children: ReactNode;
}

export function AppUpdateProvider({ children }: UpdateProviderProps) {
  const [isModalSkipped, setIsModalSkipped] = useState(false);

  const skipModal = () => {
    setIsModalSkipped(true);
  };

  const resetModalState = () => {
    setIsModalSkipped(false);
  };

  const value: UpdateContextType = {
    isModalSkipped,
    skipModal,
    resetModalState,
  };

  return (
    <UpdateContext.Provider value={value}>{children}</UpdateContext.Provider>
  );
}

export function useAppUpdateContext() {
  const context = useContext(UpdateContext);
  if (context === undefined) {
    throw new Error("useAppUpdateContext must be used within an UpdateProvider");
  }
  return context;
}
