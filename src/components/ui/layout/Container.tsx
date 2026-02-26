import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'card';
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className = "",
  variant = "default"
}) => {
  const baseClasses = "p-6";
  
  const variantClasses = {
    default: "bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 min-h-screen",
    gradient: "bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800",
    card: "bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}; 