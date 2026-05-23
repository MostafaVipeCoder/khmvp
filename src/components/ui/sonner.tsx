import { Alert, Platform } from 'react-native';

const showNativeAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    alert(title ? `${title}: ${message}` : message);
  } else {
    Alert.alert(title, message, [{ text: 'حسناً / OK' }]);
  }
};

const toastFn = (message: string, _options?: any) => {
  showNativeAlert('', message);
  return 'toast-id';
};

export const toast = Object.assign(toastFn, {
  success: (message: string, _options?: any) => {
    showNativeAlert('نجاح', message);
    return 'toast-id';
  },
  error: (message: string, _options?: any) => {
    showNativeAlert('خطأ', message);
    return 'toast-id';
  },
  info: (message: string, _options?: any) => {
    showNativeAlert('معلومات', message);
    return 'toast-id';
  },
  warning: (message: string, _options?: any) => {
    showNativeAlert('تنبيه', message);
    return 'toast-id';
  },
  loading: (_message: string, _options?: any) => {
    return 'toast-id';
  },
  dismiss: (_id?: string) => {},
});

export const Toaster = (_props: any) => null;
export type ToasterProps = any;

