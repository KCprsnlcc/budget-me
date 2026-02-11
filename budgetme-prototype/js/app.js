/**
* BudgetMe Dashboard Prototype - Main Application Logic
* Handles module loading, navigation, and UI interactions
*/

// ========================================
// Global Modal & UI Functions
// Defined globally to ensure availability for inline onclick handlers
// ========================================

window.openModal = function (id) {
    console.log('Opening modal:', id);
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    } else {
        console.error('Modal not found:', id);
    }
};

window.closeModal = function (id) {
    console.log('Closing modal:', id);
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
};

window.selectType = function (element, type) {
    // Remove active class from all buttons in the same container
    const container = element.parentElement;
    container.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.remove('active', 'income', 'expense', 'contribution');
    });

    // Add active class to clicked button
    element.classList.add('active', type);
};

// Close modal when clicking overlay (Global delegation)
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('open');
        document.body.style.overflow = '';
    }
});


(function () {
    'use strict';

    // ========================================
    // Configuration
    // ========================================
    const CONFIG = {
        defaultModule: 'dashboard',
        transitionDuration: 200
    };

    // Module metadata for breadcrumbs and page titles
    const MODULE_META = {
        dashboard: { title: 'Dashboard', category: 'Platform', path: 'modules/dashboard.html' },
        transactions: { title: 'Transactions', category: 'Platform', path: 'modules/transactions.html' },
        budgets: { title: 'Budgets', category: 'Platform', path: 'modules/budgets.html' },
        goals: { title: 'Financial Goals', category: 'Platform', path: 'modules/goals.html' },
        predictions: { title: 'AI Predictions', category: 'Platform', path: 'modules/predictions.html' },
        reports: { title: 'Financial Reports', category: 'Platform', path: 'modules/reports.html' },
        chatbot: { title: 'BudgetSense AI', category: 'Intelligence', path: 'modules/chatbot.html' },
        family: { title: 'Family', category: 'Settings', path: 'modules/family.html' },
        settings: { title: 'Settings', category: 'Settings', path: 'modules/settings.html' }
    };

    // ========================================
    // DOM Elements (Initially null, will be populated after layout loads)
    // ========================================
    let $mainContent, $breadcrumbCategory, $currentPage, $navItems, $mobileMenuBtn, $mobileOverlay, $mobileSidebar, $closeMobileMenu;

    // ========================================
    // Module/Layout Loading
    // ========================================

    // Track active modals moved to body
    let activeModals = [];

    /**
     * Load the application layout (sidebar, header, etc.)
     */
    async function loadLayout() {
        try {
            const response = await fetch(`modules/layout.html`);
            if (!response.ok) throw new Error('Failed to load layout');

            const html = await response.text();
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;

            // Distribute layout components
            const desktopSidebar = tempDiv.querySelector('aside:not(#mobile-sidebar)');
            const header = tempDiv.querySelector('header');
            const mobileOverlay = tempDiv.querySelector('#mobile-overlay');
            const mobileSidebar = tempDiv.querySelector('#mobile-sidebar');

            if (desktopSidebar) document.getElementById('layout-sidebar-desktop').appendChild(desktopSidebar);
            if (header) document.getElementById('layout-header').appendChild(header);
            if (mobileOverlay) document.getElementById('layout-mobile-container').appendChild(mobileOverlay);
            if (mobileSidebar) document.getElementById('layout-mobile-container').appendChild(mobileSidebar);

            // Update DOM references
            updateDOMReferences();

            // Setup event listeners for layout elements
            setupLayoutEventListeners();

            return true;
        } catch (error) {
            console.error('Error loading layout:', error);
            return false;
        }
    }

    function updateDOMReferences() {
        $mainContent = document.getElementById('main-content');
        $breadcrumbCategory = document.getElementById('breadcrumb-category');
        $currentPage = document.getElementById('current-page');
        $navItems = document.querySelectorAll('.nav-item');
        $mobileMenuBtn = document.getElementById('mobile-menu-btn');
        $mobileOverlay = document.getElementById('mobile-overlay');
        $mobileSidebar = document.getElementById('mobile-sidebar');
        $closeMobileMenu = document.getElementById('close-mobile-menu');
    }

    function setupLayoutEventListeners() {
        // Navigation item clicks
        $navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const moduleName = item.dataset.module;
                if (moduleName) {
                    loadModule(moduleName);
                }
            });
        });

        // Mobile menu toggle
        $mobileMenuBtn?.addEventListener('click', openMobileMenu);
        $mobileOverlay?.addEventListener('click', closeMobileMenu);
        $closeMobileMenu?.addEventListener('click', closeMobileMenu);

        // Filter buttons (in header)
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    /**
     * Load a module's HTML content into the main content area
     * @param {string} moduleName - Name of the module to load
     */
    async function loadModule(moduleName) {
        if (!MODULE_META[moduleName]) {
            console.error(`Unknown module: ${moduleName}`);
            return;
        }

        // Start fade out transition
        if ($mainContent) $mainContent.classList.add('fade-out');

        await sleep(CONFIG.transitionDuration);

        try {
            // Clean up previous modals
            activeModals.forEach(modal => modal.remove());
            activeModals = [];

            const response = await fetch(MODULE_META[moduleName].path);

            if (!response.ok) {
                throw new Error(`Failed to load module: ${moduleName}`);
            }

            const html = await response.text();
            if ($mainContent) {
                $mainContent.innerHTML = html;
                executeScripts($mainContent);
                $mainContent.classList.remove('fade-out');
                $mainContent.classList.add('fade-in');

                // Move modals to body to escape stacking context
                const modals = $mainContent.querySelectorAll('.modal-overlay');
                modals.forEach(modal => {
                    document.body.appendChild(modal);
                    activeModals.push(modal);
                });
            }

            // Update UI elements
            updateActiveNavItem(moduleName);
            updateBreadcrumb(moduleName);
            updatePageTitle(moduleName);
            updateURLHash(moduleName);

            // Close mobile menu if open
            closeMobileMenu();

        } catch (error) {
            console.error('Error loading module:', error);
            if ($mainContent) {
                $mainContent.innerHTML = getErrorTemplate(moduleName);
                $mainContent.classList.remove('fade-out');
            }
        }
    }

    /**
     * Update the active state on navigation items
     * @param {string} moduleName - Active module name
     */
    function updateActiveNavItem(moduleName) {
        if (!$navItems) return;
        $navItems.forEach(item => {
            const isActive = item.dataset.module === moduleName;
            item.classList.toggle('active', isActive);
        });
    }

    /**
     * Update the breadcrumb navigation
     * @param {string} moduleName - Current module name
     */
    function updateBreadcrumb(moduleName) {
        const meta = MODULE_META[moduleName];
        if ($breadcrumbCategory) {
            $breadcrumbCategory.textContent = meta.category;
        }
        if ($currentPage) {
            $currentPage.textContent = meta.title;
        }
    }

    /**
     * Update the page title
     * @param {string} moduleName - Current module name
     */
    function updatePageTitle(moduleName) {
        const meta = MODULE_META[moduleName];
        document.title = `BudgetMe - ${meta.title}`;
    }

    /**
     * Update the URL hash for deep linking
     * @param {string} moduleName - Current module name
     */
    function updateURLHash(moduleName) {
        if (window.location.hash !== `#${moduleName}`) {
            history.pushState(null, '', `#${moduleName}`);
        }
    }

    /**
     * Get the module name from the URL hash
     * @returns {string} Module name or default
     */
    function getModuleFromHash() {
        const hash = window.location.hash.slice(1);
        return MODULE_META[hash] ? hash : CONFIG.defaultModule;
    }

    /**
     * Execute scripts found in the container
     * @param {HTMLElement} container
     */
    function executeScripts(container) {
        const scripts = container.querySelectorAll('script');
        Array.from(scripts).forEach(script => {
            const newScript = document.createElement('script');
            Array.from(script.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            newScript.textContent = script.textContent;
            script.parentNode.replaceChild(newScript, script);
        });
    }

    // ========================================
    // Mobile Navigation
    // ========================================

    function openMobileMenu() {
        $mobileSidebar?.classList.add('open');
        $mobileOverlay?.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        $mobileSidebar?.classList.remove('open');
        $mobileOverlay?.classList.remove('open');
        document.body.style.overflow = '';
    }

    // ========================================
    // Utility Functions
    // ========================================

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function getErrorTemplate(moduleName) {
        return `
            <div class="max-w-6xl mx-auto">
                <div class="bg-white rounded-xl border border-slate-200/60 shadow-sm p-12 text-center">
                    <iconify-icon icon="solar:danger-triangle-linear" class="text-amber-500" width="48"></iconify-icon>
                    <h3 class="text-lg font-semibold text-slate-900 mt-4 mb-2">Module Not Found</h3>
                    <p class="text-sm text-slate-500 mb-6">
                        The "${moduleName}" module could not be loaded. Please check that the file exists.
                    </p>
                    <button onclick="window.loadModule('dashboard')" class="btn btn-primary">
                        <iconify-icon icon="solar:home-2-linear" width="16"></iconify-icon>
                        Return to Dashboard
                    </button>
                </div>
            </div>
        `;
    }

    // ========================================
    // Initialization
    // ========================================

    // Expose loadModule globally for error template button
    window.loadModule = loadModule;
    window.executeScripts = executeScripts;

    // Load layout and initial module
    document.addEventListener('DOMContentLoaded', async () => {
        const layoutLoaded = await loadLayout();
        if (layoutLoaded) {
            const initialModule = getModuleFromHash();
            loadModule(initialModule);
        }
    });

    // Browser back/forward navigation
    window.addEventListener('popstate', () => {
        const moduleName = getModuleFromHash();
        loadModule(moduleName);
    });

})();
