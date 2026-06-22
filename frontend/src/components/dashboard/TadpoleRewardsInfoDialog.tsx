import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

interface TadpoleRewardsInfoDialogProps {
  open: boolean
  onClose: () => void
}

interface FormulaSectionProps {
  title: string
  formula: string
}

function FormulaSection({ title, formula }: FormulaSectionProps) {
  return (
    <Stack spacing={0.75}>
      <Typography variant="subtitle2">{title}</Typography>
      <Typography
        component="p"
        variant="body2"
        sx={{
          fontFamily: 'monospace',
          bgcolor: 'action.hover',
          borderRadius: 1,
          px: 1.25,
          py: 1,
        }}
      >
        {formula}
      </Typography>
    </Stack>
  )
}

export function TadpoleRewardsInfoDialog({ open, onClose }: TadpoleRewardsInfoDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tadpole rewards</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pb: 1 }}>
          <FormulaSection
            title="Snake & Frogger"
            formula="tadpoles = points ÷ 2"
          />
          <FormulaSection
            title="Stacker"
            formula="tadpoles = points ÷ 4"
          />
          <FormulaSection
            title="Anagrams"
            formula="tadpoles = 2 × ceil(points ÷ (duration × 10))"
          />
          <FormulaSection
            title="Anagrams (reps)"
            formula="tadpoles = ceil(points ÷ (duration × 10))"
          />
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
