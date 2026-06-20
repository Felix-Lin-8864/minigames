import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon'

export function TwentyOneIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <rect
        x="4"
        y="5"
        width="11"
        height="15"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
      />
      <rect
        x="9"
        y="3"
        width="11"
        height="15"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
      />
      <text
        x="8"
        y="14"
        fontSize="6"
        fontFamily="Fredoka, sans-serif"
        fontWeight="700"
        fill="currentColor"
        textAnchor="middle"
      >
        21
      </text>
    </SvgIcon>
  )
}
