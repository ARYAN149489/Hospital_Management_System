// frontend/src/components/common/Card.jsx
import { MoreVertical } from 'lucide-react';

const Card = ({
  children,
  className = '',
  padding = true,
  hoverable = false,
  clickable = false,
  onClick,
  shadow = 'md',
  border = false,
  ...props
}) => {
  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const cardClasses = `
    bg-white rounded-lg
    ${shadows[shadow]}
    ${border ? 'border border-gray-200' : ''}
    ${padding ? 'p-6' : ''}
    ${hoverable ? 'hover:shadow-xl transition-shadow duration-300' : ''}
    ${clickable ? 'cursor-pointer' : ''}
    ${className}
  `.trim();

  return (
    <div className={cardClasses} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

// Card Header Component
export const CardHeader = ({
  title,
  subtitle,
  action,
  icon,
  className = '',
}) => {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`}>
      <div className="flex items-center space-x-3 flex-1">
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex-shrink-0 ml-4">
          {action}
        </div>
      )}
    </div>
  );
};

// Card Body Component
export const CardBody = ({ children, className = '' }) => {
  return (
    <div className={`text-gray-700 ${className}`}>
      {children}
    </div>
  );
};

// Card Footer Component
export const CardFooter = ({
  children,
  className = '',
  bordered = false,
}) => {
  return (
    <div className={`mt-4 pt-4 ${bordered ? 'border-t border-gray-200' : ''} ${className}`}>
      {children}
    </div>
  );
};

// Stats Card Component
export const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'blue',
  onClick,
}) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <Card
      clickable={!!onClick}
      onClick={onClick}
      hoverable={!!onClick}
      className="relative overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && trendValue && (
            <p className={`text-sm mt-2 ${trendColors[trend]}`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-full ${colors[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  );
};

// Info Card Component
export const InfoCard = ({
  title,
  description,
  icon: Icon,
  color = 'blue',
  action,
}) => {
  const colors = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
  };

  return (
    <Card>
      <div className="flex items-start space-x-4">
        {Icon && (
          <div className={`p-2 rounded-lg ${colors[color]}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Profile Card Component
export const ProfileCard = ({
  name,
  role,
  avatar,
  stats,
  actions,
  onClick,
}) => {
  return (
    <Card hoverable clickable={!!onClick} onClick={onClick}>
      <div className="text-center">
        {/* Avatar */}
        <div className="mb-4">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-20 h-20 rounded-full mx-auto object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mx-auto text-white text-2xl font-bold">
              {name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        <p className="text-sm text-gray-500 mb-4">{role}</p>

        {/* Stats */}
        {stats && (
          <div className="flex justify-around border-t border-gray-200 pt-4 mb-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {actions && (
          <div className="flex space-x-2">
            {actions}
          </div>
        )}
      </div>
    </Card>
  );
};

// Alert Card Component
export const AlertCard = ({
  type = 'info',
  title,
  message,
  onClose,
  action,
}) => {
  const types = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'ℹ️',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: '✓',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: '⚠️',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: '✕',
    },
  };

  const style = types[type];

  return (
    <div className={`${style.bg} border ${style.border} rounded-lg p-4`}>
      <div className="flex items-start">
        <span className="text-2xl mr-3">{style.icon}</span>
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold ${style.text} mb-1`}>{title}</h4>
          )}
          <p className={`text-sm ${style.text}`}>{message}</p>
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`${style.text} hover:opacity-70 transition ml-2`}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

// Empty State Card Component
export const EmptyStateCard = ({
  icon: Icon,
  title,
  message,
  action,
}) => {
  return (
    <Card className="text-center py-12">
      {Icon && (
        <div className="mb-4 flex justify-center">
          <Icon className="w-16 h-16 text-gray-400" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{message}</p>
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </Card>
  );
};

export default Card;