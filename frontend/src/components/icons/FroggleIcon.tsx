import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon'

export function FroggleIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <rect x="3" y="4" width="4.5" height="4.5" rx="1" fill="currentColor" opacity="0.95" />
      <rect x="9.75" y="4" width="4.5" height="4.5" rx="1" fill="currentColor" opacity="0.55" />
      <rect x="16.5" y="4" width="4.5" height="4.5" rx="1" fill="currentColor" opacity="0.35" />
      <rect x="3" y="9.75" width="4.5" height="4.5" rx="1" fill="currentColor" opacity="0.55" />
      <rect x="9.75" y="9.75" width="4.5" height="4.5" rx="1" fill="currentColor" opacity="0.95" />
      <rect x="16.5" y="9.75" width="4.5" height="4.5" rx="1" fill="currentColor" opacity="0.35" />
      <rect x="3" y="15.5" width="4.5" height="4.5" rx="1" fill="currentColor" opacity="0.35" />
      <rect x="9.75" y="15.5" width="4.5" height="4.5" rx="1" fill="currentColor" opacity="0.55" />
      <rect x="16.5" y="15.5" width="4.5" height="4.5" rx="1" fill="currentColor" opacity="0.95" />
      <ellipse cx="12" cy="21.5" rx="8" ry="1.6" fill="currentColor" opacity="0.2" />
    </SvgIcon>
  )
}
