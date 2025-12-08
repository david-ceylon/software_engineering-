import React from 'react';

function BudgetWidget() {
  const budgetData = {
    venue: 30000,
    catering: 20000,
    remaining: 100000,
    total: 150000,
  };

  const venuePercent = (budgetData.venue / budgetData.total) * 100;
  const cateringPercent = (budgetData.catering / budgetData.total) * 100;
  const remainingPercent = (budgetData.remaining / budgetData.total) * 100;

  return (
    <div style={styles.container}>
      <div style={styles.leftSection}>
        {/* Pie Chart Placeholder */}
        <div style={styles.pieChart}>
          <svg viewBox="0 0 100 100" style={styles.svg}>
            {/* Venue slice - green */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#8b9a6b"
              strokeWidth="20"
              strokeDasharray={`${venuePercent * 2.51} ${251 - venuePercent * 2.51}`}
              strokeDashoffset="0"
              transform="rotate(-90 50 50)"
            />
            {/* Catering slice - olive */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#c4c9a7"
              strokeWidth="20"
              strokeDasharray={`${cateringPercent * 2.51} ${251 - cateringPercent * 2.51}`}
              strokeDashoffset={`${-venuePercent * 2.51}`}
              transform="rotate(-90 50 50)"
            />
            {/* Remaining slice - cream */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#f5f3eb"
              strokeWidth="20"
              strokeDasharray={`${remainingPercent * 2.51} ${251 - remainingPercent * 2.51}`}
              strokeDashoffset={`${-(venuePercent + cateringPercent) * 2.51}`}
              transform="rotate(-90 50 50)"
            />
          </svg>
        </div>
      </div>
      
      <div style={styles.rightSection}>
        <h3 style={styles.title}>Budget</h3>
        
        {/* Progress Bar */}
        <div style={styles.progressBar}>
          <div style={{...styles.progressSegment, width: `${venuePercent}%`, backgroundColor: '#8b9a6b'}}></div>
          <div style={{...styles.progressSegment, width: `${cateringPercent}%`, backgroundColor: '#c4c9a7'}}></div>
          <div style={{...styles.progressSegment, width: `${remainingPercent}%`, backgroundColor: '#e8e4d9'}}></div>
        </div>
        
        {/* Labels */}
        <div style={styles.labels}>
          <div style={styles.labelItem}>
            <span style={styles.labelName}>Venue</span>
            <span style={styles.labelValue}>{budgetData.venue.toLocaleString()}</span>
          </div>
          <div style={styles.labelItem}>
            <span style={styles.labelName}>Catering</span>
            <span style={styles.labelValue}>{budgetData.catering.toLocaleString()}</span>
          </div>
          <div style={styles.labelItem}>
            <span style={styles.labelName}>Remaining</span>
            <span style={styles.labelValue}>{budgetData.remaining.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  leftSection: {
    width: '100px',
  },
  pieChart: {
    width: '100px',
    height: '100px',
  },
  svg: {
    width: '100%',
    height: '100%',
  },
  rightSection: {
    flex: 1,
  },
  title: {
    fontSize: '18px',
    fontWeight: '500',
    color: '#4a4a4a',
    marginBottom: '15px',
    margin: '0 0 15px 0',
  },
  progressBar: {
    display: 'flex',
    height: '12px',
    borderRadius: '6px',
    overflow: 'hidden',
    marginBottom: '15px',
  },
  progressSegment: {
    height: '100%',
  },
  labels: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  labelItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  labelName: {
    fontSize: '12px',
    color: '#888',
    marginBottom: '4px',
  },
  labelValue: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#4a4a4a',
  },
};

export default BudgetWidget;
