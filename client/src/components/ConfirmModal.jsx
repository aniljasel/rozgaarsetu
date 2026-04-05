import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDestructive = false,
    children
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in transform transition-all">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`shrink-0 p-3 rounded-full ${isDestructive ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                            <AlertTriangle size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 leading-6">
                                {title}
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                                {message}
                            </p>
                            {children && (
                                <div className="mt-4 w-full">
                                    {children}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="mt-8 flex gap-3 justify-end">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            variant={isDestructive ? "primary" : "primary"}
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`${isDestructive ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'} shadow-lg`}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
