import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert
} from '@mui/material';
import { Close as CloseIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';

export default function CreateProjectModal({ onClose, onSuccess }) {
  const { token } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    status: 'Planning',
    invitations: ['']
  });

  const steps = ['Project Details', 'Invite Members'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInvitationChange = (index, value) => {
    const newInvitations = [...formData.invitations];
    newInvitations[index] = value;
    setFormData(prev => ({ ...prev, invitations: newInvitations }));
  };

  const addInvitationField = () => {
    setFormData(prev => ({ ...prev, invitations: [...prev.invitations, ''] }));
  };

  const removeInvitationField = (index) => {
    setFormData(prev => ({
      ...prev,
      invitations: prev.invitations.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 0) {
      setStep(1);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Create project
      const projectResponse = await fetch(
        `${process.env.REACT_APP_SERVERURL || 'http://localhost:8000'}/api/projects`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            startDate: formData.startDate || null,
            status: formData.status
          })
        }
      );

      const project = await projectResponse.json();

      if (!projectResponse.ok) {
        throw new Error(project.error || 'Failed to create project');
      }

      // Send invitations
      const validEmails = formData.invitations.filter(email => email.trim() !== '');
      for (const email of validEmails) {
        try {
          await fetch(
            `${process.env.REACT_APP_SERVERURL || 'http://localhost:8000'}/api/projects/${project.projectid || project.ProjectID}/invitations`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ email: email.trim() })
            }
          );
        } catch (err) {
          console.error('Failed to send invitation:', err);
        }
      }

      onSuccess(project);
    } catch (err) {
      console.error('Create project error:', err);
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Create New Project</span>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Stepper activeStep={step} sx={{ px: 3, pt: 2 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {step === 0 && (
            <Box>
              <TextField
                fullWidth
                label="Project Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Start Date (Optional)"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    <MenuItem value="Planning">Planning</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          )}

          {step === 1 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PersonAddIcon />
                <Typography variant="h6">Invite Team Members</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                Enter email addresses to invite members to your project (optional)
              </Typography>

              {formData.invitations.map((email, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                  <TextField
                    fullWidth
                    type="email"
                    value={email}
                    onChange={(e) => handleInvitationChange(index, e.target.value)}
                    placeholder="member@example.com"
                  />
                  {formData.invitations.length > 1 && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => removeInvitationField(index)}
                      sx={{ minWidth: '100px' }}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              ))}

              <Button
                variant="outlined"
                startIcon={<PersonAddIcon />}
                onClick={addInvitationField}
                sx={{ mt: 1 }}
              >
                Add Another
              </Button>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          {step === 0 ? (
            <>
              <Button onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={!formData.title}>
                Next: Invite Members
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setStep(0)}>Back</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !formData.title}
                sx={{
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)'
                }}
              >
                {loading ? 'Creating...' : 'Create Project'}
              </Button>
            </>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
}
