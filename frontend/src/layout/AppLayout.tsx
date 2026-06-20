import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { Outlet } from 'react-router-dom'
import { TopAppBar } from '../components/TopAppBar'

export function AppLayout() {
  return (
    <>
      <TopAppBar />
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Box component="main">
          <Outlet />
        </Box>
      </Container>
    </>
  )
}
