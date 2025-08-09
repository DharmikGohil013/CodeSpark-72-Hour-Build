// Theme Toggle Utility
(function() {
    // Check for saved theme preference or default to 'auto'
    const currentTheme = localStorage.getItem('theme') || 'auto';
    
    // Apply theme on page load
    applyTheme(currentTheme);
    
    function applyTheme(theme) {
        const root = document.documentElement;
        
        if (theme === 'dark') {
            root.setAttribute('data-theme', 'dark');
        } else if (theme === 'light') {
            root.removeAttribute('data-theme');
        } else {
            // Auto theme - use system preference
            root.removeAttribute('data-theme');
        }
        
        localStorage.setItem('theme', theme);
    }
    
    // Export for potential use
    window.themeManager = {
        setTheme: applyTheme,
        getCurrentTheme: () => localStorage.getItem('theme') || 'auto',
        toggle: () => {
            const current = localStorage.getItem('theme') || 'auto';
            const next = current === 'light' ? 'dark' : 'light';
            applyTheme(next);
            return next;
        }
    };
})();
