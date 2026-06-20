import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { games } from './games/registry'
import { DashboardPage } from './pages/DashboardPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          {games.map((game) => (
            <Route
              key={game.id}
              path={game.route}
              element={<game.component />}
            />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
