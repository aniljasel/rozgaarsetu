import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, message, type }]);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const contextValue = {
        showToast,
        removeToast,
        // Helper methods for cleaner usage
        success: (message) => showToast(message, 'success'),
        error: (message) => showToast(message, 'error'),
        warning: (message) => showToast(message, 'warning'),
        info: (message) => showToast(message, 'info'),
    };

    return (
        <ToastContext.Provider value={contextValue}>
            {children}

            {/* Toast Container - Fixed Position */}
            <div
                aria-live="assertive"
                className="pointer-events-none fixed inset-0 flex flex-col items-end px-4 py-6 sm:p-6 z-9999"
            >
                <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
                    {toasts.map((toast) => (
                        <Toast
                            key={toast.id}
                            id={toast.id}
                            message={toast.message}
                            type={toast.type}
                            onClose={removeToast}
                        />
                    ))}
                </div>
            </div>
        </ToastContext.Provider>
    );
};
