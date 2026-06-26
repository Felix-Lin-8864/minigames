import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon'

export function ChainPondIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <ellipse cx="12" cy="19" rx="9" ry="2.5" fill="currentColor" opacity="0.2" />
      <path
        d="M5 14c2-4 4-6 7-6s5 2 7 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="7.5" cy="10" r="2.2" fill="currentColor" opacity="0.85" />
      <circle cx="12" cy="8.5" r="2.2" fill="currentColor" opacity="0.65" />
      <circle cx="16.5" cy="10" r="2.2" fill="currentColor" opacity="0.85" />
      <path
        d="M8.5 10h2.8M12.7 8.5h2.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.35"
      />
    </SvgIcon>
  )
}
