import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (href: string) => void;
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  onNavigate,
  className = ""
}) => {
  return (
    <nav className={`flex items-center space-x-2 text-sm text-gray-500 ${className}`}>
      <button
        onClick={() => onNavigate?.('/')}
        className="flex items-center hover:text-gray-700 transition-colors"
      >
        <Home className="w-4 h-4 mr-1" />
        Accueil
      </button>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4" />
          {item.href ? (
            <button
              onClick={() => onNavigate?.(item.href!)}
              className="hover:text-gray-700 transition-colors"
            >
              {item.label}
            </button>
          ) : (
                            <span className="text-gray-900 dark:text-white font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}; 