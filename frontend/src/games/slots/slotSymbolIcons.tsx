import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon'
import type { ComponentType } from 'react'
import type { SlotSymbol } from './types'

function FlyIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <ellipse cx="12" cy="13" rx="2.2" ry="4.5" fill="currentColor" />
      <ellipse cx="7.5" cy="10" rx="4.5" ry="2.8" fill="currentColor" opacity="0.85" />
      <ellipse cx="16.5" cy="10" rx="4.5" ry="2.8" fill="currentColor" opacity="0.85" />
      <circle cx="11.2" cy="9.5" r="1.1" fill="#0a1210" />
      <circle cx="13.2" cy="9.5" r="1.1" fill="#0a1210" />
      <circle cx="11.5" cy="9.2" r="0.35" fill="#ecfdf5" />
      <circle cx="13.5" cy="9.2" r="0.35" fill="#ecfdf5" />
    </SvgIcon>
  )
}

function ReedIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        d="M8 21V10c0-3 1-6 2-7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M12 21V8c0-4 1.2-7 2.5-8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M16 21V11c0-2.5 0.8-5 1.8-6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M6.5 14c2-1 3.5-1 5.5 0s3.5 1 5.5 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />
    </SvgIcon>
  )
}

function DropletIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        d="M12 3.5c0 0-5.5 7.2-5.5 11.2c0 3.1 2.5 5.8 5.5 5.8s5.5-2.7 5.5-5.8C17.5 10.7 12 3.5 12 3.5z"
        fill="currentColor"
      />
      <path
        d="M9.5 13.5c1.2 1.5 2.5 2.2 2.5 2.2s1.3-0.7 2.5-2.2"
        fill="none"
        stroke="#ecfdf5"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.55"
      />
    </SvgIcon>
  )
}

function LilyPadIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        d="M12 20c-5 0-8.5-3.2-8.5-7.2c0-2.2 1.2-4.2 3.2-5.5C7.8 8.8 9.5 9.5 12 9.5V5c2.5 2.2 5.5 3.5 7.8 5.8c1.2 1.2 1.7 2.8 1.7 4.5c0 4-3.5 4.7-9.5 4.7z"
        fill="currentColor"
      />
      <circle cx="12" cy="11.5" r="1.6" fill="#f9a8d4" />
      <circle cx="10.2" cy="13.2" r="1.1" fill="#fbcfe8" />
      <circle cx="13.8" cy="13.2" r="1.1" fill="#fbcfe8" />
      <circle cx="12" cy="14.8" r="1" fill="#f472b6" />
    </SvgIcon>
  )
}

function CaterpillarIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <circle cx="6.5" cy="14" r="2.4" fill="currentColor" />
      <circle cx="10" cy="12.8" r="2.6" fill="currentColor" />
      <circle cx="13.8" cy="12.5" r="2.7" fill="currentColor" />
      <circle cx="17.5" cy="13.2" r="2.5" fill="currentColor" />
      <path
        d="M5.5 11.5c0.5-1.5 1.5-2.5 2.5-3M6 10.5l-1.2-1.5M6.5 10.8l0.2-1.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle cx="5.2" cy="13.5" r="0.55" fill="#0a1210" />
      <circle cx="5.45" cy="13.3" r="0.2" fill="#ecfdf5" />
    </SvgIcon>
  )
}

function EggIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <ellipse cx="12" cy="13.5" rx="6.2" ry="7.2" fill="currentColor" />
      <circle cx="9.5" cy="11.5" r="1.1" fill="rgba(10,18,16,0.35)" />
      <circle cx="13.8" cy="10.8" r="0.9" fill="rgba(10,18,16,0.35)" />
      <circle cx="12.5" cy="15" r="1" fill="rgba(10,18,16,0.3)" />
      <circle cx="10.5" cy="14.2" r="0.7" fill="rgba(10,18,16,0.25)" />
    </SvgIcon>
  )
}

function GoldenFrogIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <ellipse cx="12" cy="14.5" rx="8" ry="6" fill="currentColor" />
      <circle cx="8" cy="10.5" r="3" fill="currentColor" />
      <circle cx="16" cy="10.5" r="3" fill="currentColor" />
      <circle cx="8" cy="10.5" r="1.3" fill="#0a1210" />
      <circle cx="16" cy="10.5" r="1.3" fill="#0a1210" />
      <circle cx="8.4" cy="10.1" r="0.45" fill="#ecfdf5" />
      <circle cx="16.4" cy="10.1" r="0.45" fill="#ecfdf5" />
      <path
        d="M9.5 15.8 Q12 17.8 14.5 15.8"
        fill="none"
        stroke="#0a1210"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <path
        d="M12 4.5l1 2.2 2.4 0.4-1.7 1.6 0.4 2.4L12 9.8 9.9 11.1l0.4-2.4L8.6 7.1l2.4-0.4z"
        fill="#fde68a"
        stroke="#f59e0b"
        strokeWidth="0.5"
      />
    </SvgIcon>
  )
}

export const SLOT_SYMBOL_ICONS: Record<SlotSymbol, ComponentType<SvgIconProps>> = {
  fly: FlyIcon,
  reed: ReedIcon,
  droplet: DropletIcon,
  lilypad: LilyPadIcon,
  caterpillar: CaterpillarIcon,
  egg: EggIcon,
  goldenfrog: GoldenFrogIcon,
}

export const SLOT_SYMBOL_COLORS: Partial<Record<SlotSymbol, string>> = {
  reed: '#4ade80',
  droplet: '#38bdf8',
  lilypad: '#86efac',
  caterpillar: '#a3e635',
  egg: '#e7e5e4',
  goldenfrog: '#fbbf24',
  fly: '#a8a29e',
}
