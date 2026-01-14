const app = {
    init() {
        console.log('App Initializing...');
        this.router.init();
    },

    router: {
        currentPage: null,

        navigate(viewName, params = {}) {
            console.log(`Navigating to ${viewName}`, params);

            const content = document.getElementById('app-content');

            // Handle Navigation State
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            // Try to find a nav button that matches or is generic
            const navBtn = document.getElementById(`nav-${viewName}`);
            if (navBtn) {
                navBtn.classList.add('active');
            } else if (viewName === 'update-member') {
                // Keep dashboard active or none? Maybe none since it's a sub-action.
                // or highlight nothing.
            }

            // Check if view exists
            if (window.views && window.views[viewName]) {
                const view = window.views[viewName];

                // Render HTML
                content.innerHTML = view.render(params);

                // Execute post-render logic (event listeners, etc)
                if (view.postRender) {
                    view.postRender(params);
                }

                this.currentPage = viewName;
            } else {
                console.error(`View ${viewName} not found.`);
                content.innerHTML = '<div style="text-align:center; padding: 50px;"><h2>404 - Page Not Found</h2></div>';
            }
        },

        init() {
            // Check if we need to restore state or just go to dashboard
            this.navigate('dashboard');
        }
    }
};

// Global views object should already be populated by individual view files
window.views = window.views || {};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
