import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    IconButton,
    Typography,
    Box,
    Alert
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export default function InviteMemberModal({ open, onClose, projectId, onSuccess }) {
    const { token } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage('');
        setLoading(true);

        try {
            const response = await fetch(
                `${process.env.REACT_APP_SERVERURL || 'http://localhost:8000'}/api/projects/${projectId}/invitations`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ email })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send invitation');
            }

            setSuccessMessage('Invitation sent successfully!');
            setEmail('');
            if (onSuccess) onSuccess();

            // Close modal after a short delay if successful
            setTimeout(() => {
                onClose();
                setSuccessMessage('');
            }, 1500);
        } catch (err) {
            console.error('Invite member error:', err);
            setError(err.message || 'Failed to send invitation');
        } finally {
            setLoading(false);
        }
    };

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
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Invite Member
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Enter the email address of the person you want to invite to this project.
                    </Typography>

                    <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        sx={{ mb: 2 }}
                    />

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {successMessage && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {successMessage}
                        </Alert>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || !email}
                        sx={{
                            background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)'
                        }}
                    >
                        {loading ? 'Sending...' : 'Send Invitation'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
