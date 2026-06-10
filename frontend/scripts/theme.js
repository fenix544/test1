const currentTheme = localStorage.getItem('theme');
const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

if (currentTheme === 'dark' || (!currentTheme && systemDark)) {
    document.documentElement.classList.add('dark-mode');
} else {
    document.documentElement.classList.remove('dark-mode');
}

document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('themeToggleBtn');

    if (themeBtn) {
        if (document.documentElement.classList.contains('dark-mode')) {
            themeBtn.textContent = '☀️ Jasny';
        } else {
            themeBtn.textContent = '🌙 Ciemny';
        }

        themeBtn.addEventListener('click', () => {
            const isDark = !document.documentElement.classList.contains('dark-mode');

            if (isDark) {
                document.documentElement.classList.add('dark-mode');
                themeBtn.textContent = '☀️ Jasny';
            } else {
                document.documentElement.classList.remove('dark-mode');
                themeBtn.textContent = '🌙 Ciemny';
            }

            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }
});
