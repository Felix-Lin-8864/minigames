import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon'

export function FrogDollarIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <circle cx="8.5" cy="7.5" r="1" fill="currentColor" />
      <circle cx="15.5" cy="7.5" r="1" fill="currentColor" />
      <path
        d="M8.5 10h7M12 10v8M12 11.5A2.1 1.25 0 0 0 12 14A2.1 1.25 0 0 1 12 16.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  )
}
