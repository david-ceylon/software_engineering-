import React, { useState } from 'react';

function CalendarWidget() {
  const [currentDate] = useState(new Date(2026, 5, 15)); // Juin 2026
  const today = 15;
  
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  // Events avec des points verts
  const eventsOnDays = [12, 18, 25];
  
  // Générer les jours du mois
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Ajuster pour commencer le lundi (0 = lundi)
    const startDay = firstDay === 0 ? 6 : firstDay - 1;
    
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const days = getDaysInMonth();

  return (
    <div style={styles.calendarContainer}>
      <h2 style={styles.title}>Calendar</h2>
      <div style={styles.calendar}>
        <h3 style={styles.monthTitle}>Calendar</h3>
        
        {/* Navigation */}
        <div style={styles.navigation}>
          <button style={styles.navBtn}>∧</button>
          <button style={styles.navBtn}>∨</button>
        </div>
        
        {/* Jours de la semaine */}
        <div style={styles.weekDays}>
          {daysOfWeek.map((day, idx) => (
            <div key={idx} style={styles.weekDay}>{day}</div>
          ))}
        </div>
        
        {/* Grille des jours */}
        <div style={styles.daysGrid}>
          {days.map((day, idx) => (
            <div 
              key={idx} 
              style={{
                ...styles.day,
                ...(day === today ? styles.today : {}),
                ...(day === null ? styles.emptyDay : {}),
              }}
            >
              {day}
              {eventsOnDays.includes(day) && <span style={styles.eventDot}>•</span>}
            </div>
          ))}
        </div>
        
        {/* Bouton ajouter */}
        <button style={styles.addEventBtn}>+ Add event</button>
      </div>
    </div>
  );
}

const styles = {
  calendarContainer: {
    flex: 1,
  },
  title: {
    fontSize: '18px',
    fontWeight: '500',
    color: '#4a4a4a',
    marginBottom: '15px',
  },
  calendar: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    position: 'relative',
  },
  monthTitle: {
    textAlign: 'center',
    fontSize: '20px',
    fontWeight: '500',
    marginBottom: '15px',
    color: '#4a4a4a',
  },
  navigation: {
    position: 'absolute',
    left: '15px',
    top: '60px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  navBtn: {
    background: 'none',
    border: 'none',
    fontSize: '14px',
    color: '#888',
    cursor: 'pointer',
    padding: '2px 8px',
  },
  weekDays: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '5px',
    marginBottom: '10px',
  },
  weekDay: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#888',
    padding: '5px',
  },
  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '5px',
  },
  day: {
    textAlign: 'center',
    padding: '8px',
    fontSize: '14px',
    color: '#4a4a4a',
    position: 'relative',
    cursor: 'pointer',
    borderRadius: '4px',
  },
  today: {
    backgroundColor: '#8b9a6b',
    color: '#fff',
    borderRadius: '4px',
  },
  emptyDay: {
    visibility: 'hidden',
  },
  eventDot: {
    position: 'absolute',
    bottom: '2px',
    left: '50%',
    transform: 'translateX(-50%)',
    color: '#8b9a6b',
    fontSize: '16px',
  },
  addEventBtn: {
    width: '100%',
    marginTop: '15px',
    padding: '10px',
    backgroundColor: 'transparent',
    border: '1px dashed #ccc',
    borderRadius: '8px',
    color: '#888',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default CalendarWidget;
