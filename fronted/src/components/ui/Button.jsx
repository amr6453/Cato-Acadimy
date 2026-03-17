import React from 'react';

const variants = {
  primary: 'bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary-hover active:scale-[0.98]',
  ghost: 'bg-transparent text-primary border-2 border-primary/20 hover:bg-primary/5',
  danger: 'bg-red-500 text-white shadow-xl shadow-red-500/20 hover:bg-red-600',
  navy: 'bg-dark-card text-white hover:bg-slate-800',
  glass: 'glass text-white hover:bg-white/10 px-6 py-2.5 rounded-full',
};

const sizes = {
  sm: 'px-4 py-2 text-[13px]',
  md: 'px-6 py-3 text-[15px]',
  lg: 'px-8 py-3.5 text-base',
};

const Spinner = () => (
  <span className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
);

const Button = React.forwardRef(function Button(
  {
    children,
    variant = 'primary',
    loading = false,
    disabled = false,
    icon: Icon,
    fullWidth = false,
    size = 'md',
    className = '',
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold font-inherit rounded-2xl
        transition-all duration-200
        ${fullWidth ? 'w-full' : 'w-auto'}
        ${variants[variant]}
        ${sizes[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed scale-100' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Spinner />
      ) : (
        Icon && <Icon size={size === 'sm' ? 14 : 18} />
      )}
      {children}
    </button>
  );
});

export default Button;
