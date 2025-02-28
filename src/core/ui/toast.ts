/**
 * Toast notification utility
 * 
 * This is a simple implementation that can be replaced with a more robust
 * toast library like react-toastify, react-hot-toast, or chakra-ui's toast.
 */

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

// Toast configuration
export interface ToastOptions {
  title?: string;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  onClose?: () => void;
}

// Default options
const defaultOptions: ToastOptions = {
  duration: 5000,
  position: 'top-right'
};

/**
 * Show a toast notification
 * In a real implementation, this would use a toast library
 * @param message - The message to display
 * @param type - The type of toast
 * @param options - Additional options
 */
export const showToast = (
  message: string,
  type: ToastType = 'info',
  options: ToastOptions = {}
): void => {
  const mergedOptions = { ...defaultOptions, ...options };
  const { title } = mergedOptions;
  
  // In development, log to console
  if (process.env.NODE_ENV !== 'production') {
    const titlePrefix = title ? `${title}: ` : '';
    
    switch (type) {
      case 'error':
        console.error(`${titlePrefix}${message}`);
        break;
      case 'warning':
        console.warn(`${titlePrefix}${message}`);
        break;
      case 'success':
        console.log(`%c${titlePrefix}${message}`, 'color: green');
        break;
      default:
        console.info(`${titlePrefix}${message}`);
    }
  }
  
  // In a real implementation, you would call your toast library here
  // Example with react-toastify:
  // toast[type](message, {
  //   position: mergedOptions.position,
  //   autoClose: mergedOptions.duration,
  //   onClose: mergedOptions.onClose,
  //   hideProgressBar: false,
  //   closeOnClick: true,
  //   pauseOnHover: true,
  //   draggable: true,
  // });
};

// Convenience methods
export const toast = {
  success: (message: string, options?: ToastOptions) => showToast(message, 'success', options),
  error: (message: string, options?: ToastOptions) => showToast(message, 'error', options),
  warning: (message: string, options?: ToastOptions) => showToast(message, 'warning', options),
  info: (message: string, options?: ToastOptions) => showToast(message, 'info', options),
}; 