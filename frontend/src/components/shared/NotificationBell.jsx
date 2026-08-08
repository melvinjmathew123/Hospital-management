import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';

const TYPE_COLORS = {
  appointment: { bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99,102,241,0.3)', dot: '#818cf8' },
  lab:         { bg: 'rgba(34, 211, 238, 0.10)', border: 'rgba(34,211,238,0.3)', dot: '#22d3ee' },
  payment:     { bg: 'rgba(16, 185, 129, 0.10)', border: 'rgba(16,185,129,0.3)', dot: '#10b981' },
  warning:     { bg: 'rgba(245, 158, 11, 0.10)', border: 'rgba(245,158,11,0.3)', dot: '#f59e0b' },
  success:     { bg: 'rgba(16, 185, 129, 0.10)', border: 'rgba(16,185,129,0.3)', dot: '#10b981' },
  default:     { bg: 'rgba(255,255,255,0.04)',    border: 'rgba(255,255,255,0.08)', dot: '#9ca3af' },
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
          width: '42px',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-md)',
          background: open ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${open ? 'rgba(99,102,241,0.4)' : 'var(--glass-border)'}`,
          cursor: 'pointer',
          fontSize: '1.2rem',
          transition: 'all 0.2s ease',
        }}
      >
        {/* Animated bell */}
        <span
          style={{
            display: 'inline-block',
            animation: unreadCount > 0 ? 'bellShake 1.2s ease infinite' : 'none',
          }}
        >
          🔔
        </span>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              minWidth: '18px',
              height: '18px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              boxShadow: '0 0 8px rgba(239,68,68,0.6)',
              animation: 'badgePulse 2s ease infinite',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Keyframe styles */}
      <style>{`
        @keyframes bellShake {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(-8deg); }
          20%, 40%, 60%, 80% { transform: rotate(8deg); }
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 8px rgba(239,68,68,0.6); }
          50% { box-shadow: 0 0 16px rgba(239,68,68,0.9); }
        }
        @keyframes drawerSlideIn {
          from { opacity: 0; transform: translateY(-12px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Notification Drawer */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            right: 0,
            width: '380px',
            maxWidth: '95vw',
            background: 'linear-gradient(145deg, #0e1527, #0a0f1e)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
            zIndex: 1100,
            animation: 'drawerSlideIn 0.2s ease',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '1rem 1.25rem 0.75rem',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                Notifications
                {unreadCount > 0 && (
                  <span style={{
                    marginLeft: '0.5rem',
                    background: 'rgba(99,102,241,0.2)',
                    color: '#818cf8',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '10px',
                    border: '1px solid rgba(99,102,241,0.3)',
                  }}>
                    {unreadCount} new
                  </span>
                )}
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(99,102,241,0.3)',
                    color: '#818cf8',
                    fontSize: '0.7rem',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  ✓ All read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#f87171',
                    fontSize: '0.7rem',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  🗑 Clear
                </button>
              )}
            </div>
          </div>

          {/* Notification list */}
          <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '0.5rem 0' }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: '2.5rem 1.25rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔕</div>
                <p style={{ margin: 0 }}>No notifications yet</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', opacity: 0.6 }}>
                  You'll see updates from appointments, lab results, and payments here.
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
                      padding: '0.85rem 1.25rem',
                      display: 'flex',
                      gap: '0.85rem',
                      alignItems: 'flex-start',
                      cursor: 'pointer',
                      background: notif.read ? 'transparent' : colors.bg,
                      borderLeft: notif.read ? '3px solid transparent' : `3px solid ${colors.dot}`,
                      transition: 'background 0.2s',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                    }}
                  >
                    {/* Icon circle */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: colors.bg,
                      border: `1px solid ${colors.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                      flexShrink: 0,
                    }}>
                      {notif.icon || '🔔'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                        marginBottom: '0.25rem',
                      }}>
                        <p style={{
                          margin: 0,
                          fontSize: '0.82rem',
                          fontWeight: notif.read ? 500 : 700,
                          color: notif.read ? 'var(--text-muted)' : 'var(--text-main)',
                          lineHeight: 1.3,
                        }}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            background: colors.dot,
                            flexShrink: 0,
                            marginTop: '4px',
                          }} />
                        )}
                      </div>
                      <p style={{
                        margin: 0,
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.5,
                        marginBottom: '0.3rem',
                      }}>
                        {notif.message}
                      </p>
                      <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>
                        {timeAgo(notif.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: '0.6rem 1.25rem',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              textAlign: 'center',
              fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.25)',
            }}>
              Notifications are session-only and clear on logout
            </div>
          )}
        </div>
      )}
    </div>
  );
}
