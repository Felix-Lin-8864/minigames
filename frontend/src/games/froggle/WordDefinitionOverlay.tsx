import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMemo } from 'react'
import type { WordDefinition } from '../../dictionary/fetchWordDefinitions'
import { useWordDefinitions } from './useWordDefinitions'

interface WordDefinitionOverlayProps {
  open: boolean
  word: string
  outcome: 'won' | 'forfeited' | 'lost'
  score?: number
  onClose: () => void
}

function groupDefinitionsByPartOfSpeech(definitions: WordDefinition[]) {
  const groups = new Map<string, string[]>()

  for (const item of definitions) {
    const existing = groups.get(item.partOfSpeech) ?? []
    existing.push(item.definition)
    groups.set(item.partOfSpeech, existing)
  }

  return [...groups.entries()]
}

export function WordDefinitionOverlay({
  open,
  word,
  outcome,
  score,
  onClose,
}: WordDefinitionOverlayProps) {
  const lookup = useWordDefinitions(word, open)
  const groupedDefinitions = useMemo(
    () => groupDefinitionsByPartOfSpeech(lookup.definitions),
    [lookup.definitions],
  )

  const subtitle =
    outcome === 'won' && score != null
      ? `You solved it! +${score} tadpoles`
      : outcome === 'forfeited'
        ? 'You forfeited this round.'
        : null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack spacing={0.5}>
          <Typography
            component="span"
            variant="h5"
            sx={{
              fontFamily: '"Fredoka", sans-serif',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {word}
          </Typography>
          {lookup.phonetic && (
            <Typography component="span" variant="body2" color="text.secondary">
              {lookup.phonetic}
            </Typography>
          )}
          {subtitle && (
            <Typography component="span" variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
              {subtitle}
            </Typography>
          )}
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ minHeight: 120 }}>
        {lookup.status === 'loading' && (
          <Stack spacing={2} sx={{ alignItems: 'center', py: 3 }}>
            <CircularProgress size={28} />
            <Typography variant="body2" color="text.secondary">
              Looking up definition…
            </Typography>
          </Stack>
        )}

        {lookup.status === 'error' && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            Couldn&apos;t load definition.
          </Typography>
        )}

        {lookup.status === 'empty' && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            No definition found for this word.
          </Typography>
        )}

        {lookup.status === 'ready' && (
          <Stack spacing={2}>
            {groupedDefinitions.map(([partOfSpeech, definitions]) => (
              <Box key={partOfSpeech}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ textTransform: 'capitalize', mb: 0.75 }}
                >
                  {partOfSpeech}
                </Typography>
                <Stack component="ol" spacing={0.75} sx={{ m: 0, pl: 2.5 }}>
                  {definitions.map((definition, index) => (
                    <Typography key={`${partOfSpeech}-${index}`} component="li" variant="body2">
                      {definition}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
