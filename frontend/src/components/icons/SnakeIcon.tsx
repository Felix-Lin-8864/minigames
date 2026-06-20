import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon'

export function SnakeIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        d="M4 14c0-1.1.9-2 2-2h2.5c.8 0 1.5-.7 1.5-1.5S9.3 9 8.5 9H6.5C4 9 2 11 2 13.5 2 16 4 18 6.5 18H9c1.7 0 3-1.3 3-3v-.5c0-.8.7-1.5 1.5-1.5h1c.8 0 1.5.7 1.5 1.5V15c0 2.2 1.8 4 4 4h.5c1.1 0 2-.9 2-2s-.9-2-2-2H17c-.6 0-1-.4-1-1v-.5c0-1.1.9-2 2-2h1.5c1.4 0 2.5-1.1 2.5-2.5S21.9 7 20.5 7H19c-1.7 0-3 1.3-3 3v.5c0 .8-.7 1.5-1.5 1.5H13c-.8 0-1.5-.7-1.5-1.5V9c0-1.1-.9-2-2-2H8.5C6 7 4 9 4 11.5V14z"
        fill="currentColor"
        opacity="0.95"
      />
      <circle cx="19.5" cy="8.5" r="1.1" fill="#0a1210" />
      <circle cx="20" cy="8.2" r="0.35" fill="#ecfdf5" />
    </SvgIcon>
  )
}
