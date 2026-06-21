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
  description: string
}

function FormulaSection({ title, formula, description }: FormulaSectionProps) {
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
      <Typography variant="body2" color="text.secondary">
        {description}
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
            title="General"
            formula="tadpoles = points ÷ 4"
            description="Applies to Snake, Frogger, and Stacker."
          />
          <FormulaSection
            title="Anagrams"
            formula="tadpoles = ceil(points ÷ (100 + duration × 10))"
            description="Duration is the selected time limit in seconds (30, 60, or 90)."
          />
          <FormulaSection
            title="Anagrams (reps)"
            formula="tadpoles = floor(Anagrams award ÷ 2)"
            description="Uses the Anagrams formula above, then halves the result."
          />
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
