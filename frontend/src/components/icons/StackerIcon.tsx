import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon'

export function StackerIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <rect x="3" y="16" width="18" height="3.5" rx="1" fill="currentColor" opacity="0.7" />
      <rect x="5" y="11.5" width="14" height="3.5" rx="1" fill="currentColor" opacity="0.85" />
      <rect x="7" y="7" width="10" height="3.5" rx="1" fill="currentColor" opacity="0.95" />
      <rect x="9" y="2.5" width="6" height="3.5" rx="1" fill="currentColor" />
    </SvgIcon>
  )
}
