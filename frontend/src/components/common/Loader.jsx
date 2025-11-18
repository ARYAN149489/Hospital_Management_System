// frontend/src/components/common/Loader.jsx
import { Loader2 } from 'lucide-react';

// Full Page Loader
export const FullPageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

// Spinner Loader
export const Spinner = ({ size = 'md', color = 'blue' }) => {
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colors = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    green: 'text-green-600',
    red: 'text-red-600',
    gray: 'text-gray-600',
    white: 'text-white',
  };

  return (
    <Loader2 className={`${sizes[size]} ${colors[color]} animate-spin`} />
  );
};

// Button Loader
export const ButtonLoader = ({ text = 'Loading...' }) => {
  return (
    <span className="flex items-center justify-center space-x-2">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span>{text}</span>
    </span>
  );
};

// Card Loader (Skeleton)
export const CardLoader = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-300 rounded"></div>
            <div className="h-3 bg-gray-300 rounded w-5/6"></div>
            <div className="h-3 bg-gray-300 rounded w-4/6"></div>
          </div>
        </div>
      ))}
    </>
  );
};

// Table Loader (Skeleton)
export const TableLoader = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="animate-pulse">
      <table className="w-full">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="p-3">
                <div className="h-4 bg-gray-300 rounded"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="p-3">
                  <div className="h-3 bg-gray-300 rounded"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Dots Loader
export const DotsLoader = ({ color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
  };

  return (
    <div className="flex space-x-2">
      <div className={`w-3 h-3 ${colors[color]} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
      <div className={`w-3 h-3 ${colors[color]} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
      <div className={`w-3 h-3 ${colors[color]} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
    </div>
  );
};

// Progress Bar Loader
export const ProgressLoader = ({ progress = 0, showPercentage = true }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Loading...</span>
        {showPercentage && (
          <span className="text-sm font-medium text-blue-600">{progress}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-gradient-to-r from-blue-600 to-purple-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

// Pulse Loader
export const PulseLoader = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 bg-blue-500 rounded-full opacity-75 animate-ping"></div>
        <div className="relative w-12 h-12 bg-blue-600 rounded-full"></div>
      </div>
    </div>
  );
};

// Loading Overlay (for cards/sections)
export const LoadingOverlay = ({ message = 'Loading...' }) => {
  return (
    <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg z-10">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

// Default Loader Component
const Loader = ({ 
  type = 'spinner', 
  size = 'md', 
  color = 'blue',
  message,
  ...props 
}) => {
  switch (type) {
    case 'fullpage':
      return <FullPageLoader message={message} />;
    case 'spinner':
      return <Spinner size={size} color={color} />;
    case 'button':
      return <ButtonLoader text={message} />;
    case 'dots':
      return <DotsLoader color={color} />;
    case 'pulse':
      return <PulseLoader />;
    case 'card':
      return <CardLoader {...props} />;
    case 'table':
      return <TableLoader {...props} />;
    case 'progress':
      return <ProgressLoader {...props} />;
    case 'overlay':
      return <LoadingOverlay message={message} />;
    default:
      return <Spinner size={size} color={color} />;
  }
};

export default Loader;