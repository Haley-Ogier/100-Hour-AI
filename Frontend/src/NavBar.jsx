import React from 'react';

function NavBar() {
  const styles = {
    headerNav: {
      position: 'sticky',
      top: '0px',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#fff',
      padding: '0.8rem 1.2rem',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
      'z-index': '100',
    },
    navLeft: {
      position: 'sticky',
      top: '0px',
      display: 'flex',
      alignItems: 'center',
      'z-index': '100',
    },
    navLogo: {
      position: 'sticky',
      top: '0px',
      fontSize: '1.5rem',
      color: '#7329ac',
      margin: 0,
      userSelect: 'none',
      'z-index': '100',
    },
    navRight: {
      position: 'sticky',
      top: '0px',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      'z-index': '100',
    },
    navBtn: {
      position: 'sticky',
      top: '0px',
      background: '#ffe6fa',
      border: '1px solid #ccc',
      borderRadius: '6px',
      padding: '0.5rem 1rem',
      cursor: 'pointer',
      fontSize: '0.95rem',
      transition: 'background 0.2s',
      'z-index': '100',
    },
  };

  return (
    <header style={styles.headerNav}>
      <div style={styles.navLeft}>
        <h2 style={styles.navLogo}>My Vibrant Path</h2>
      </div>
      <div style={styles.navRight}>
        <button
          style={styles.navBtn}
          onMouseEnter={(e) => (e.target.style.background = '#ffc6f2')}
          onMouseLeave={(e) => (e.target.style.background = '#ffe6fa')}
        >
          Profile
        </button>
        <button
          style={styles.navBtn}
          onMouseEnter={(e) => (e.target.style.background = '#ffc6f2')}
          onMouseLeave={(e) => (e.target.style.background = '#ffe6fa')}
        >
          AI Coaching
        </button>
        <button
          style={styles.navBtn}
          onMouseEnter={(e) => (e.target.style.background = '#ffc6f2')}
          onMouseLeave={(e) => (e.target.style.background = '#ffe6fa')}
        >
          Create Task
        </button>
        <button
          style={styles.navBtn}
          onMouseEnter={(e) => (e.target.style.background = '#ffc6f2')}
          onMouseLeave={(e) => (e.target.style.background = '#ffe6fa')}
        >
          Sign In
        </button>
        <button
          style={styles.navBtn}
          onMouseEnter={(e) => (e.target.style.background = '#ffc6f2')}
          onMouseLeave={(e) => (e.target.style.background = '#ffe6fa')}
        >
          Create New Account
        </button>
      </div>
    </header>
  );
}

export default NavBar;
