import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, ChevronRight, Check, CheckCheck } from 'lucide-react';
import { notificationAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const getIcon = (category) => {
  switch (category) {
    case 'success': return <CheckCircle size={16} color="var(--secondary)" />;
    case 'warning': return <AlertCircle size={16} color="var(--error)" />;
    case 'info': return <Info size={16} color="var(--primary)" />;
    default: return <Bell size={16} color="var(--primary)" />;
  }
};

export default function NotificationWidget() {
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dragRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Check every minute
    
    // Listen for custom event
    window.addEventListener('notification-updated', fetchData);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('notification-updated', fetchData);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        notificationAPI.getAll({ limit: 5 }),
        notificationAPI.getUnreadCount()
      ]);
      if (listRes.success) setNotifications(listRes.data || []);
      if (countRes.success) setUnreadCount(countRes.data?.count || 0);
    } catch (e) {
      // Silently fail for widget
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(false);
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    const handleMouseMove = (moveEvent) => {
      setIsDragging(true);
      let newX = moveEvent.clientX - startX;
      let newY = moveEvent.clientY - startY;
      // Boundaries
      newX = Math.max(0, Math.min(newX, window.innerWidth - 60));
      newY = Math.max(0, Math.min(newY, window.innerHeight - 60));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleClick = () => {
    if (!isDragging) {
      setIsOpen(!isOpen);
      if (!isOpen) fetchData();
    }
  };

  const markAsRead = async (id) => {
    // Optimistic UI updates
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await notificationAPI.markAsRead(id);
      window.dispatchEvent(new CustomEvent('notification-updated'));
    } catch (e) {}
  };

  const markAllAsRead = async () => {
    // Optimistic UI updates
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await notificationAPI.markAllAsRead();
      window.dispatchEvent(new CustomEvent('notification-updated'));
    } catch (e) {}
  };

  return (
    <>
      {/* Draggable & Premium Styled Notification Button */}
      <div
        ref={dragRef}
        role="button"
        tabIndex={0}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e);
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0c2461, #006a6a)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isDragging ? 'grabbing' : 'pointer',
          boxShadow: isHovered 
            ? '0 12px 30px rgba(0,16,62,0.35)' 
            : '0 8px 24px rgba(0,16,62,0.2)',
          zIndex: 9999,
          userSelect: 'none',
          transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isOpen 
            ? 'scale(0.9) rotate(-10deg)' 
            : (isHovered ? 'scale(1.1) translateY(-2px)' : 'scale(1)'),
          border: '1.5px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        <Bell size={24} style={{ animation: unreadCount > 0 && !isOpen ? 'pulse 2s infinite' : 'none' }} />
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            background: 'var(--error)',
            color: 'white',
            fontSize: '10px',
            fontWeight: 800,
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #0a1b47',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </div>

      {/* Popover Card */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: window.innerHeight - position.y > 100 ? window.innerHeight - position.y + 10 : 'auto',
          top: window.innerHeight - position.y <= 100 ? position.y + 70 : 'auto',
          left: position.x > 300 ? position.x - 280 : position.x,
          width: '330px',
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(0, 16, 62, 0.18)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          zIndex: 9998,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transition: 'opacity 0.3s ease, transform 0.3s ease'
        }}>
          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 800, fontSize: '15px', color: 'var(--primary)', margin: 0 }}>Recent Notifications</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {unreadCount > 0 && (
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); markAllAsRead(); }} 
                  className="btn-text-link"
                  style={{ fontSize: '12px', fontWeight: 700, gap: '3px', padding: 0 }}
                  title="Mark all as read"
                >
                  <CheckCheck size={14} /> Mark all
                </button>
              )}
              <button type="button" onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--outline)', padding: '2px' }}>
                <X size={16} />
              </button>
            </div>
          </div>
          
          {/* Scrollable Items list */}
          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--on-surface-var)' }}>
                <Bell size={32} color="var(--outline)" style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: '13px' }}>No new notifications</p>
              </div>
            ) : (
              notifications.slice(0, 5).map(notif => {
                const handleClickNotification = async () => {
                  setIsOpen(false);
                  if (!notif.isRead) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                    setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
                    try {
                      await notificationAPI.markAsRead(notif._id);
                    } catch {}
                    window.dispatchEvent(new CustomEvent('notification-updated'));
                  }
                  const type = notif.type || '';
                  if (type.includes('prescription')) {
                    navigate('?section=prescriptions');
                  } else if (type.includes('appointment')) {
                    navigate('?section=appointments');
                  } else if (type.includes('leave')) {
                    navigate('?section=leave');
                  } else {
                    navigate('?section=notifications');
                  }
                };

                return (
                  <div 
                    key={notif._id} 
                    role="button"
                    tabIndex={0}
                    onClick={handleClickNotification}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleClickNotification();
                      }
                    }}
                    style={{ 
                      padding: '14px 20px', 
                      borderBottom: '1px solid rgba(0,0,0,0.04)', 
                      display: 'flex', 
                      gap: '12px', 
                      background: notif.isRead ? 'transparent' : 'rgba(0,106,106,0.03)',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'background 0.2s',
                      outline: 'none'
                    }}
                  >
                  <div style={{ marginTop: '2px', flexShrink: 0 }}>{getIcon(notif.category)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: notif.isRead ? 600 : 800, fontSize: '13px', marginBottom: '3px', color: notif.isRead ? 'var(--on-surface)' : 'var(--primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{notif.title}</p>
                    <p style={{ fontSize: '12px', color: 'var(--on-surface-var)', lineHeight: '1.4', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{notif.message}</p>
                  </div>
                  
                  {/* Mark as read icon button for unread notifications */}
                  {!notif.isRead && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notif._id);
                      }}
                      className="btn-check-round"
                      title="Mark as read"
                    >
                      <Check size={12} strokeWidth={3} />
                    </button>
                  )}
                </div>
              );
            })
            )}
          </div>
          
          {/* Footer view all link */}
          <div style={{ padding: '12px', background: 'var(--surface-low)', textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <button 
              type="button"
              onClick={() => { setIsOpen(false); navigate('?section=notifications'); }} 
              className="btn-text-link"
              style={{ justifyContent: 'center', width: '100%', fontWeight: 700, fontSize: '13px' }}
            >
              View All Notifications <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
