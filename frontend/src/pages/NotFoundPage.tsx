import { Box, Button, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

/** Auffangseite für unbekannte Adressen. */
export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h1" gutterBottom>
        Seite nicht gefunden
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Die aufgerufene Adresse existiert nicht oder ist für Sie nicht freigegeben.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        Zur Übersicht
      </Button>
    </Box>
  )
}
