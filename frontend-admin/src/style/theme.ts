
import { createTheme } from '@mui/material/styles';

const getCssVar = (name: string) =>
  typeof window !== 'undefined'
    ? getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    : undefined;

const theme = createTheme({
  palette: {
    primary: {
      main: getCssVar('--primary-main') || '#1976d2',
      light: getCssVar('--primary-light') || '#63a4ff',
      dark: getCssVar('--primary-dark') || '#004ba0',
    },
    secondary: {
      main: getCssVar('--secondary-main') || '#9c27b0',
      light: getCssVar('--secondary-light') || '#d05ce3',
      dark: getCssVar('--secondary-dark') || '#6a0080',
    },
  },
});

export default theme;