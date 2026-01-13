// UI Components Module
const UIComponents = (() => {
    // Toast Notifications
    const Toast = {
        show: (message, type = 'info', duration = 3000) => {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.innerHTML = `
                <div class="toast-content">
                    <span class="toast-message">${message}</span>
                </div>
            `;
            
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.remove();
            }, duration);
        },
        
        success: (message, duration = 3000) => Toast.show(message, 'success', duration),
        error: (message, duration = 3000) => Toast.show(message, 'error', duration),
        warning: (message, duration = 3000) => Toast.show(message, 'warning', duration),
        info: (message, duration = 3000) => Toast.show(message, 'info', duration)
    };

    // Dropdown
    const Dropdown = {
        init: () => {
            const toggles = document.querySelectorAll('.dropdown-toggle');
            toggles.forEach(toggle => {
                toggle.addEventListener('click', Dropdown.toggle);
            });

            document.addEventListener('click', Dropdown.closeAll);
        },

        toggle: (e) => {
            e.stopPropagation();
            const dropdown = e.target.closest('.dropdown');
            if (!dropdown) return;

            const menu = dropdown.querySelector('.dropdown-menu');
            if (menu) {
                menu.classList.toggle('show');
                e.target.classList.toggle('show');
            }
        },

        closeAll: () => {
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
            });
            document.querySelectorAll('.dropdown-toggle.show').forEach(toggle => {
                toggle.classList.remove('show');
            });
        }
    };

    // Tabs
    const Tabs = {
        init: (containerSelector) => {
            const container = document.querySelector(containerSelector);
            if (!container) return;

            const tabButtons = container.querySelectorAll('.tab-button');
            tabButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    Tabs.activate(container, button.getAttribute('data-tab'));
                });
            });
        },

        activate: (container, tabName) => {
            const buttons = container.querySelectorAll('.tab-button');
            const contents = container.querySelectorAll('.tab-content');

            buttons.forEach(btn => {
                if (btn.getAttribute('data-tab') === tabName) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            contents.forEach(content => {
                if (content.id === tabName) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        }
    };

    // Accordion
    const Accordion = {
        init: (containerSelector) => {
            const container = document.querySelector(containerSelector);
            if (!container) return;

            const headers = container.querySelectorAll('.accordion-header');
            headers.forEach(header => {
                header.addEventListener('click', () => {
                    Accordion.toggle(header);
                });
            });
        },

        toggle: (header) => {
            const item = header.closest('.accordion-item');
            if (!item) return;

            const body = item.querySelector('.accordion-body');
            const isOpen = item.classList.contains('active');

            // Close all items
            item.parentElement.querySelectorAll('.accordion-item').forEach(i => {
                i.classList.remove('active');
                const b = i.querySelector('.accordion-body');
                if (b) b.style.display = 'none';
            });

            // Open selected item
            if (!isOpen) {
                item.classList.add('active');
                if (body) body.style.display = 'block';
            }
        }
    };

    // Popover
    const Popover = {
        init: () => {
            const triggers = document.querySelectorAll('[data-popover]');
            triggers.forEach(trigger => {
                trigger.addEventListener('click', Popover.show);
            });
        },

        show: (e) => {
            e.stopPropagation();
            const trigger = e.target;
            const content = trigger.getAttribute('data-popover');
            
            // Create popover
            const popover = document.createElement('div');
            popover.className = 'popover';
            popover.innerHTML = content;
            popover.classList.add('show');

            document.body.appendChild(popover);

            const rect = trigger.getBoundingClientRect();
            popover.style.top = (rect.bottom + 10) + 'px';
            popover.style.left = rect.left + 'px';

            setTimeout(() => {
                document.addEventListener('click', () => popover.remove());
            }, 0);
        }
    };

    // Tooltip
    const Tooltip = {
        init: () => {
            const tooltips = document.querySelectorAll('[data-tooltip]');
            tooltips.forEach(el => {
                el.addEventListener('mouseenter', Tooltip.show);
                el.addEventListener('mouseleave', Tooltip.hide);
            });
        },

        show: (e) => {
            const el = e.target;
            const text = el.getAttribute('data-tooltip');
            
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip-popup';
            tooltip.textContent = text;
            tooltip.style.position = 'absolute';
            tooltip.style.zIndex = '1000';
            
            document.body.appendChild(tooltip);

            const rect = el.getBoundingClientRect();
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
            tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';

            el.setAttribute('data-tooltip-element', 'true');
        },

        hide: (e) => {
            const el = e.target;
            const tooltip = document.querySelector('.tooltip-popup');
            if (tooltip) tooltip.remove();
        }
    };

    // Collapse
    const Collapse = {
        init: () => {
            const triggers = document.querySelectorAll('[data-toggle="collapse"]');
            triggers.forEach(trigger => {
                trigger.addEventListener('click', Collapse.toggle);
            });
        },

        toggle: (e) => {
            e.preventDefault();
            const target = e.target.getAttribute('data-target');
            const element = document.querySelector(target);

            if (element) {
                element.classList.toggle('collapse');
                element.classList.toggle('show');
            }
        }
    };

    // Alert Dismissible
    const Alert = {
        init: () => {
            const alerts = document.querySelectorAll('.alert');
            alerts.forEach(alert => {
                const closeBtn = alert.querySelector('.alert-close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        alert.style.display = 'none';
                    });
                }
            });
        }
    };

    // Progress Bar
    const ProgressBar = {
        set: (selector, percentage) => {
            const bar = document.querySelector(selector);
            if (bar) {
                bar.style.width = percentage + '%';
                bar.textContent = percentage + '%';
            }
        },

        increment: (selector, amount = 10) => {
            const bar = document.querySelector(selector);
            if (bar) {
                const current = parseInt(bar.style.width) || 0;
                const newValue = Math.min(current + amount, 100);
                ProgressBar.set(selector, newValue);
            }
        }
    };

    // Badge
    const Badge = {
        create: (text, type = 'primary') => {
            const badge = document.createElement('span');
            badge.className = `badge badge-${type}`;
            badge.textContent = text;
            return badge;
        },

        update: (selector, text) => {
            const badge = document.querySelector(selector);
            if (badge) badge.textContent = text;
        }
    };

    // Spinner
    const Spinner = {
        show: (container = 'body', size = '') => {
            const spinner = document.createElement('div');
            spinner.className = `spinner ${size}`;
            document.querySelector(container).appendChild(spinner);
            return spinner;
        },

        remove: (spinner) => {
            if (spinner && spinner.parentElement) {
                spinner.remove();
            }
        }
    };

    // List Group
    const ListGroup = {
        init: (selector) => {
            const listGroup = document.querySelector(selector);
            if (!listGroup) return;

            const items = listGroup.querySelectorAll('.list-group-item');
            items.forEach(item => {
                item.addEventListener('click', () => {
                    items.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                });
            });
        }
    };

    // Card
    const Card = {
        create: (title, content, footer = '') => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-header">${title}</div>
                <div class="card-body">${content}</div>
                ${footer ? `<div class="card-footer">${footer}</div>` : ''}
            `;
            return card;
        }
    };

    // Breadcrumb
    const Breadcrumb = {
        create: (items) => {
            const nav = document.createElement('nav');
            nav.setAttribute('aria-label', 'breadcrumb');
            
            const ol = document.createElement('ol');
            ol.className = 'breadcrumb';

            items.forEach((item, index) => {
                const li = document.createElement('li');
                li.className = 'breadcrumb-item';

                if (index === items.length - 1) {
                    li.classList.add('active');
                    li.setAttribute('aria-current', 'page');
                    li.textContent = item.text;
                } else {
                    const link = document.createElement('a');
                    link.href = item.url;
                    link.textContent = item.text;
                    li.appendChild(link);
                }

                ol.appendChild(li);
            });

            nav.appendChild(ol);
            return nav;
        }
    };

    // Pagination
    const Pagination = {
        create: (currentPage, totalPages, onPageChange) => {
            const nav = document.createElement('nav');
            const ul = document.createElement('ul');
            ul.className = 'pagination';

            // Previous button
            const prevLi = document.createElement('li');
            prevLi.className = 'pagination-item';
            const prevLink = document.createElement('a');
            prevLink.className = 'pagination-link';
            prevLink.href = '#';
            prevLink.textContent = 'Previous';
            prevLink.onclick = (e) => {
                e.preventDefault();
                if (currentPage > 1) onPageChange(currentPage - 1);
            };
            if (currentPage === 1) prevLink.classList.add('disabled');
            prevLi.appendChild(prevLink);
            ul.appendChild(prevLi);

            // Page numbers
            for (let i = 1; i <= totalPages; i++) {
                const li = document.createElement('li');
                li.className = 'pagination-item';
                const link = document.createElement('a');
                link.className = 'pagination-link';
                link.href = '#';
                link.textContent = i;
                if (i === currentPage) link.classList.add('active');
                link.onclick = (e) => {
                    e.preventDefault();
                    onPageChange(i);
                };
                li.appendChild(link);
                ul.appendChild(li);
            }

            // Next button
            const nextLi = document.createElement('li');
            nextLi.className = 'pagination-item';
            const nextLink = document.createElement('a');
            nextLink.className = 'pagination-link';
            nextLink.href = '#';
            nextLink.textContent = 'Next';
            nextLink.onclick = (e) => {
                e.preventDefault();
                if (currentPage < totalPages) onPageChange(currentPage + 1);
            };
            if (currentPage === totalPages) nextLink.classList.add('disabled');
            nextLi.appendChild(nextLink);
            ul.appendChild(nextLi);

            nav.appendChild(ul);
            return nav;
        }
    };

    // Initialize all components
    const initAll = () => {
        Dropdown.init();
        Collapse.init();
        Alert.init();
        Tooltip.init();
        Popover.init();
    };

    // Public API
    return {
        Toast,
        Dropdown,
        Tabs,
        Accordion,
        Popover,
        Tooltip,
        Collapse,
        Alert,
        ProgressBar,
        Badge,
        Spinner,
        ListGroup,
        Card,
        Breadcrumb,
        Pagination,
        initAll
    };
})();

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    UIComponents.initAll();
});
