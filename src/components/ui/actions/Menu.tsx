import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

interface MenuItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  children?: MenuItem[];
}

interface MenuProps {
  items: MenuItem[];
  className?: string;
}

export const Menu: React.FC<MenuProps> = ({
  items,
  className = ""
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenItems(new Set());
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleItem = (value: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(value)) {
      newOpenItems.delete(value);
    } else {
      newOpenItems.add(value);
    }
    setOpenItems(newOpenItems);
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openItems.has(item.value);

    return (
      <div key={item.value}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleItem(item.value);
            } else {
              item.onClick?.();
            }
          }}
          className={`w-full px-4 py-3 text-left text-sm transition-colors flex items-center justify-between ${
            level === 0 
              ? 'text-gray-700 hover:bg-gray-50 rounded-xl' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          style={{ paddingLeft: `${level * 16 + 16}px` }}
        >
          <div className="flex items-center space-x-2">
            {item.icon && <span>{item.icon}</span>}
            <span>{item.label}</span>
          </div>
          {hasChildren && (
            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
          )}
        </button>
        
        {hasChildren && isOpen && (
          <div className="ml-4 border-l border-gray-200">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`} ref={menuRef}>
      {items.map(item => renderMenuItem(item))}
    </div>
  );
}; 