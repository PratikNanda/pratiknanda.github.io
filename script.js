/* =========================================================
   Pratik Nanda — Portfolio (Phase 3)
   Client-side interactions:
     - Typewriter effect (hero title)
     - Count-up animations (impact cards + hero KPI)
     - Scroll progress bar
     - Sticky header state
     - Mobile slide-out nav
     - Smooth scroll (with sticky-header offset)
     - Active nav link highlighting
     - Skills tab switching
     - Section entrance animations (data-animate)
     - Custom cursor (desktop only)
     - Back-to-top button
   ========================================================= */

(function () {
    'use strict';

    /* ============================================================
       TYPEWRITER EFFECT — hero title cycles through job titles
       ------------------------------------------------------------
       Plain string manipulation on setTimeout — no library.
       Each tick types or deletes one character. After fully typing
       a phrase we pause briefly, then delete it and move to the
       next phrase. Loops forever.
       ============================================================ */
    function initTypewriter() {
        const el = document.getElementById('typewriter');
        if (!el) return;

        const phrases = [
            'Data Analyst',
            'AI Automation Engineer',
            'BI Developer',
        ];
        const TYPE_SPEED = 80;
        const DELETE_SPEED = 40;
        const HOLD_AFTER_TYPE = 1800;
        const HOLD_AFTER_DELETE = 400;

        let phraseIdx = 0;
        let charIdx = phrases[0].length; // start at full first phrase
        let deleting = false;

        el.textContent = phrases[0];

        function tick() {
            const current = phrases[phraseIdx];

            if (deleting) {
                charIdx--;
                el.textContent = current.substring(0, charIdx);
                if (charIdx === 0) {
                    deleting = false;
                    phraseIdx = (phraseIdx + 1) % phrases.length;
                    setTimeout(tick, HOLD_AFTER_DELETE);
                    return;
                }
                setTimeout(tick, DELETE_SPEED);
            } else {
                charIdx++;
                el.textContent = current.substring(0, charIdx);
                if (charIdx === current.length) {
                    deleting = true;
                    setTimeout(tick, HOLD_AFTER_TYPE);
                    return;
                }
                setTimeout(tick, TYPE_SPEED);
            }
        }

        // Hold the initial phrase for a moment before the first delete.
        setTimeout(() => { deleting = true; tick(); }, HOLD_AFTER_TYPE);
    }

    /* ============================================================
       COUNT-UP ANIMATION
       ------------------------------------------------------------
       Animate a number from 0 → data-count target. Uses
       requestAnimationFrame + ease-out cubic for a smooth feel.
       Supports decimals (data-decimals attribute) and thousands
       separators for large numbers (anything >= 1000).
       Triggered by IntersectionObserver below.
       ============================================================ */
    function animateCount(el) {
        if (el.dataset.counted) return;
        el.dataset.counted = '1';

        const target = parseFloat(el.dataset.count);
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        const duration = 1600;
        const start = performance.now();

        const useSeparator = target >= 1000;
        const formatter = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });

        function frame(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            const value = target * eased;
            el.textContent = useSeparator
                ? formatter.format(value)
                : value.toFixed(decimals);

            if (progress < 1) {
                requestAnimationFrame(frame);
            } else {
                el.textContent = useSeparator
                    ? formatter.format(target)
                    : target.toFixed(decimals);
            }
        }
        requestAnimationFrame(frame);
    }

    function initCountUp() {
        const counters = document.querySelectorAll('[data-count]');
        if (!counters.length) return;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            counters.forEach((el) => {
                const target = parseFloat(el.dataset.count);
                const decimals = parseInt(el.dataset.decimals || '0', 10);
                const useSeparator = target >= 1000;
                el.textContent = useSeparator
                    ? new Intl.NumberFormat('en-US', {
                          minimumFractionDigits: decimals,
                          maximumFractionDigits: decimals,
                      }).format(target)
                    : target.toFixed(decimals);
            });
            return;
        }

        if (!('IntersectionObserver' in window)) {
            counters.forEach(animateCount);
            return;
        }

        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        animateCount(entry.target);
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.4 }
        );

        counters.forEach((el) => observer.observe(el));
    }

    /* ============================================================
       SCROLL PROGRESS BAR
       ------------------------------------------------------------
       Fills the green bar at the top of the page based on how
       far the user has scrolled through total document height.
       rAF + passive listener keeps it off the main scroll path.
       ============================================================ */
    function initScrollProgress() {
        const bar = document.getElementById('scrollProgress');
        if (!bar) return;

        let ticking = false;
        const update = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
            bar.style.width = pct + '%';
            ticking = false;
        };

        window.addEventListener(
            'scroll',
            () => {
                if (!ticking) {
                    window.requestAnimationFrame(update);
                    ticking = true;
                }
            },
            { passive: true }
        );
        update();
    }

    /* ============================================================
       STICKY HEADER STATE
       ------------------------------------------------------------
       Adds `is-scrolled` to the header once the user has scrolled
       past ~10px — CSS uses that to draw a hairline border and a
       slightly stronger backdrop.
       ============================================================ */
    function initStickyHeader() {
        const header = document.getElementById('siteHeader');
        if (!header) return;

        let ticking = false;
        const update = () => {
            header.classList.toggle('is-scrolled', window.scrollY > 10);
            ticking = false;
        };
        update();

        window.addEventListener(
            'scroll',
            () => {
                if (!ticking) {
                    window.requestAnimationFrame(update);
                    ticking = true;
                }
            },
            { passive: true }
        );
    }

    /* ============================================================
       MOBILE NAV — full-screen slide-in overlay
       ------------------------------------------------------------
       Hamburger toggles aria-expanded and adds `is-open` on the
       menu element. CSS handles the slide animation. We also
       close the menu on link click and on resize back to desktop.
       ============================================================ */
    function initMobileNav() {
        const toggle = document.getElementById('navToggle');
        const close = document.getElementById('navClose');
        const menu = document.getElementById('navMenu');
        if (!toggle || !menu) return;

        const setOpen = (isOpen) => {
            toggle.setAttribute('aria-expanded', String(isOpen));
            menu.classList.toggle('is-open', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        };

        toggle.addEventListener('click', () => {
            const isOpen = toggle.getAttribute('aria-expanded') === 'true';
            setOpen(!isOpen);
        });

        if (close) {
            close.addEventListener('click', () => setOpen(false));
        }

        menu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => setOpen(false));
        });

        const mq = window.matchMedia('(min-width: 721px)');
        const handleMq = (e) => { if (e.matches) setOpen(false); };
        if (mq.addEventListener) mq.addEventListener('change', handleMq);
        else if (mq.addListener) mq.addListener(handleMq);
    }

    /* ============================================================
       SMOOTH SCROLL — accounts for the sticky-header offset
       ------------------------------------------------------------
       CSS `scroll-behavior: smooth` handles direct anchor clicks,
       but our sticky header would cover the top of the section.
       So we intercept and offset by the header's height.
       ============================================================ */
    function initSmoothScroll() {
        const header = document.getElementById('siteHeader');
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        document.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (!href || href === '#' || href.length < 2) return;
                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();

                const offset = header ? header.offsetHeight : 0;
                const top =
                    target.getBoundingClientRect().top +
                    window.pageYOffset -
                    offset +
                    1;

                window.scrollTo({
                    top,
                    behavior: reduced ? 'auto' : 'smooth',
                });

                if (history.pushState) history.pushState(null, '', href);
            });
        });
    }

    /* ============================================================
       ACTIVE NAV HIGHLIGHTING (IntersectionObserver)
       ------------------------------------------------------------
       Watches each <section id="…">. When a section is "current"
       (its content sits in the middle band of the viewport), we
       mark the matching nav link `.is-active`.
       ============================================================ */
    function initActiveNav() {
        const sections = document.querySelectorAll('main section[id]');
        const links = document.querySelectorAll('.nav__link');
        if (!sections.length || !links.length) return;
        if (!('IntersectionObserver' in window)) return;

        const linkById = new Map();
        links.forEach((link) => {
            const href = link.getAttribute('href') || '';
            if (href.startsWith('#')) linkById.set(href.slice(1), link);
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const link = linkById.get(entry.target.id);
                    if (!link) return;
                    if (entry.isIntersecting) {
                        links.forEach((l) => l.classList.remove('is-active'));
                        link.classList.add('is-active');
                    }
                });
            },
            { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
        );

        sections.forEach((s) => observer.observe(s));
    }

    /* ============================================================
       SECTION ENTRANCE ANIMATIONS (IntersectionObserver)
       ------------------------------------------------------------
       Every element with [data-animate] starts hidden (opacity 0,
       translateY 20px). When it scrolls into view, we add
       `.is-in-view` and CSS animates it into place. One-shot —
       we unobserve after the first reveal.

       For .section__header elements specifically, the same class
       also triggers the short left-to-right underline expansion.
       ============================================================ */
    function initRevealOnScroll() {
        const items = document.querySelectorAll('[data-animate]');
        if (!items.length) return;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            items.forEach((el) => el.classList.add('is-in-view'));
            return;
        }

        if (!('IntersectionObserver' in window)) {
            items.forEach((el) => el.classList.add('is-in-view'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-in-view');
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
        );

        items.forEach((el) => observer.observe(el));

        // Also animate section headers' underlines via the same flag.
        const headers = document.querySelectorAll('.section__header');
        const headerObs = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-in-view');
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.2 }
        );
        headers.forEach((h) => headerObs.observe(h));
    }

    /* ============================================================
       SKILLS TABS — instant switching, no animation
       ------------------------------------------------------------
       Buttons with data-tab toggle the matching data-panel.
       Active tab gets `is-active` (underline indicator). Plain
       click handler — no transitions on panel switching.
       ============================================================ */
    function initSkillsTabs() {
        const tabs = document.querySelectorAll('.skills__tab');
        const panels = document.querySelectorAll('.skills__panel');
        if (!tabs.length || !panels.length) return;

        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;

                tabs.forEach((t) => {
                    const isMe = t === tab;
                    t.classList.toggle('is-active', isMe);
                    t.setAttribute('aria-selected', String(isMe));
                });

                panels.forEach((p) => {
                    p.classList.toggle('is-active', p.dataset.panel === target);
                });
            });
        });
    }

    /* ============================================================
       CUSTOM CURSOR — desktop hover devices only
       ------------------------------------------------------------
       A small green dot follows the mouse via transform updates
       on rAF. On touch devices, CSS hides the element entirely
       (display: none) so the listeners do nothing visible. The
       cursor grows when hovering interactive elements (.is-hovering).
       ============================================================ */
    function initCustomCursor() {
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        const dot = document.getElementById('cursorDot');
        if (!dot) return;

        let mouseX = 0, mouseY = 0;
        let dotX = 0, dotY = 0;
        let rafId = null;

        const render = () => {
            // Smooth follow — interpolate towards mouse position
            dotX += (mouseX - dotX) * 0.25;
            dotY += (mouseY - dotY) * 0.25;
            dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;

            if (Math.abs(mouseX - dotX) > 0.5 || Math.abs(mouseY - dotY) > 0.5) {
                rafId = requestAnimationFrame(render);
            } else {
                rafId = null;
            }
        };

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (rafId === null) rafId = requestAnimationFrame(render);
        }, { passive: true });

        // Grow on interactive elements
        const hoverSelector = 'a, button, .tool-card, .project-card, .impact-card, .ai-card, .cert-card, .flip-card, .skills__tab';
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(hoverSelector)) {
                dot.classList.add('is-hovering');
            }
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(hoverSelector)) {
                dot.classList.remove('is-hovering');
            }
        });
    }

    /* ============================================================
       BACK-TO-TOP BUTTON
       ------------------------------------------------------------
       Appears after scrolling > 300px. Click scrolls to top.
       ============================================================ */
    function initBackToTop() {
        const btn = document.getElementById('backToTop');
        if (!btn) return;

        let ticking = false;
        const update = () => {
            btn.classList.toggle('is-visible', window.scrollY > 300);
            ticking = false;
        };
        update();

        window.addEventListener(
            'scroll',
            () => {
                if (!ticking) {
                    window.requestAnimationFrame(update);
                    ticking = true;
                }
            },
            { passive: true }
        );

        btn.addEventListener('click', () => {
            const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
        });
    }

    /* ============================================================
       CV LINK GUARD
       ------------------------------------------------------------
       The "Download CV" buttons start with href="#" because no
       resume is hosted yet. Until the href is updated to a real
       Google Drive URL, this guard blocks the click so the page
       doesn't jump to the top. Once you paste a real URL into the
       href, the guard automatically lets it through.
       ============================================================ */
    function initCvLinkGuard() {
        document.querySelectorAll('.cv-link').forEach((link) => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (!href || href === '#') {
                    e.preventDefault();
                }
            });
        });
    }

    /* ============================================================
       FOOTER YEAR
       ============================================================ */
    function initFooterYear() {
        const el = document.getElementById('footerYear');
        if (el) el.textContent = String(new Date().getFullYear());
    }

    /* ----------- Boot ----------- */
    function init() {
        initScrollProgress();
        initStickyHeader();
        initMobileNav();
        initSmoothScroll();
        initActiveNav();
        initRevealOnScroll();
        initTypewriter();
        initCountUp();
        initSkillsTabs();
        initCustomCursor();
        initBackToTop();
        initCvLinkGuard();
        initFooterYear();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
