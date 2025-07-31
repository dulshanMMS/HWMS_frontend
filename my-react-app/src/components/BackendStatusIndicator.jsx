import React from 'react';
import { FaCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import useBackendStatus from '../hooks/useBackendStatus';

/**
 * BackendStatusIndicator - Shows if backend server is running
 * 
 * Props:
 * - showLabel (boolean): Whether to show text label
 * - size (string): 'sm', 'md', 'lg' for different sizes
 * - className (string): Additional CSS classes
 */
const BackendStatusIndicator = ({ 
  showLabel = true, 
  size = 'md', 
  className = '' 
}) => {
  const { isBackendOnline, isChecking } = useBackendStatus();

  const sizeClasses = {
    sm: {
      dot: 'w-2 h-2',
      text: 'text-xs',
      icon: 'text-sm'
    },
    md: {
      dot: 'w-3 h-3',
      text: 'text-sm',
      icon: 'text-base'
    },
    lg: {
      dot: 'w-4 h-4',
      text: 'text-base',
      icon: 'text-lg'
    }
  };

  const currentSize = sizeClasses[size];

  if (isChecking) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <FaSpinner className={`${currentSize.icon} text-yellow-500 animate-spin`} />
        {showLabel && (
          <span className={`${currentSize.text} text-yellow-600 font-medium`}>
            Checking...
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isBackendOnline ? (
        <>
          <div className={`${currentSize.dot} bg-green-500 rounded-full animate-pulse`}></div>
          {showLabel && (
            <span className={`${currentSize.text} text-green-700 font-medium`}>
              Server Online
            </span>
          )}
        </>
      ) : (
        <>
          <FaExclamationTriangle className={`${currentSize.icon} text-red-500`} />
          {showLabel && (
            <span className={`${currentSize.text} text-red-700 font-medium`}>
              Server Offline
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default BackendStatusIndicator;