import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Calendar, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    window.addEventListener('notification-updated', fetchNotificationsSilently);
    return () => {
      window.removeEventListener('notification-updated', fetchNotificationsSilently);
    };
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getAll();
      if (res.success) {
        setNotifications(res.data || []);
      }
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationsSilently = async () => {
    try {
      const res = await notificationAPI.getAll();
      if (res.success) {
        setNotifications(res.data || []);
      }
    } catch (e) {}
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      window.dispatchEvent(new CustomEvent('notification-updated'));
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
      window.dispatchEvent(new CustomEvent('notification-updated'));
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationAPI.delete(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      window.dispatchEvent(new CustomEvent('notification-updated'));
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      markAsRead(notif._id);
    }
    const type = notif.type || '';
    if (type.includes('prescription')) {
      navigate('?section=prescriptions');
    } else if (type.includes('appointment')) {
      navigate('?section=appointments');
    } else if (type.includes('leave')) {
      navigate('?section=leave');
    }
  };

  const getIcon = (category) => {
    switch (category) {
      case 'success': return <CheckCircle size={20} color="var(--secondary)" />;
      case 'warning': return <AlertCircle size={20} color="var(--error)" />;
      case 'info': return <Info size={20} color="var(--primary)" />;
      default: return <Bell size={20} color="var(--primary)" />;
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner spinner-lg" /></div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="headline-sm">Notifications</h2>
        {notifications.some(n => !n.isRead) && (
          <button onClick={markAllAsRead} className="btn btn-secondary btn-sm">
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
          <Bell size={48} color="var(--outline)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--on-surface-var)' }}>You're all caught up!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map(notif => {
            const date = new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            return (
              <div 
                key={notif._id} 
                className="glass-card-sm"
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '16px',
                  padding: '16px',
                  background: notif.isRead ? 'var(--surface)' : 'var(--surface-low)',
                  borderLeft: notif.isRead ? 'none' : '4px solid var(--primary)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div 
                  onClick={() => handleNotificationClick(notif)}
                  style={{ display: 'flex', flex: 1, gap: '16px', cursor: 'pointer' }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(0,16,62,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {getIcon(notif.category)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <p style={{ fontWeight: 700, fontSize: '15px', color: notif.isRead ? 'var(--on-surface)' : 'var(--primary)' }}>
                        {notif.title}
                      </p>
                      <span style={{ fontSize: '12px', color: 'var(--outline)' }}>{date}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--on-surface-var)', lineHeight: '1.5' }}>
                      {notif.message}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {!notif.isRead && (
                    <button onClick={(e) => { e.stopPropagation(); markAsRead(notif._id); }} className="btn-icon" title="Mark as read" style={{ width: 28, height: 28 }}>
                      <Check size={14} color="var(--secondary)" />
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); deleteNotification(notif._id); }} className="btn-icon" title="Delete" style={{ width: 28, height: 28 }}>
                    <Trash2 size={14} color="var(--error)" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
