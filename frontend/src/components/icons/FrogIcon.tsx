import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon'

export function FrogIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <ellipse cx="12" cy="14" rx="9" ry="7" fill="currentColor" opacity="0.95" />
      <circle cx="8" cy="10" r="3.2" fill="currentColor" />
      <circle cx="16" cy="10" r="3.2" fill="currentColor" />
      <circle cx="8" cy="10" r="1.4" fill="#0a1210" />
      <circle cx="16" cy="10" r="1.4" fill="#0a1210" />
      <circle cx="8.4" cy="9.6" r="0.45" fill="#ecfdf5" />
      <circle cx="16.4" cy="9.6" r="0.45" fill="#ecfdf5" />
      <path
        d="M9.5 15.5 Q12 17.5 14.5 15.5"
        fill="none"
        stroke="#0a1210"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </SvgIcon>
  )
}
