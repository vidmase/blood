import React, { useState } from 'react';
import ESHClassificationModal from './ESHClassificationModal';
import { useLocalization } from '../context/LocalizationContext';

interface ESHClassificationButtonProps {
  variant?: 'primary' | 'secondary' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export const ESHClassificationButton: React.FC<ESHClassificationButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children
}) => {
  const { t } = useLocalization();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg';
      case 'secondary':
        return 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50 shadow-sm hover:shadow-md';
      case 'minimal':
        return 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50';
      default:
        return 'bg-indigo-600 text-white hover:bg-indigo-700';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-xs';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`
          inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-200
          ${getVariantClasses()}
          ${getSizeClasses()}
          ${className}
        `}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {children || t('esh.title')}
      </button>

      <ESHClassificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

// Quick access components for common use cases
export const ESHQuickButton: React.FC<{ className?: string }> = ({ className }) => (
  <ESHClassificationButton
    variant="minimal"
    size="sm"
    className={className}
  >
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    ESH Guide
  </ESHClassificationButton>
);

export const ESHHeaderButton: React.FC<{ className?: string }> = ({ className }) => (
  <ESHClassificationButton
    variant="secondary"
    size="md"
    className={className}
  >
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    ESH Classification
  </ESHClassificationButton>
);
