import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

const Toast = ({ id, message, type = 'info', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, 5000);

        return () => clearTimeout(timer);
    }, [id, onClose]);

    const styles = {
        success: {
            icon: <CheckCircle size={20} className="text-emerald-500" />,
            border: 'border-emerald-200',
            bg: 'bg-emerald-50/90',
            indicator: 'bg-emerald-500',
            text: 'text-gray-800'
        },
        error: {
            icon: <AlertCircle size={20} className="text-red-500" />,
            border: 'border-red-200',
            bg: 'bg-red-50/90',
            indicator: 'bg-red-500',
            text: 'text-gray-800'
        },
        warning: {
            icon: <AlertTriangle size={20} className="text-amber-500" />,
            border: 'border-amber-200',
            bg: 'bg-amber-50/90',
            indicator: 'bg-amber-500',
            text: 'text-gray-800'
        },
        info: {
            icon: <Info size={20} className="text-blue-500" />,
            border: 'border-blue-200',
            bg: 'bg-blue-50/90',
            indicator: 'bg-blue-500',
            text: 'text-gray-800'
        }
    };

    const style = styles[type] || styles.info;

    return (
        <div className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl border ${style.border} ${style.bg} shadow-lg backdrop-blur-md animate-fade-in-left transition-all duration-300 transform hover:scale-[1.02] mb-3`}>
            <div className="p-4 flex items-start gap-4">
                <div className="shrink-0 pt-0.5">
                    {style.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${style.text}`}>
                        {message}
                    </p>
                </div>
                <div className="shrink-0 flex items-center">
                    <button
                        onClick={() => onClose(id)}
                        className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
            {/* Progress/Timer Bar aesthetic */}
            <div className={`h-1 w-full ${style.indicator} opacity-20`} />
        </div>
    );
};

export default Toast;
