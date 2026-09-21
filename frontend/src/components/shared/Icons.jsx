import React from 'react';

const defaultProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const StethoscopeIcon = ({ size = 20, color = 'currentColor', ...props }) => (
  <svg {...defaultProps} width={size} height={size} stroke={color} {...props}>
    <path d="M4.5 3v5a4.5 4.5 0 0 0 9 0V3" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <circle cx="9" cy="3" r="1.5" />
    <circle cx="15" cy="3" r="1.5" />
    <path d="M12 19v3" />
    <circle cx="12" cy="22" r="1" />
  </svg>
);

export const HeartPulseIcon = ({ size = 20, color = 'currentColor', ...props }) => (
  <svg {...defaultProps} width={size} height={size} stroke={color} {...props}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <path d="M3.22 12H9.5l1.5-3 2 6 1.5-3h4.28" />
  </svg>
);

export const TestTubeIcon = ({ size = 20, color = 'currentColor', ...props }) => (
  <svg {...defaultProps} width={size} height={size} stroke={color} {...props}>
    <path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5V2" />
    <path d="M8.5 2h7" />
    <path d="M9.5 12h5" />
    <path d="M9.5 16h3" />
  </svg>
);

export const BedIcon = ({ size = 20, color = 'currentColor', ...props }) => (
  <svg {...defaultProps} width={size} height={size} stroke={color} {...props}>
    <path d="M2 4v16" />
    <path d="M2 8h18a2 2 0 0 1 2 2v10" />
    <path d="M2 17h20" />
    <path d="M6 8v9" />
  </svg>
);

export const PillIcon = ({ size = 20, color = 'currentColor', ...props }) => (
  <svg {...defaultProps} width={size} height={size} stroke={color} {...props}>
    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
    <path d="m8.5 8.5 7 7" />
  </svg>
);

export const AmbulanceIcon = ({ size = 20, color = 'currentColor', ...props }) => (
  <svg {...defaultProps} width={size} height={size} stroke={color} {...props}>
    <path d="M10 10h4" />
    <path d="M12 8v4" />
    <rect width="16" height="11" x="2" y="6" rx="2" />
    <path d="M18 10h3l2 3v4h-5" />
    <circle cx="7" cy="18" r="2" />
    <path d="M9 18h6" />
    <circle cx="18" cy="18" r="2" />
  </svg>
);

export const CalendarIcon = ({ size = 20, color = 'currentColor', ...props }) => (
  <svg {...defaultProps} width={size} height={size} stroke={color} {...props}>
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

export const ClockIcon = ({ size = 20, color = 'currentColor', ...props }) => (
  <svg {...defaultProps} width={size} height={size} stroke={color} {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const FileTextIcon = ({ size = 20, color = 'currentColor', ...props }) => (
  <svg {...defaultProps} width={size} height={size} stroke={color} {...props}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);

export const FolderIcon = ({ size = 20, color = 'currentColor', ...props }) => (
  <svg {...defaultProps} width={size} height={size} stroke={color} {...props}>
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
  </svg>
);

export const CreditCardIcon = ({ size = 20, color = 'currentColor', ...props }) => (
  <svg {...defaultProps} width={size} height={size} stroke={color} {...props}>
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

export const BellIcon = ({ size = 20, color = 'currentColor', ...props }) => (
  <svg {...defaultProps} width={size} height={size} stroke={color} {...props}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

export const UserIcon = ({ size = 20, color = 'currentColor', ...props }) => (
  <svg {...defaultProps} width={size} height={size} stroke={color} {...props}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const UsersIcon = ({ size = 20, color = 'currentColor', ...props }) => (
  <svg {...defaultProps} width={size} height={size} stroke={color} {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const HospitalIcon = ({ size = 20, color = 'currentColor', ...props }) => (
  <svg {...defaultProps} width={size} height={size} stroke={color} {...props}>
    <path d="M12 6v4" />
    <path d="M14 8h-4" />
    <path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18Z" />
    <path d="M18 22H6" />
  </svg>
);

export const ActivityIcon = ({ size = 20, color = 'currentColor', ...props }) => (
  <svg {...defaultProps} width={size} height={size} stroke={color} {...props}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

export const LogOutIcon = ({ size = 20, color = 'currentColor', ...props }) => (
  <svg {...defaultProps} width={size} height={size} stroke={color} {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

export const PhoneIcon = ({ size = 20, color = 'currentColor', ...props }) => (
  <svg {...defaultProps} width={size} height={size} stroke={color} {...props}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const CheckIcon = ({ size = 20, color = 'currentColor', ...props }) => (
  <svg {...defaultProps} width={size} height={size} stroke={color} {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const CheckCircleIcon = ({ size = 20, color = 'currentColor', ...props }) => (
  <svg {...defaultProps} width={size} height={size} stroke={color} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const AlertCircleIcon = ({ size = 20, color = 'currentColor', ...props }) => (
  <svg {...defaultProps} width={size} height={size} stroke={color} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

export const ShieldCheckIcon = ({ size = 20, color = 'currentColor', ...props }) => (
  <svg {...defaultProps} width={size} height={size} stroke={color} {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
