import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { DashboardHero } from '../components/dashboard/DashboardHero'
import { StatCard } from '../components/dashboard/StatCard'
import { games } from '../games/registry'
import { useStats } from '../stats/useStats'

export function DashboardPage() {
  const { stats, loading } = useStats()

  const hasAnyRecords = games.some((game) => {
    const gameStats = stats[game.id]
    return game.statFields.some((field) => gameStats?.values[field.key] != null)
  })

  return (
    <Stack spacing={4}>
      <DashboardHero stats={stats} />

      {!loading && !hasAnyRecords && (
        <Typography variant="body2" color="text.secondary">
          Hop into a game to set your first record on the pond.
        </Typography>
      )}

      <Grid container spacing={3}>
        {games.map((game) => (
          <Grid key={game.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard game={game} stats={stats[game.id]} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
