/* -----------------------------------------
  Keyboard Users Focus Outline Logic
 ---------------------------------------- */
const handleFirstTab = (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('user-is-tabbing');
    window.removeEventListener('keydown', handleFirstTab);
    window.addEventListener('mousedown', handleMouseDownOnce);
  }
};

const handleMouseDownOnce = () => {
  document.body.classList.remove('user-is-tabbing');
  window.removeEventListener('mousedown', handleMouseDownOnce);
  window.addEventListener('keydown', handleFirstTab);
};

window.addEventListener('keydown', handleFirstTab);

/* -----------------------------------------
  Theme Switching Logic (Dark / Light)
 ---------------------------------------- */
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

// Sun & Moon SVG Paths
const sunSVG = `
  <circle cx="12" cy="12" r="4"></circle>
  <path d="M12 2v2"></path>
  <path d="M12 20v2"></path>
  <path d="m4.93 4.93 1.41 1.41"></path>
  <path d="m17.66 17.66 1.41 1.41"></path>
  <path d="M2 12h2"></path>
  <path d="M20 12h2"></path>
  <path d="m6.34 17.66-1.41 1.41"></path>
  <path d="m19.07 4.93-1.41 1.41"></path>
`;

const moonSVG = `
  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
`;

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  if (themeIcon) {
    themeIcon.innerHTML = theme === 'light' ? moonSVG : sunSVG;
  }
};

// Initial theme load
const savedTheme = localStorage.getItem('theme') || 
  (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
applyTheme(savedTheme);

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  });
}

/* -----------------------------------------
  Interactive Timeline Filtering
 ---------------------------------------- */
const filterTabs = document.querySelectorAll('.filter-tab');
const timelineItems = document.querySelectorAll('.timeline-item');

if (filterTabs.length > 0) {
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterValue = tab.getAttribute('data-filter');

      timelineItems.forEach(item => {
        const category = item.getAttribute('data-category');
        
        if (filterValue === 'all' || category === filterValue) {
          // Show items smoothly
          item.style.display = 'grid';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, 50);
        } else {
          // Hide items smoothly
          item.style.opacity = '0';
          item.style.transform = 'translateY(15px)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/* -----------------------------------------
  Fade-In Animations & Scroll Behaviors
 ---------------------------------------- */
const observerOptions = {
  threshold: 0.08,
  rootMargin: '0px 0px -50px 0px'
};

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target); // Unobserve once animated
    }
  });
}, observerOptions);

document.querySelectorAll('.fade, .timeline-item, .hack-item, .skill-col, .project-card, .award-card, .cert-card').forEach((el, i) => {
  // Stagger loading effects slightly for timeline and grids
  if (el.classList.contains('timeline-item') || el.classList.contains('hack-item')) {
    el.style.transitionDelay = `${(i % 5) * 0.05}s`;
  }
  fadeObserver.observe(el);
});

// Back to top button
const bttButton = document.getElementById('btt');
if (bttButton) {
  window.addEventListener('scroll', () => {
    bttButton.classList.toggle('show', window.scrollY > 600);
  });
}
