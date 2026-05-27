import React, { useEffect, useMemo, useRef, useState } from 'react';

const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;

const CHARACTERS = [
  {
    src: asset('images/Gaming-Character.png'),
    title: 'THE GAMER',
    role: 'INTENSE · REACTIVE',
    bg: '#f1eeea',
  },
  {
    src: asset('images/Office-Character.png'),
    title: 'THE PLANNER',
    role: 'STRATEGIC · DETAIL-DRIVEN',
    bg: '#f1eeea',
  },
  {
    src: asset('images/Coder-Character.png'),
    title: 'THE CODER',
    role: 'CAFFEINE-POWERED · BUILDER',
    bg: '#f1eeea',
  },
  {
    src: asset('images/Fantasy-Character.png'),
    title: 'THE FANTASY',
    role: 'VISIONARY · UNCONVENTIONAL',
    bg: '#f1eeea',
  },
];

const SKILL_CARDS = [
  {
    id: 'web-dev',
    number: '01',
    skill: 'Web Development',
    codename: 'THE CODER',
    copy:
      'Building clean, scalable interfaces and turning visual concepts into polished web experiences.',
    image: asset('images/Coder-Character.png'),
    tags: ['React', 'Next.js', 'Vue', 'Tailwind'],
    accent: '#74b7ff',
  },
  {
    id: 'motion-3d',
    number: '02',
    skill: 'Motion & 3D',
    codename: 'THE GAMER',
    copy:
      'Creating movement, depth, and cinematic interaction that makes digital work feel alive.',
    image: asset('images/Gaming-Character.png'),
    tags: ['Blender', 'After Effects', 'Three.js', 'GSAP'],
    accent: '#ff7d91',
  },
  {
    id: 'creative-direction',
    number: '03',
    skill: 'Creative Direction',
    codename: 'THE FANTASY',
    copy:
      'Designing identity-driven systems, storytelling, and visual worlds that give each project its own character.',
    image: asset('images/Fantasy-Character.png'),
    tags: ['Identity', 'Layout', 'Storytelling', 'Art Direction'],
    accent: '#c998ff',
  },
];

function getSlideState(index, activeIndex) {
  const total = CHARACTERS.length;
  const prevIndex = (activeIndex - 1 + total) % total;
  const nextIndex = (activeIndex + 1) % total;

  if (index === activeIndex) return 'is-active';
  if (index === prevIndex) return 'is-prev';
  if (index === nextIndex) return 'is-next';
  return 'is-hidden';
}

function TiltSkillCard({ card }) {
  const [tiltStyle, setTiltStyle] = useState({
    '--rx': '0deg',
    '--ry': '0deg',
    '--mx': '50%',
    '--my': '50%',
  });

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const px = x / rect.width;
    const py = y / rect.height;

    const rotateY = (px - 0.5) * 12;
    const rotateX = (0.5 - py) * 12;

    setTiltStyle({
      '--rx': `${rotateX}deg`,
      '--ry': `${rotateY}deg`,
      '--mx': `${px * 100}%`,
      '--my': `${py * 100}%`,
    });
  };

  const handleLeave = () => {
    setTiltStyle({
      '--rx': '0deg',
      '--ry': '0deg',
      '--mx': '50%',
      '--my': '50%',
    });
  };

  return (
    <article
      className="skill-reveal-card"
      style={{ ...tiltStyle, '--skill-accent': card.accent }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div className="skill-holo" />

      <div className="skill-card-top">
        <span className="skill-card-number">{card.number}</span>
        <span className="skill-card-code">{card.codename}</span>
      </div>

      <div className="skill-card-art">
        <img src={card.image} alt={card.codename} draggable="false" />
      </div>

      <div className="skill-card-body">
        <h3>{card.skill}</h3>
        <p>{card.copy}</p>

        <div className="skill-card-tags">
          {card.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const [packOpened, setPackOpened] = useState(false);
  const [openingPack, setOpeningPack] = useState(false);
  const [revealedIndexes, setRevealedIndexes] = useState([]);
  const [flashingCardIndex, setFlashingCardIndex] = useState(null);

  const timerRefs = useRef([]);
  const cardRefs = useRef([]);

  const activeCharacter = CHARACTERS[activeIndex];
  const revealedCount = revealedIndexes.length;
  const allCardsRevealed = revealedCount >= SKILL_CARDS.length;

  const ghostWord = useMemo(() => {
    return activeCharacter.title.replace('THE ', '');
  }, [activeCharacter.title]);

  const clearPackTimers = () => {
    timerRefs.current.forEach((id) => window.clearTimeout(id));
    timerRefs.current = [];
  };

  const closePack = () => {
    clearPackTimers();
    setPackOpened(false);
    setOpeningPack(false);
    setRevealedIndexes([]);
    setFlashingCardIndex(null);
  };

  const addTimer = (callback, delay) => {
    const id = window.setTimeout(callback, delay);
    timerRefs.current.push(id);
  };

  const scrollToCard = (cardIndex, delay = 120) => {
    const shouldAutoScroll = window.matchMedia('(max-width: 900px)').matches;

    if (!shouldAutoScroll) return;

    window.setTimeout(() => {
      const cardElement = cardRefs.current[cardIndex];
      if (!cardElement) return;

      const rect = cardElement.getBoundingClientRect();
      const topOffset = 96;
      const targetTop = rect.top + window.scrollY - topOffset;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth',
      });
    }, delay);
  };

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + CHARACTERS.length) % CHARACTERS.length);
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % CHARACTERS.length);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleOpenPack = () => {
    if (packOpened || openingPack) return;

    setPackOpened(true);
    setOpeningPack(true);
    setRevealedIndexes([]);
    setFlashingCardIndex(null);

    addTimer(() => {
      setOpeningPack(false);
      scrollToCard(0, 120);
    }, 420);
  };

  const handleRevealCard = (cardIndex) => {
    if (!packOpened) {
      handleOpenPack();
      return;
    }

    if (revealedIndexes.includes(cardIndex) || flashingCardIndex !== null) return;

    setFlashingCardIndex(cardIndex);
    scrollToCard(cardIndex, 80);

    addTimer(() => {
      setRevealedIndexes((prev) => {
        if (prev.includes(cardIndex)) return prev;
        return [...prev, cardIndex].sort((a, b) => a - b);
      });

      setFlashingCardIndex(null);
    }, 520);
  };

  const handleSkillsBackgroundClick = (event) => {
    if (!packOpened) return;

    const clickedInsideArsenal = event.target.closest('.arsenal-interactive-area');

    if (!clickedInsideArsenal) {
      closePack();
    }
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CHARACTERS.length);
    }, 3800);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-is-open', menuOpen);

    return () => {
      document.body.classList.remove('menu-is-open');
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && packOpened) {
        closePack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [packOpened]);

  useEffect(() => {
    return () => {
      clearPackTimers();
    };
  }, []);

  return (
    <div className="portfolio-page">
      <header className="site-header">
        <nav className="site-nav">
          <a href="#works" className="nav-logo" onClick={closeMenu}>
            ASAHI K.
          </a>

          <div className="nav-menu">
            <a href="#works">Works</a>
            <a href="#about">About</a>
            <a href="#skills">Skills</a>
            <a href="#contact">Contact</a>
          </div>

          <button
            type="button"
            className={`menu-toggle ${menuOpen ? 'is-open' : ''}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </nav>

        <div className={`mobile-menu ${menuOpen ? 'is-open' : ''}`}>
          <a href="#works" onClick={closeMenu}>Works</a>
          <a href="#about" onClick={closeMenu}>About</a>
          <a href="#skills" onClick={closeMenu}>Skills</a>
          <a href="#contact" onClick={closeMenu}>Contact</a>
        </div>
      </header>

      <main>
        <section
          id="works"
          className="hero-section"
          style={{ backgroundColor: activeCharacter.bg }}
        >
          <div className="hero-status">
            <span>
              {String(activeIndex + 1).padStart(2, '0')} /{' '}
              {String(CHARACTERS.length).padStart(2, '0')}
            </span>
            <span>{activeCharacter.role}</span>
          </div>

          <div className="ghost-text" aria-hidden="true">
            <span>THE</span>
            <span>{ghostWord}</span>
          </div>

          <div className="hero-carousel" aria-label="3D character carousel">
            {CHARACTERS.map((character, index) => (
              <article
                key={character.title}
                className={`character-slide ${getSlideState(index, activeIndex)}`}
              >
                <img
                  src={character.src}
                  alt={character.title}
                  className="character-image"
                  draggable="false"
                />
                <div className="character-shadow" />
              </article>
            ))}
          </div>

          <a href="#about" className="scroll-hint">
            <span>Scroll</span>
            <span className="scroll-line" />
          </a>

          <div className="hero-bottom-ui">
            <div className="hero-controls">
              <button type="button" onClick={goPrev} aria-label="Previous character">
                ‹
              </button>
              <button type="button" onClick={goNext} aria-label="Next character">
                ›
              </button>
            </div>
          </div>
        </section>

        <section id="about" className="about-section">
          <div className="about-grid">
            <div>
              <p className="section-eyebrow">Modern 3D Interactive Portfolio</p>
              <h2>
                Asahi
                <br />
                Kyouya.
              </h2>
            </div>

            <div className="about-copy">
              <p>
                I bridge the gap between visual aesthetics and functional code.
                My goal is to craft web experiences that are cinematic, clean,
                performant, and memorable.
              </p>

              <a href="#contact" className="primary-link">
                Contact Me <span>↗</span>
              </a>
            </div>
          </div>
        </section>

        <section
          id="skills"
          className={`skills-section ${packOpened ? 'is-pack-open' : ''}`}
          onClick={handleSkillsBackgroundClick}
        >
          <div className="section-head">
            <p className="section-eyebrow">Technical Arsenal</p>
            <h2>Skills that turn visuals into working experiences.</h2>
          </div>

          <div className="arsenal-stage arsenal-interactive-area">
            <div className="arsenal-pack-panel">
              <div className={`arsenal-pack-shell ${openingPack ? 'is-opening' : ''}`}>
                <button
                  type="button"
                  className={`arsenal-pack ${packOpened ? 'is-opened' : ''}`}
                  onClick={handleOpenPack}
                  disabled={packOpened}
                >
                  <span className="arsenal-pack-kicker">ASAHI KYOUYA</span>
                  <span className="arsenal-pack-title">TECHNICAL ARSENAL</span>
                  <span className="arsenal-pack-sub">BOOSTER PACK</span>
                  <span className="arsenal-pack-note">
                    {packOpened ? 'PACK OPENED' : 'CLICK TO OPEN'}
                  </span>
                </button>

                <div className="arsenal-pack-flash" />
              </div>

              <div className="arsenal-panel-info">
                <p>
                  Open the pack, then click any unrevealed card to trigger a rare reveal.
                  Click outside this area to close the pack.
                </p>

                <div className="arsenal-progress">
                  <span>{packOpened ? 'PICK A CARD' : 'REVEALED'}</span>
                  <strong>
                    {String(revealedCount).padStart(2, '0')} /{' '}
                    {String(SKILL_CARDS.length).padStart(2, '0')}
                  </strong>
                </div>
              </div>
            </div>

            <div className="arsenal-reveal-grid">
              {SKILL_CARDS.map((card, index) => {
                const isRevealed = revealedIndexes.includes(index);
                const isFlashing = flashingCardIndex === index && !isRevealed;

                return (
                  <div
                    key={card.id}
                    ref={(element) => {
                      cardRefs.current[index] = element;
                    }}
                    className={`reveal-slot ${isRevealed ? 'is-revealed' : 'is-hidden'} ${
                      isFlashing ? 'is-flashing' : ''
                    }`}
                  >
                    {isRevealed ? (
                      <TiltSkillCard card={card} />
                    ) : (
                      <button
                        type="button"
                        className="arsenal-card-back card-back-button"
                        onClick={() => handleRevealCard(index)}
                        aria-label={`Reveal ${card.skill}`}
                      >
                        <span className="arsenal-card-back-no">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="arsenal-card-back-text">UNREVEALED CARD</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="contact" className="contact-section">
          <p className="section-eyebrow">Let’s Build Something</p>
          <h2>Ready to create?</h2>
          <p>
            Available for creative direction, web experiences, interactive design,
            and portfolio-driven storytelling.
          </p>
        </section>
      </main>

      <footer className="site-footer">
        © 2026 Asahi Kyouya — Built with passion
      </footer>
    </div>
  );
}