import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon'

export function FroggiesIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <rect x="2" y="3" width="3.5" height="3.5" rx="0.5" fill="#4caf50" />
      <rect x="2" y="8" width="3.5" height="3.5" rx="0.5" fill="#2196f3" />
      <rect x="2" y="13" width="3.5" height="3.5" rx="0.5" fill="#f44336" />
      <rect x="2" y="18" width="3.5" height="3.5" rx="0.5" fill="#ffeb3b" />
      <rect x="7" y="3" width="14" height="2" rx="0.4" fill="currentColor" opacity="0.25" />
      <rect x="7" y="8" width="14" height="2" rx="0.4" fill="currentColor" opacity="0.25" />
      <rect x="7" y="13" width="14" height="2" rx="0.4" fill="currentColor" opacity="0.25" />
      <rect x="7" y="18" width="14" height="2" rx="0.4" fill="currentColor" opacity="0.25" />
      <rect x="10" y="2.5" width="3" height="3" rx="0.4" fill="#4caf50" />
      <rect x="14" y="7.5" width="3" height="3" rx="0.4" fill="#2196f3" />
      <rect x="11" y="12.5" width="3" height="3" rx="0.4" fill="#f44336" />
      <rect x="16" y="17.5" width="3" height="3" rx="0.4" fill="#ffeb3b" />
      <rect x="2" y="22.5" width="3.5" height="3.5" rx="0.5" fill="#9c27b0" />
      <rect x="13" y="22" width="3" height="3" rx="0.4" fill="#9c27b0" />
      <line x1="21" y1="2" x2="21" y2="22" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
    </SvgIcon>
  )
}
