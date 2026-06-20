import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon'

export function RouletteIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
      />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      <line x1="12" y1="3" x2="12" y2="9.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="12" y1="14.5" x2="12" y2="21" stroke="currentColor" strokeWidth="1.2" />
      <line x1="3" y1="12" x2="9.5" y2="12" stroke="currentColor" strokeWidth="1.2" />
      <line x1="14.5" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="12" cy="5" r="1.1" fill="currentColor" />
      <circle cx="18.5" cy="12" r="1.1" fill="currentColor" />
      <circle cx="12" cy="19" r="1.1" fill="currentColor" />
      <circle cx="5.5" cy="12" r="1.1" fill="currentColor" />
    </SvgIcon>
  )
}
