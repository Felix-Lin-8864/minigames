import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import { tadpoleEarnedMessage } from './tadpoleEarnedMessage'

interface TadpoleEarnedSnackbarProps {
  open: boolean
  amount: number
  onClose: () => void
}

export function TadpoleEarnedSnackbar({ open, amount, onClose }: TadpoleEarnedSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        severity={amount > 0 ? 'success' : 'info'}
        variant="filled"
        onClose={onClose}
        sx={{ width: '100%' }}
      >
        {tadpoleEarnedMessage(amount)}
      </Alert>
    </Snackbar>
  )
}
