import { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import MenuIcon from '@mui/icons-material/Menu'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { FrogIcon } from './icons/FrogIcon'
import { gameMetadata } from '../games/metadata'
import { APP_NAME } from '../theme/branding'

export function TopAppBar() {
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  function isActive(route: string) {
    if (route === '/') return location.pathname === '/'
    return location.pathname.startsWith(route)
  }

  const navLinks = (
    <>
      {gameMetadata.map((game) => (
        <Button
          key={game.id}
          component={RouterLink}
          to={game.route}
          color={isActive(game.route) ? 'primary' : 'inherit'}
          variant={isActive(game.route) ? 'contained' : 'text'}
          size="small"
          sx={{ display: { xs: 'none', md: 'inline-flex' } }}
        >
          {game.name}
        </Button>
      ))}
    </>
  )

  return (
    <>
      <AppBar position="sticky">
        <Toolbar sx={{ gap: 2 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ display: { md: 'none' } }}
            aria-label="Open navigation menu"
          >
            <MenuIcon />
          </IconButton>

          <FrogIcon
            sx={{
              color: 'primary.main',
              fontSize: 32,
              display: { xs: 'none', sm: 'block' },
            }}
          />

          <Typography
            component={RouterLink}
            to="/"
            variant="h6"
            sx={{
              flexGrow: { xs: 1, md: 0 },
              mr: { md: 3 },
              fontFamily: '"Fredoka", sans-serif',
              fontWeight: 600,
              color: 'inherit',
              textDecoration: 'none',
              letterSpacing: '-0.01em',
            }}
          >
            {APP_NAME}
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, ml: 'auto' }}>
            {navLinks}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ display: { md: 'none' } }}
      >
        <Box sx={{ width: 260, pt: 2 }} role="presentation">
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', px: 2, pb: 2 }}>
            <FrogIcon sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontFamily: '"Fredoka", sans-serif', fontWeight: 600 }}>
              {APP_NAME}
            </Typography>
          </Stack>
          <List>
            <ListItemButton
              component={RouterLink}
              to="/"
              selected={location.pathname === '/'}
              onClick={() => setDrawerOpen(false)}
            >
              <ListItemText primary="Pond Dashboard" />
            </ListItemButton>
            {gameMetadata.map((game) => (
              <ListItemButton
                key={game.id}
                component={RouterLink}
                to={game.route}
                selected={isActive(game.route)}
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemText primary={game.name} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  )
}
