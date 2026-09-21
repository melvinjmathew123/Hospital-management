import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { BellIcon } from './Icons';

const TYPE_COLORS = {
  appointment: { bg: '#eff6ff', border: '#bfdbfe', dot: '#2563eb' },
  lab:         { bg: '#ecfdf5', border: '#a7f3d0', dot: '#059669' },
  payment:     { bg: '#fffbeb', border: '#fde68a', dot: '#d97706' },
  warning:     { bg: '#fff7ed', border: '#fed7aa', dot: '#ea580c' },
  success:     { bg: '#ecfdf5', border: '#a7f3d0', dot: '#059669' },
  default:     { bg: '#f8fafc', border: '#e2e8f0', dot: '#64748b' },
};

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead, markOneRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const drawerRef = useRef(null);

  // Close drawer when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleOpen = () => {
    setOpen((v) => !v);
  };

  return (
    <div ref={drawerRef} style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        id="notification-bell-btn"
        onClick={handleOpen}
        title="Notifications"
        style={{
          position: 'relative',
          width: '38px',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-sm)',
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          cursor: 'pointer',
          fontSize: '1.1rem',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.15s ease',
        }}
      >
        {/* Animated bell */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: unreadCount > 0 ? 'bellShake 1.2s ease infinite' : 'none',
          }}
        >
          <BellIcon size={18} color="#334155" />
        </span>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              minWidth: '18px',
              height: '18px',
              borderRadius: '9px',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Drawer */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '360px',
            maxWidth: '92vw',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
            zIndex: 1100,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '0.85rem 1.15rem',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                Notifications
                {unreadCount > 0 && (
                  <span style={{
                    marginLeft: '0.5rem',
                    background: '#eff6ff',
                    color: '#2563eb',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    padding: '2px 7px',
                    borderRadius: '10px',
                    border: '1px solid #bfdbfe',
                  }}>
                    {unreadCount} new
                  </span>
                )}
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#2563eb',
                    fontSize: '0.7rem',
                    padding: '3px 7px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #fecaca',
                    color: '#ef4444',
                    fontSize: '0.7rem',
                    padding: '3px 7px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Notification list */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: '2.5rem 1.25rem',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '0.85rem',
              }}>
                <p style={{ margin: 0, fontWeight: 500, color: '#334155' }}>No notifications right now</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem' }}>
                  You will receive updates about appointments, lab test results, and billing here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const colors = TYPE_COLORS[notif.type] || TYPE_COLORS.default;
                return (
                  <div
                    key={notif.id}
                    onClick={() => markOneRead(notif.id)}
                    style={{
                      padding: '0.8rem 1.15rem',
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'flex-start',
                      cursor: 'pointer',
                      background: notif.read ? '#ffffff' : colors.bg,
                      borderLeft: notif.read ? '3px solid transparent' : `3px solid ${colors.dot}`,
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      border: `1px solid ${colors.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.95rem',
                      flexShrink: 0,
                    }}>
                      {notif.icon || <BellIcon size={16} color={colors.dot} />}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                        marginBottom: '0.15rem',
                      }}>
                        <p style={{
                          margin: 0,
                          fontSize: '0.82rem',
                          fontWeight: notif.read ? 500 : 600,
                          color: '#0f172a',
                          lineHeight: 1.3,
                        }}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: colors.dot,
                            flexShrink: 0,
                            marginTop: '4px',
                          }} />
                        )}
                      </div>
                      <p style={{
                        margin: 0,
                        fontSize: '0.78rem',
                        color: '#64748b',
                        lineHeight: 1.4,
                        marginBottom: '0.2rem',
                      }}>
                        {notif.message}
                      </p>
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                        {timeAgo(notif.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
