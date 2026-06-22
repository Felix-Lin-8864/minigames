import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon'

export function SlotsIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <rect
        x="3"
        y="5"
        width="5.5"
        height="14"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
      />
      <rect
        x="9.25"
        y="5"
        width="5.5"
        height="14"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
      />
      <rect
        x="15.5"
        y="5"
        width="5.5"
        height="14"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
      />
      <line
        x1="2"
        y1="12"
        x2="22"
        y2="12"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="1.5 1.5"
      />
      <circle cx="5.75" cy="9" r="1" fill="currentColor" />
      <circle cx="12" cy="15" r="1" fill="currentColor" />
      <circle cx="18.25" cy="9" r="1" fill="currentColor" />
    </SvgIcon>
  )
}
