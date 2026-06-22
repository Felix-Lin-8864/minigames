import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon'

export function FencingIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <circle cx="8" cy="16" r="2.5" fill="currentColor" />
      <rect x="7" y="6" width="2" height="10" rx="1" fill="currentColor" />
      <path
        d="M9 7 L20 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="16" cy="16" r="2.5" fill="currentColor" opacity="0.7" />
      <rect x="15" y="6" width="2" height="10" rx="1" fill="currentColor" opacity="0.7" />
      <path
        d="M15 7 L4 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
    </SvgIcon>
  )
}
