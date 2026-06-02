import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface UIContextType {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const UIContext = createContext<UIContextType>({
  isModalOpen: false,
  openModal: () => {},
  closeModal: () => {},
});

export function UIProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);
  return (
    <UIContext.Provider value={{ isModalOpen, openModal, closeModal }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  return useContext(UIContext);
}
