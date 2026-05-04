import { createContext, useContext } from 'react';

export const ToastContext = createContext(() => {});

// Hook buat akses showToast dari komponen mana aja
export function useShowToast() {
  return useContext(ToastContext);
}
