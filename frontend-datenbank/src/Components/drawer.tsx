import {useState} from "react";
import MuiDrawer from '@mui/material/Drawer';
import Toolbar from "@mui/material/Toolbar";
import {Divider, IconButton, List, ListItem, ListItemButton, ListItemIcon} from "@mui/material";
import ListItemText from '@mui/material/ListItemText';
import {page} from "../models/page.tsx";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export default function WISDrawer(
    {pages, onPageSelect}:
    {pages: page[], onPageSelect: (page: page) => void}
){
    const [open, setOpen] = useState(false);

    const handleDrawerChange = () => {
        setOpen(!open);
    };


    return (
        <MuiDrawer
            variant="permanent"
            anchor="left"
            open={open}
        >
            <Toolbar />
            <IconButton onClick={handleDrawerChange} sx={{width: 40}}>
                {!open ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
            <Divider />
            <List>
                {pages.map((page) => (
                    <ListItem key={page.title} disablePadding>
                        <ListItemButton
                            onClick={() => onPageSelect(page)}
                        >
                            <ListItemIcon>
                                {page.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={page.title}
                                sx={[open ? {} : {display: "none",}]}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </MuiDrawer>
    )
}