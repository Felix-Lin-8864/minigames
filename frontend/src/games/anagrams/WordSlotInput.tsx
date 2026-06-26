import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { MIN_WORD_LENGTH } from './constants'

export function normalizeWordInput(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z]/g, '')
}

export function getSlotCount(
  valueLength: number,
  minSlots: number,
  maxLength: number,
): number {
  if (valueLength >= maxLength) return valueLength
  return Math.max(minSlots, valueLength + 1)
}

const slotSx = {
  width: 40,
  height: 44,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 1.5,
  border: '2px solid',
  fontFamily: '"Fredoka", sans-serif',
  fontSize: '1.25rem',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  userSelect: 'none' as const,
}

interface WordSlotInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  maxLength: number
  autoFocus?: boolean
  disabled?: boolean
}

export function WordSlotInput({
  value,
  onChange,
  onSubmit,
  maxLength,
  autoFocus = false,
  disabled = false,
}: WordSlotInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [cursor, setCursor] = useState(0)
  const slotCount = getSlotCount(value.length, MIN_WORD_LENGTH, maxLength)

  const syncCursor = useCallback(() => {
    const input = inputRef.current
    if (!input) return
    setCursor(input.selectionStart ?? value.length)
  }, [value.length])

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus()
    }
  }, [autoFocus])

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const raw = input.value
    const selectionStart = input.selectionStart ?? raw.length
    const normalizedBefore = normalizeWordInput(raw.slice(0, selectionStart))
    const next = normalizeWordInput(raw).slice(0, maxLength)
    onChange(next)

    requestAnimationFrame(() => {
      const el = inputRef.current
      if (!el) return
      const nextCursor = Math.min(normalizedBefore.length, next.length)
      el.setSelectionRange(nextCursor, nextCursor)
      setCursor(nextCursor)
    })
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      onSubmit()
      return
    }
    requestAnimationFrame(syncCursor)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSubmit()
  }

  function focusInput(at?: number) {
    const input = inputRef.current
    if (!input || disabled) return
    input.focus()
    const index = at ?? value.length
    input.setSelectionRange(index, index)
    setCursor(index)
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      autoComplete="off"
      sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}
    >
      <Box sx={{ position: 'relative', width: 'fit-content' }}>
        <Stack
          direction="row"
          spacing={0.75}
          sx={{ flexWrap: 'wrap', justifyContent: 'center', gap: 0.75 }}
        >
        {Array.from({ length: slotCount }, (_, index) => {
          const letter = value[index] ?? ''
          const isActive = !disabled && cursor === index

          return (
            <Box
              key={index}
              onClick={() => focusInput(index)}
              sx={{
                ...slotSx,
                borderColor: isActive ? 'primary.main' : 'divider',
                bgcolor: letter ? 'rgba(74, 222, 128, 0.12)' : 'transparent',
                color: letter ? 'text.primary' : 'text.disabled',
                boxShadow: isActive ? '0 0 0 1px rgba(74, 222, 128, 0.35)' : 'none',
              }}
            >
              {letter}
            </Box>
          )
        })}
        </Stack>

        <Box
          component="input"
          ref={inputRef}
          type="text"
          value={value}
          disabled={disabled}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onKeyUp={syncCursor}
          onClick={syncCursor}
          onSelect={syncCursor}
          onFocus={syncCursor}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Word"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'text',
            border: 'none',
            p: 0,
            m: 0,
            fontSize: 16,
          }}
        />
      </Box>
    </Box>
  )
}
