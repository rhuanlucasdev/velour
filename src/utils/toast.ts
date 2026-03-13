import { useToastStore, type ToastType } from "../store/toastStore";

export function toast(message: string, options?: { type?: ToastType }) {
  useToastStore.getState().addToast(message, options?.type);
}
