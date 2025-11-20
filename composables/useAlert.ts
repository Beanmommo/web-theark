/**
 * Composable for showing alert snackbars
 * Provides a simple API to show success, error, warning, and info messages
 */

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertState {
  show: boolean;
  message: string;
  type: AlertType;
  timeout: number;
}

const alertState = ref<AlertState>({
  show: false,
  message: '',
  type: 'info',
  timeout: 5000,
});

export const useAlert = () => {
  const showAlert = (
    message: string,
    type: AlertType = 'info',
    timeout: number = 5000
  ) => {
    alertState.value = {
      show: true,
      message,
      type,
      timeout,
    };
  };

  const showSuccess = (message: string, timeout: number = 5000) => {
    showAlert(message, 'success', timeout);
  };

  const showError = (message: string, timeout: number = 5000) => {
    showAlert(message, 'error', timeout);
  };

  const showWarning = (message: string, timeout: number = 5000) => {
    showAlert(message, 'warning', timeout);
  };

  const showInfo = (message: string, timeout: number = 5000) => {
    showAlert(message, 'info', timeout);
  };

  const hideAlert = () => {
    alertState.value.show = false;
  };

  return {
    alertState: readonly(alertState),
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideAlert,
  };
};

