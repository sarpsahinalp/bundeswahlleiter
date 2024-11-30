import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from '@mui/material/Container';
import AdbIcon from '@mui/icons-material/Adb';

export default function WISToolbar() {

    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Container maxWidth={false}>
                <Toolbar disableGutters>
                    <AdbIcon/>
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        WIS
                    </Typography>


                </Toolbar>
            </Container>
        </AppBar>
    );
}