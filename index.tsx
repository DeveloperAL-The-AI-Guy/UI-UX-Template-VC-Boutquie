import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
// Explicitly import styles to ensure bundler loads them
import './styles.css';

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 1. SCROLL INTERSECTION OBSERVER
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    const elements = document.querySelectorAll('.reveal-mask, .fade-in-up, .fade-in, .fade-in-scale');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // 2. MAGNETIC BUTTONS
  useEffect(() => {
    const buttons = document.querySelectorAll<HTMLElement>('[data-magnetic]');
    
    const handleMouseMove = (e: MouseEvent) => {
      const btn = e.currentTarget as HTMLElement;
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const deltaX = (x - centerX) * 0.2;
      const deltaY = (y - centerY) * 0.2;
      btn.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const btn = e.currentTarget as HTMLElement;
      btn.style.transform = 'translate(0px, 0px)';
    };

    buttons.forEach(btn => {
      btn.addEventListener('mousemove', handleMouseMove as EventListener);
      btn.addEventListener('mouseleave', handleMouseLeave as EventListener);
    });

    return () => {
      buttons.forEach(btn => {
        btn.removeEventListener('mousemove', handleMouseMove as EventListener);
        btn.removeEventListener('mouseleave', handleMouseLeave as EventListener);
      });
    };
  }, []);

  // 3. PARALLAX EFFECT
  useEffect(() => {
    const demoBox = document.querySelector('.motion-demo-box') as HTMLElement;
    if (!demoBox) return;

    const handleMove = (e: MouseEvent) => {
      const rect = demoBox.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      
      const layers = demoBox.querySelectorAll<HTMLElement>('.demo-layer');
      layers.forEach((layer, index) => {
        const speed = (index + 1) * 20;
        const xOffset = x * speed;
        const yOffset = y * speed;
        const zOffset = (index + 1) * 20;
        layer.style.transform = `translate3d(${xOffset}px, ${yOffset}px, ${zOffset}px)`;
      });
    };

    const handleLeave = () => {
      const layers = demoBox.querySelectorAll<HTMLElement>('.demo-layer');
      layers.forEach((layer, index) => {
        const zOffset = (index + 1) * 20;
        layer.style.transform = `translate3d(0, 0, ${zOffset}px)`;
      });
    };

    demoBox.addEventListener('mousemove', handleMove);
    demoBox.addEventListener('mouseleave', handleLeave);

    return () => {
      demoBox.removeEventListener('mousemove', handleMove);
      demoBox.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  // 4. CANVAS BACKGROUND (Vintage Particles)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let particles: Particle[] = [];
    let animationFrameId: number;
    
    // Config
    const particleCount = 40; 
    const connectionDistance = 180;
    const mouseDistance = 250;
    let mouse = { x: 0, y: 0 };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.size = Math.random() * 1.5 + 0.5;
        
        // Randomly assign Terracotta or Gold
        const isGold = Math.random() > 0.7;
        if (isGold) {
            this.color = `rgba(212, 160, 101, ${Math.random() * 0.3 + 0.1})`;
        } else {
            this.color = `rgba(201, 93, 40, ${Math.random() * 0.2 + 0.05})`;
        }
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouseDistance) {
          const angle = Math.atan2(dy, dx);
          const force = (mouseDistance - distance) / mouseDistance;
          const pushX = Math.cos(angle) * force * 0.3;
          const pushY = Math.sin(angle) * force * 0.3;
          this.x -= pushX;
          this.y -= pushY;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      ctx.strokeStyle = 'rgba(201, 93, 40, 0.05)';
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
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    
    initParticles();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* Background Canvas */}
      <canvas ref={canvasRef} id="ambient-canvas" />

      {/* Noise Overlay */}
      <div className="noise-overlay" />

      {/* Navigation */}
      <nav className="nav">
        <div className="nav-logo">VANTAGE<span className="accent-dot">.</span></div>
        <div className="nav-links">
          <a href="#thesis" className="nav-item">Thesis</a>
          <a href="#portfolio" className="nav-item">Portfolio</a>
          <a href="#contact" className="nav-item">Signal</a>
        </div>
        <div className="nav-year mono">EST. 1978 / 2024</div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="hero" id="hero">
          <div className="container">
            <div className="hero-content">
              <div className="label-wrapper fade-in-up" style={{ '--delay': '0.1s' } as React.CSSProperties}>
                <span className="mono-label">VOL. IV &mdash; QUARTERLY REPORT</span>
              </div>
              
              <h1 className="hero-title">
                <span className="reveal-mask"><span className="reveal-text">Capital for the</span></span>
                <span className="reveal-mask"><span className="reveal-text">Bold & <span className="text-accent">Avant-Garde</span></span></span>
              </h1>

              <div className="hero-sub reveal-mask">
                <p className="reveal-text body-text" style={{ '--delay': '0.6s' } as React.CSSProperties}>
                  We invest in the architects of the future. A disciplined approach to allocation, guided by heritage and driven by vision.
                </p>
              </div>

              <div className="hero-actions fade-in-up" style={{ '--delay': '0.8s' } as React.CSSProperties}>
                <button className="btn btn-primary" data-magnetic>
                  <span className="btn-text">Read the Thesis</span>
                  <span className="btn-icon">↗</span>
                </button>
                <button className="btn btn-secondary" data-magnetic>
                  <span className="btn-text">Limited Partners</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="scroll-indicator fade-in">
            <span className="mono">SCROLL TO ADVANCE</span>
            <div className="line"></div>
          </div>
        </section>

        {/* Section 1 */}
        <section className="section" id="thesis">
          <div className="container">
            <div className="section-header fade-in-up">
              <span className="mono-label">01 // INVESTMENT THESIS</span>
              <h2 className="section-title">The New <br />Standard</h2>
            </div>

            <div className="grid-3">
              <div className="card fade-in-up" style={{ '--delay': '0.1s' } as React.CSSProperties}>
                <div className="card-header-line"></div>
                <h3 className="card-title">Infrastructure</h3>
                <p className="card-body">
                  Building the rails for the next century of digital commerce. Robust, scalable, and enduring systems.
                </p>
                <div className="card-footer mono">FIG. A</div>
              </div>

              <div className="card fade-in-up" style={{ '--delay': '0.2s' } as React.CSSProperties}>
                <div className="card-header-line"></div>
                <h3 className="card-title">Intelligence</h3>
                <p className="card-body">
                  Cognitive computing and decision engines that amplify human agency rather than replace it.
                </p>
                <div className="card-footer mono">FIG. B</div>
              </div>

              <div className="card fade-in-up" style={{ '--delay': '0.3s' } as React.CSSProperties}>
                <div className="card-header-line"></div>
                <h3 className="card-title">Culture</h3>
                <p className="card-body">
                  Platforms that define the zeitgeist. Where technology meets liberal arts and human connection.
                </p>
                <div className="card-footer mono">FIG. C</div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="section" id="portfolio">
          <div className="container">
            <div className="split-layout">
              <div className="split-content fade-in-up">
                <span className="mono-label">02 // STRATEGY</span>
                <h2 className="section-title">Analog Trust,<br />Digital Scale.</h2>
                <p className="body-text">
                  We operate with the discretion of a private bank and the speed of a software startup. Our network is our net worth.
                </p>
                <ul className="feature-list mono">
                  <li className="feature-item">
                    <span className="check">●</span> <span>HIGH CONVICTION BETS</span>
                  </li>
                  <li className="feature-item">
                    <span className="check">●</span> <span>LONG TIME HORIZONS</span>
                  </li>
                  <li className="feature-item">
                    <span className="check">●</span> <span>OPERATIONAL EXCELLENCE</span>
                  </li>
                </ul>
              </div>
              <div className="split-visual">
                <div className="motion-demo-box fade-in-scale">
                  <div className="demo-layer layer-1"></div>
                  <div className="demo-layer layer-2"></div>
                  <div className="demo-layer layer-3">
                    <div className="architectural-grid"></div>
                  </div>
                  <div className="demo-caption mono">GROWTH_VECTOR_IV</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="cta-section" id="contact">
          <div className="container">
            <div className="cta-content fade-in-up">
              <h2 className="cta-title">Join the <br />Syndicate.</h2>
              <p className="cta-text">Access is limited. Quality is absolute.</p>
              <button className="btn btn-primary btn-large" data-magnetic>
                <span className="btn-text">Inquire Access</span>
              </button>
              <div className="cta-disclaimer mono">
                NEW YORK — LONDON — TOKYO
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container footer-content">
          <div className="footer-left mono">
            © VANTAGE HOLDINGS 2024
          </div>
          <div className="footer-right mono">
            <a href="#">LEGAL</a>
            <a href="#">MANIFESTO</a>
            <a href="#">TWITTER</a>
          </div>
        </div>
      </footer>
    </>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
