function ProgressBar({ status }) {
  const getStatusColor = () => {
    switch(status) {
      case 'A':
        return '#3498db'; // Blue for Active
      case 'C':
        return '#2ecc71'; // Green for Completed
      case 'P':
        return '#f1c40f'; // Yellow for Pending
      default:
        return '#95a5a6'; // Grey for unknown status
    }
  };

  const getStatusText = () => {
    switch(status) {
      case 'A':
        return 'Active';
      case 'C':
        return 'Completed';
      case 'P':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="progress-bar">
      <div 
        className="progress-indicator"
        style={{ 
          backgroundColor: getStatusColor(),
          width: '100%'
        }}
      />
      <p className="progress-text">{getStatusText()}</p>
    </div>
  );
}

export default ProgressBar;