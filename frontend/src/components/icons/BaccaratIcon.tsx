import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon'

export function BaccaratIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <rect
        x="3"
        y="6"
        width="9"
        height="13"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
      />
      <rect
        x="12"
        y="4"
        width="9"
        height="13"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
      />
      <text
        x="7.5"
        y="14.5"
        fontSize="5"
        fontFamily="Fredoka, sans-serif"
        fontWeight="700"
        fill="currentColor"
        textAnchor="middle"
      >
        P
      </text>
      <text
        x="16.5"
        y="12.5"
        fontSize="5"
        fontFamily="Fredoka, sans-serif"
        fontWeight="700"
        fill="currentColor"
        textAnchor="middle"
      >
        B
      </text>
    </SvgIcon>
  )
}
