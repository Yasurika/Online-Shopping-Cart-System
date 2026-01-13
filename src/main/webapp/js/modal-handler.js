// Modal Handler Module
const ModalHandler = (() => {
    const modals = new Map();

    // Modal Class
    class Modal {
        constructor(selector, options = {}) {
            this.element = document.querySelector(selector);
            this.selector = selector;
            this.options = {
                backdrop: options.backdrop !== false,
                keyboard: options.keyboard !== false,
                focus: options.focus !== false,
                animation: options.animation !== false,
                ...options
            };

            this.init();
        }

        init() {
            if (!this.element) return;

            const closeButtons = this.element.querySelectorAll('[data-modal-close], .modal-close');
            closeButtons.forEach(btn => {
                btn.addEventListener('click', () => this.hide());
            });

            if (this.options.backdrop) {
                this.element.addEventListener('click', (e) => {
                    if (e.target === this.element) {
                        this.hide();
                    }
                });
            }

            if (this.options.keyboard) {
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && this.element.classList.contains('show')) {
                        this.hide();
                    }
                });
            }
        }

        show() {
            if (!this.element) return;

            this.element.style.display = 'flex';

            if (this.options.animation) {
                setTimeout(() => {
                    this.element.classList.add('show');
                }, 10);
            } else {
                this.element.classList.add('show');
            }

            document.body.style.overflow = 'hidden';

            if (this.options.onShow) {
                this.options.onShow();
            }

            return this;
        }

        hide() {
            if (!this.element) return;

            if (this.options.animation) {
                this.element.classList.remove('show');
                setTimeout(() => {
                    this.element.style.display = 'none';
                }, 300);
            } else {
                this.element.style.display = 'none';
                this.element.classList.remove('show');
            }

            document.body.style.overflow = '';

            if (this.options.onHide) {
                this.options.onHide();
            }

            return this;
        }

        toggle() {
            if (this.element.classList.contains('show')) {
                this.hide();
            } else {
                this.show();
            }
            return this;
        }

        destroy() {
            if (!this.element) return;

            this.hide();
            this.element.removeEventListener('click', null);
            modals.delete(this.selector);
        }

        setContent(content) {
            const body = this.element.querySelector('.modal-body');
            if (body) {
                body.innerHTML = content;
            }
            return this;
        }

        getElement() {
            return this.element;
        }
    }

    // Alert Modal
    const Alert = {
        show: (message, type = 'info') => {
            return new Promise((resolve) => {
                const modalHtml = `
                    <div class="modal modal-alert modal-${type}">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h2 class="modal-title">${type.charAt(0).toUpperCase() + type.slice(1)}</h2>
                                <button class="modal-close">&times;</button>
                            </div>
                            <div class="modal-body">
                                <p>${message}</p>
                            </div>
                            <div class="modal-footer">
                                <button class="btn btn-primary" onclick="this.closest('.modal').style.display='none'">OK</button>
                            </div>
                        </div>
                    </div>
                `;

                const container = document.createElement('div');
                container.innerHTML = modalHtml;
                const modal = container.querySelector('.modal');
                document.body.appendChild(modal);

                const okBtn = modal.querySelector('.btn-primary');
                okBtn.addEventListener('click', () => {
                    modal.remove();
                    resolve(true);
                });

                modal.style.display = 'flex';
                modal.classList.add('show');
            });
        }
    };

    // Confirm Modal
    const Confirm = {
        show: (message, options = {}) => {
            return new Promise((resolve) => {
                const confirmText = options.confirmText || 'Confirm';
                const cancelText = options.cancelText || 'Cancel';

                const modalHtml = `
                    <div class="modal modal-confirm">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h2 class="modal-title">Confirm</h2>
                                <button class="modal-close">&times;</button>
                            </div>
                            <div class="modal-body">
                                <p>${message}</p>
                            </div>
                            <div class="modal-footer">
                                <button class="btn btn-secondary cancel-btn">${cancelText}</button>
                                <button class="btn btn-primary confirm-btn">${confirmText}</button>
                            </div>
                        </div>
                    </div>
                `;

                const container = document.createElement('div');
                container.innerHTML = modalHtml;
                const modal = container.querySelector('.modal');
                document.body.appendChild(modal);

                const confirmBtn = modal.querySelector('.confirm-btn');
                const cancelBtn = modal.querySelector('.cancel-btn');
                const closeBtn = modal.querySelector('.modal-close');

                const cleanup = () => modal.remove();

                confirmBtn.addEventListener('click', () => {
                    cleanup();
                    resolve(true);
                });

                cancelBtn.addEventListener('click', () => {
                    cleanup();
                    resolve(false);
                });

                closeBtn.addEventListener('click', () => {
                    cleanup();
                    resolve(false);
                });

                modal.style.display = 'flex';
                modal.classList.add('show');
            });
        }
    };

    // Prompt Modal
    const Prompt = {
        show: (message, defaultValue = '', options = {}) => {
            return new Promise((resolve) => {
                const submitText = options.submitText || 'OK';
                const cancelText = options.cancelText || 'Cancel';

                const modalHtml = `
                    <div class="modal">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h2 class="modal-title">Input</h2>
                                <button class="modal-close">&times;</button>
                            </div>
                            <div class="modal-body">
                                <p>${message}</p>
                                <input type="text" class="form-control" value="${defaultValue}">
                            </div>
                            <div class="modal-footer">
                                <button class="btn btn-secondary cancel-btn">${cancelText}</button>
                                <button class="btn btn-primary submit-btn">${submitText}</button>
                            </div>
                        </div>
                    </div>
                `;

                const container = document.createElement('div');
                container.innerHTML = modalHtml;
                const modal = container.querySelector('.modal');
                const input = modal.querySelector('input');
                document.body.appendChild(modal);

                const submitBtn = modal.querySelector('.submit-btn');
                const cancelBtn = modal.querySelector('.cancel-btn');
                const closeBtn = modal.querySelector('.modal-close');

                const cleanup = () => modal.remove();

                submitBtn.addEventListener('click', () => {
                    cleanup();
                    resolve(input.value);
                });

                cancelBtn.addEventListener('click', () => {
                    cleanup();
                    resolve(null);
                });

                closeBtn.addEventListener('click', () => {
                    cleanup();
                    resolve(null);
                });

                input.focus();
                modal.style.display = 'flex';
                modal.classList.add('show');
            });
        }
    };

    // Get or Create Modal
    const getModal = (selector, options = {}) => {
        if (!modals.has(selector)) {
            modals.set(selector, new Modal(selector, options));
        }
        return modals.get(selector);
    };

    // Show Modal
    const show = (selector, options = {}) => {
        const modal = getModal(selector, options);
        modal.show();
        return modal;
    };

    // Hide Modal
    const hide = (selector) => {
        const modal = modals.get(selector);
        if (modal) {
            modal.hide();
        }
    };

    // Toggle Modal
    const toggle = (selector, options = {}) => {
        const modal = getModal(selector, options);
        modal.toggle();
        return modal;
    };

    // Initialize Modal Triggers
    const initTriggers = () => {
        const triggers = document.querySelectorAll('[data-modal-toggle]');
        triggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const modalSelector = trigger.getAttribute('data-modal-toggle');
                toggle(modalSelector);
            });
        });

        const showTriggers = document.querySelectorAll('[data-modal-show]');
        showTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const modalSelector = trigger.getAttribute('data-modal-show');
                show(modalSelector);
            });
        });

        const hideTriggers = document.querySelectorAll('[data-modal-hide]');
        hideTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const modalSelector = trigger.getAttribute('data-modal-hide');
                hide(modalSelector);
            });
        });
    };

    // Public API
    return {
        Modal,
        getModal,
        show,
        hide,
        toggle,
        Alert,
        Confirm,
        Prompt,
        initTriggers,
        destroy: (selector) => {
            const modal = modals.get(selector);
            if (modal) {
                modal.destroy();
            }
        }
    };
})();

// Initialize modal triggers on page load
document.addEventListener('DOMContentLoaded', () => {
    ModalHandler.initTriggers();
});
