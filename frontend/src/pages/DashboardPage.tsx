import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { DashboardHero } from '../components/dashboard/DashboardHero'
import { GameLaunchCard } from '../components/dashboard/GameLaunchCard'
import { StatCard } from '../components/dashboard/StatCard'
import { WalletCard } from '../components/dashboard/WalletCard'
import { frogtuneGames, miniGames } from '../games/registry'
import { useStats } from '../stats/useStats'

export function DashboardPage() {
  const { stats, loading } = useStats()

  const hasAnyRecords = miniGames.some((game) => {
    const gameStats = stats[game.id]
    return game.statFields.some((field) => gameStats?.values[field.key] != null)
  })

  return (
    <Stack spacing={4}>
      <DashboardHero />

      <WalletCard />

      {!loading && !hasAnyRecords && (
        <Typography variant="body2" color="text.secondary">
          Hop into a game to set your first record on the pond.
        </Typography>
      )}

      {miniGames.length > 0 && (
        <Stack spacing={2}>
          <Typography variant="h6">Mini games</Typography>
          <Grid container spacing={3}>
            {miniGames.map((game) => (
              <Grid key={game.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <StatCard game={game} stats={stats[game.id]} />
              </Grid>
            ))}
          </Grid>
        </Stack>
      )}

      {frogtuneGames.length > 0 && (
        <Stack spacing={2}>
          <Typography variant="h6">Frogtune</Typography>
          <Grid container spacing={3}>
            {frogtuneGames.map((game) => (
              <Grid key={game.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <GameLaunchCard game={game} />
              </Grid>
            ))}
          </Grid>
        </Stack>
      )}
    </Stack>
  )
}
