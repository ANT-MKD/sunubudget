import React from 'react';

interface ListProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'card' | 'minimal';
}

export const List: React.FC<ListProps> = ({
  children,
  className = "",
  variant = "default"
}) => {
  const variantClasses = {
    default: "space-y-4",
    card: "space-y-4",
    minimal: "space-y-2"
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

interface ListItemProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'card' | 'minimal';
  onClick?: () => void;
}

export const ListItem: React.FC<ListItemProps> = ({
  children,
  className = "",
  variant = "default",
  onClick
}) => {
  const variantClasses = {
    default: "p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300",
    card: "p-6 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1",
    minimal: "p-3 hover:bg-gray-50 rounded-lg transition-colors"
  };

  const baseClasses = variantClasses[variant];
  const interactiveClasses = onClick ? "cursor-pointer" : "";

  return (
    <div 
      className={`${baseClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}; 