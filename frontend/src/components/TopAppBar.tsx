import { useState, type MouseEvent } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import MenuIcon from '@mui/icons-material/Menu'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { FrogIcon } from './icons/FrogIcon'
import { frogtuneGameMetadata, miniGameMetadata } from '../games/metadata'
import { APP_NAME } from '../theme/branding'
import { WalletBalance } from './wallet/WalletBalance'

function useNavMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  function openMenu(event: MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget)
  }

  function closeMenu() {
    setAnchorEl(null)
  }

  return { anchorEl, open, openMenu, closeMenu }
}

export function TopAppBar() {
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const miniGamesMenu = useNavMenu()
  const frogtuneMenu = useNavMenu()

  function isActive(route: string) {
    return location.pathname.startsWith(route)
  }

  const miniGamesActive = miniGameMetadata.some((game) => isActive(game.route))
  const frogtuneActive = frogtuneGameMetadata.some((game) => isActive(game.route))

  const desktopMenus = (
    <>
      <Button
        color={miniGamesActive ? 'primary' : 'inherit'}
        variant={miniGamesActive ? 'contained' : 'text'}
        size="small"
        endIcon={<KeyboardArrowDownIcon />}
        onClick={miniGamesMenu.openMenu}
        aria-controls={miniGamesMenu.open ? 'mini-games-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={miniGamesMenu.open ? 'true' : undefined}
      >
        Mini Games
      </Button>
      <Menu
        id="mini-games-menu"
        anchorEl={miniGamesMenu.anchorEl}
        open={miniGamesMenu.open}
        onClose={miniGamesMenu.closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {miniGameMetadata.map((game) => (
          <MenuItem
            key={game.id}
            component={RouterLink}
            to={game.route}
            selected={isActive(game.route)}
            onClick={miniGamesMenu.closeMenu}
          >
            {game.name}
          </MenuItem>
        ))}
      </Menu>

      <Button
        color={frogtuneActive ? 'primary' : 'inherit'}
        variant={frogtuneActive ? 'contained' : 'text'}
        size="small"
        endIcon={<KeyboardArrowDownIcon />}
        onClick={frogtuneMenu.openMenu}
        aria-controls={frogtuneMenu.open ? 'frogtune-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={frogtuneMenu.open ? 'true' : undefined}
      >
        Frogtune
      </Button>
      <Menu
        id="frogtune-menu"
        anchorEl={frogtuneMenu.anchorEl}
        open={frogtuneMenu.open}
        onClose={frogtuneMenu.closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {frogtuneGameMetadata.length > 0 ? (
          frogtuneGameMetadata.map((game) => (
            <MenuItem
              key={game.id}
              component={RouterLink}
              to={game.route}
              selected={isActive(game.route)}
              onClick={frogtuneMenu.closeMenu}
            >
              {game.name}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>Coming soon</MenuItem>
        )}
      </Menu>
    </>
  )

  return (
    <>
      <AppBar position="sticky" sx={{ paddingTop: 'env(safe-area-inset-top)' }}>
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

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, ml: 'auto', alignItems: 'center' }}>
            {desktopMenus}
            <WalletBalance />
          </Box>

          <Box sx={{ display: { xs: 'flex', md: 'none' }, ml: 'auto' }}>
            <WalletBalance />
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

            <ListSubheader>Mini Games</ListSubheader>
            {miniGameMetadata.map((game) => (
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

            <Divider sx={{ my: 1 }} />
            <ListSubheader>Frogtune</ListSubheader>
            {frogtuneGameMetadata.length > 0 ? (
              frogtuneGameMetadata.map((game) => (
                <ListItemButton
                  key={game.id}
                  component={RouterLink}
                  to={game.route}
                  selected={isActive(game.route)}
                  onClick={() => setDrawerOpen(false)}
                >
                  <ListItemText primary={game.name} />
                </ListItemButton>
              ))
            ) : (
              <ListItemButton disabled>
                <ListItemText primary="Coming soon" />
              </ListItemButton>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  )
}
