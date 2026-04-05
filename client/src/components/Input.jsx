import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({ label, type = 'text', value, onChange, placeholder, icon: Icon, className = '', disabled, readOnly }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    // Prevent React warning: if value is defined without onChange, it must be readOnly
    const isReadOnly = readOnly || (value !== undefined && !onChange) || false;

    return (
        <div className={`flex flex-col gap-1 w-full ${className}`}>
            {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
            <div className="relative flex items-center">
                <input
                    type={inputType}
                    value={value !== undefined ? value : undefined}
                    onChange={onChange}
                    disabled={disabled}
                    readOnly={isReadOnly}
                    placeholder={placeholder}
                    className={`peer w-full p-3 rounded-xl bg-white/50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200 backdrop-blur-sm placeholder:text-slate-400 text-slate-700 ${Icon ? 'pl-10' : ''} ${isPassword ? 'pr-10' : ''}`}
                />
                {Icon && (
                    <div className="absolute left-3 text-slate-400 peer-focus:text-green-600 transition-colors pointer-events-none">
                        <Icon size={20} />
                    </div>
                )}
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-slate-400 hover:text-green-600 transition-colors focus:outline-none"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Input;
