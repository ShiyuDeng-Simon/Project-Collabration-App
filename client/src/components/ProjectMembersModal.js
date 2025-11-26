import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    IconButton,
    Typography,
    Box
} from '@mui/material';
import {
    Close as CloseIcon,
    Person as PersonIcon
} from '@mui/icons-material';

export default function ProjectMembersModal({ open, onClose, members = [] }) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3 }
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Project Members
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {members.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                        No members found in this project.
                    </Box>
                ) : (
                    <List sx={{ pt: 0 }}>
                        {members.map((member) => (
                            <ListItem key={member.userid} sx={{ px: 1 }}>
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                                        <PersonIcon />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                            {member.firstname || member.firstName} {member.lastname || member.lastName}
                                        </Typography>
                                    }
                                    secondary={member.email}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="outlined">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
