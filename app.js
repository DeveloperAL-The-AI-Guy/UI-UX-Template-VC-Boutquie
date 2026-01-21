/**
 * ZENITH APP CONTROLLER
 * Vanilla JS, no dependencies.
 */

document.addEventListener('DOMContentLoaded', () => {
    initScrollObserver();
    initMagneticButtons();
    initParallax();
    initCanvasBackground();
    initSmoothScroll();
});

/* --- 1. SCROLL INTERSECTION OBSERVER --- */
function initScrollObserver() {
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: Stop observing once revealed for performance
                observer.unobserve(entry.target); 
            }
        });
    }, options);

    // Targets
    const revealElements = document.querySelectorAll('.reveal-mask, .fade-in-up, .fade-in, .fade-in-scale');
    revealElements.forEach(el => observer.observe(el));
}

/* --- 2. MAGNETIC BUTTONS EFFECT --- */
function initMagneticButtons() {
    const buttons = document.querySelectorAll('[data-magnetic]');
    
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate distance from center
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const deltaX = (x - centerX) * 0.2; // Strength
            const deltaY = (y - centerY) * 0.2;

            btn.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0px, 0px)';
        });
    });
}

/* --- 3. PARALLAX EFFECT ON MOUSEMOVE --- */
function initParallax() {
    const demoBox = document.querySelector('.motion-demo-box');
    if (!demoBox) return;

    demoBox.addEventListener('mousemove', (e) => {
        const rect = demoBox.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        const layers = demoBox.querySelectorAll('.demo-layer');
        
        layers.forEach((layer, index) => {
            const speed = (index + 1) * 20;
            const xOffset = x * speed;
            const yOffset = y * speed;
            const zOffset = (index + 1) * 20;
            
            layer.style.transform = `translate3d(${xOffset}px, ${yOffset}px, ${zOffset}px)`;
        });
    });

    demoBox.addEventListener('mouseleave', () => {
        const layers = demoBox.querySelectorAll('.demo-layer');
        layers.forEach((layer, index) => {
            const zOffset = (index + 1) * 20;
            layer.style.transform = `translate3d(0, 0, ${zOffset}px)`;
        });
    });
}

/* --- 4. CANVAS BACKGROUND (VINTAGE PARTICLES) --- */
function initCanvasBackground() {
    const canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    
    // Configuration
    const particleCount = 50; // Reduced count for cleaner look
    const connectionDistance = 180;
    const mouseDistance = 250;

    let mouse = { x: 0, y: 0 };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        createParticles();
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // Slower, heavier movement for luxury feel
            this.vx = (Math.random() - 0.5) * 0.2; 
            this.vy = (Math.random() - 0.5) * 0.2;
            this.size = Math.random() * 1.5 + 0.5;
            
            // Randomly assign Terracotta or Muted Gold
            const isGold = Math.random() > 0.7;
            if (isGold) {
                this.color = `rgba(212, 160, 101, ${Math.random() * 0.3 + 0.1})`; // Gold
            } else {
                this.color = `rgba(201, 93, 40, ${Math.random() * 0.2 + 0.05})`; // Terracotta
            }
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Boundary bounce
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Mouse interaction (Gentle push)
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouseDistance) {
                const angle = Math.atan2(dy, dx);
                const force = (mouseDistance - distance) / mouseDistance;
                const pushX = Math.cos(angle) * force * 0.3; // Gentle force
                const pushY = Math.sin(angle) * force * 0.3;
                
                this.x -= pushX;
                this.y -= pushY;
            }
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function createParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Draw particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw connections
        ctx.strokeStyle = 'rgba(201, 93, 40, 0.05)'; // Very faint terracotta lines
        ctx.lineWidth = 0.5;
        
        for (let i = 0; i < particles.length; i++) {
            for (let j = i; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
}

/* --- 5. SMOOTH SCROLL ANCHORS --- */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}
