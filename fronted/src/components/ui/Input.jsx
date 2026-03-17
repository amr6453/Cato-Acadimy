import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = React.forwardRef(function Input(
  { label, id, type = 'text', error, icon: Icon, className = '', ...props },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label
          htmlFor={id}
          className="text-[13px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider"
        >
          {label}
        </label>
      )}

      <div className="relative w-full group">
        {Icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
            <Icon size={18} />
          </span>
        )}

        <input
          ref={ref}
          id={id}
          type={inputType}
          className={`
            w-full transition-all duration-200 outline-none font-inherit text-[15px] rounded-2xl
            border-2 bg-transparent text-slate-900 dark:text-white
            ${Icon ? 'pl-12' : 'pl-4'}
            ${isPassword ? 'pr-12' : 'pr-4'}
            py-4
            ${error 
              ? 'border-red-500/50 bg-red-50/10 dark:bg-red-500/5 focus:border-red-500 ring-0' 
              : 'border-slate-100 dark:border-white/5 focus:border-primary/50 focus:bg-white/5 dark:focus:bg-white/5 focus:shadow-lg focus:shadow-primary/5 ring-0'}
            ${className}
          `}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors p-1"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <span className="text-[12px] text-red-500 font-bold ml-1">
          {error}
        </span>
      )}
    </div>
  );
});

export default Input;
