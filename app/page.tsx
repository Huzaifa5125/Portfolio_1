import PortfolioMotion from './motion';
import ThemeToggle from './theme-toggle';

const github = 'https://github.com/Huzaifa5125';
const email = 'mailto:huzaifa887256@gmail.com';
const linkedIn = 'https://www.linkedin.com/in/huzaifa-ali-168561321/';

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <span aria-hidden="true" className="arrow">
      {diagonal ? '↗' : '↘'}
    </span>
  );
}

const moreProjects = [
  {
    number: '03',
    name: 'VibeML',
    type: 'Music recommendation',
    description:
      'Finding the next listen through K-means clustering on audio features.',
    stack: 'scikit-learn · FastAPI · Docker',
    repo: 'VibeMl-Music-Recommendation',
  },
  {
    number: '04',
    name: 'Code Generation Assistant',
    type: 'Model fine-tuning',
    description:
      'A Python coding assistant powered by a fine-tuned CodeLlama-7B model with 4-bit quantization.',
    stack: 'CodeLlama · Transformers · bitsandbytes',
    repo: 'code-generation',
  },
  {
    number: '05',
    name: 'Fetal Health Predictor',
    type: 'Healthcare machine learning',
    description:
      'Exploring fetal health classification from cardiotocography readings with a trained ML model.',
    stack: 'scikit-learn · Flask · Python',
    repo: 'CTG-Predictor-',
  },
];

export default function Home() {
  return (
    <>
      <PortfolioMotion />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header" id="top">
        <div className="header-inner wrap">
          <div className="brand-lockup">
            <a href="#top" className="monogram" aria-label="Huzaifa Ali, home">
              ha<span>✳</span>
            </a>
            <span className="header-location">Chandigarh, India</span>
          </div>
          <div className="header-actions">
            <nav aria-label="Main navigation">
              <a href="#work">
                Work <span>01</span>
              </a>
              <a href="#about">
                About <span>02</span>
              </a>
              <a href="#contact">
                Contact <Arrow diagonal />
              </a>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main id="main">
        <section className="hero wrap" aria-labelledby="name">
          <div className="hero-eyebrow" data-reveal>
            <span>AI / ML ENGINEER</span>
            <span>COMPUTER VISION & LANGUAGE MODELS</span>
          </div>
          <h1
            id="name"
            aria-label="Huzaifa Ali."
            data-reveal
            data-parallax="24"
          >
            <span className="name-word" aria-hidden="true">
              {'Huzaifa'.split('').map((letter, index) => (
                <span className="letter-mask" key={index}>
                  <span
                    className="name-letter"
                    style={{ animationDelay: `${100 + index * 35}ms` }}
                  >
                    {letter}
                  </span>
                </span>
              ))}
            </span>{' '}
            <span className="name-word" aria-hidden="true">
              {'Ali'.split('').map((letter, index) => (
                <span className="letter-mask" key={index}>
                  <span
                    className="name-letter"
                    style={{ animationDelay: `${345 + index * 35}ms` }}
                  >
                    {letter}
                  </span>
                </span>
              ))}
              <span className="letter-mask">
                <span
                  className="name-letter name-period"
                  style={{ animationDelay: '450ms' }}
                >
                  .
                </span>
              </span>
            </span>
          </h1>
          <div className="intro-grid" data-reveal>
            <div className="current">
              <span className="status-dot" /> Currently at CSIR–CSIO
              <br />
              <span className="current-sub">Project Associate · AI/ML</span>
            </div>
            <div className="intro-copy">
              <p>
                Building intelligence.
                <br />
                <em>From the ground up.</em>
              </p>
              <div className="intro-bottom">
                <p>
                  I work at the intersection of computer vision and language —
                  turning open-source models into systems that see, understand,
                  and respond.
                </p>
                <a
                  className="round-link"
                  href="#work"
                  aria-label="Explore selected work"
                >
                  <Arrow />
                </a>
              </div>
            </div>
          </div>
          <div className="section-divider" data-scroll-rule>
            <span>SELECTED WORK</span>
            <a className="scroll-cue" href="#work">
              SCROLL TO EXPLORE <span aria-hidden="true">↓</span>
            </a>
            <span>01 — 05</span>
          </div>
        </section>
        <section className="work wrap" id="work" aria-labelledby="work-heading">
          <div className="section-heading" data-reveal>
            <h2 id="work-heading" data-parallax="12">
              A few things I’ve built.
            </h2>
            <p>
              From first principles <br />
              to working applications.
            </p>
          </div>
          <div className="featured-grid">
            <article className="project" data-reveal="project">
              <a
                className="project-visual transformer"
                data-tilt
                href={`${github}/gpt-from-scratch`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View GPT-2 From Scratch on GitHub (opens in new tab)"
              >
                <div className="visual-top">
                  <span>01 / LANGUAGE MODEL</span>
                  <span className="visual-link">
                    <Arrow diagonal />
                  </span>
                </div>
                <div className="model-title">
                  GPT–2<span>Built from scratch.</span>
                </div>
                <div
                  className="model-flow"
                  aria-label="Decoder-only transformer: token embeddings, 12 transformer blocks, output probabilities"
                >
                  <span>Tokens</span>
                  <i>→</i>
                  <span>Embeddings</span>
                  <i>→</i>
                  <span className="flow-block">
                    Transformer<small>× 12 blocks</small>
                  </span>
                  <i>→</i>
                  <span>Output</span>
                </div>
                <div className="visual-stats">
                  <div>
                    <strong>124M</strong>
                    <span>PARAMETERS</span>
                  </div>
                  <div>
                    <strong>19.66</strong>
                    <span>TEST PERPLEXITY</span>
                  </div>
                  <div>
                    <strong>4× V100</strong>
                    <span>DISTRIBUTED TRAINING</span>
                  </div>
                </div>
              </a>
              <div className="project-details">
                <div className="project-caption">
                  <h3>
                    <a
                      href={`${github}/gpt-from-scratch`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GPT-2 from scratch <Arrow diagonal />
                    </a>
                  </h3>
                </div>
                <p className="project-description">
                  A complete decoder-only Transformer, from custom tokenization
                  and causal self-attention to distributed training across four
                  GPUs.
                </p>
                <ul className="project-tags" aria-label="GPT-2 technologies">
                  <li>PyTorch</li>
                  <li>DDP</li>
                  <li>WikiText-103</li>
                </ul>
              </div>
            </article>
            <article className="project" data-reveal="project" data-delay="90">
              <a
                className="project-visual campus"
                data-tilt
                href={`${github}/CCET-Campus-Assitance`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View College RAG Assistant on GitHub (opens in new tab)"
              >
                <div className="visual-top">
                  <span>02 / RETRIEVAL & CONTEXT</span>
                  <span className="visual-link">
                    <Arrow diagonal />
                  </span>
                </div>
                <div className="campus-title">
                  Campus
                  <br />
                  <span>context.</span>
                </div>
                <div className="rag-flow">
                  <div>
                    <span>01</span> College knowledge
                  </div>
                  <div>
                    <span>02</span> FAISS retrieval
                  </div>
                  <div>
                    <span>03</span> Grounded answers <Arrow diagonal />
                  </div>
                </div>
                <div className="visual-footer">
                  <span>CCET CAMPUS ASSISTANT</span>
                  <span>CONTEXT → CLARITY</span>
                </div>
              </a>
              <div className="project-details">
                <div className="project-caption">
                  <h3>
                    <a
                      href={`${github}/CCET-Campus-Assitance`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      College RAG assistant <Arrow diagonal />
                    </a>
                  </h3>
                </div>
                <p className="project-description">
                  Helping students navigate college information with grounded
                  answers, contextual retrieval, and memory across
                  conversations.
                </p>
                <ul
                  className="project-tags"
                  aria-label="RAG assistant technologies"
                >
                  <li>LangChain</li>
                  <li>FAISS</li>
                  <li>Gemini</li>
                </ul>
              </div>
            </article>
          </div>
          <div className="project-list">
            {moreProjects.map((project, index) => (
              <article
                key={project.number}
                className="project-row"
                data-reveal
                data-delay={index * 45}
              >
                <span className="project-index">{project.number}</span>
                <div className="row-heading">
                  <span className="project-type">{project.type}</span>
                  <h3>
                    <a
                      href={`${github}/${project.repo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {project.name}
                      <span className="row-arrow">
                        <Arrow diagonal />
                      </span>
                    </a>
                  </h3>
                </div>
                <div className="row-details">
                  <p>{project.description}</p>
                  <span className="project-stack">{project.stack}</span>
                </div>
              </article>
            ))}
          </div>
          <a
            className="text-link github-link"
            href={github}
            target="_blank"
            rel="noopener noreferrer"
          >
            More on GitHub <Arrow diagonal />
          </a>
        </section>
        <section className="about" id="about" aria-labelledby="about-heading">
          <div className="wrap">
            <div className="section-divider" data-scroll-rule>
              <span>ABOUT & EXPERIENCE</span>
              <span>02</span>
            </div>
            <div className="about-grid">
              <div data-reveal>
                <span className="eyebrow">THE PERSON BEHIND THE MODELS</span>
                <h2 id="about-heading" data-parallax="16">
                  Curious by nature.
                  <br />
                  Engineer by practice.
                </h2>
              </div>
              <div className="about-copy" data-reveal data-delay="80">
                <p>
                  I’m Huzaifa, an AI/ML engineer based in Chandigarh, India. I’m
                  interested in how models work, and what it takes to make them
                  work well in the real world.
                </p>
                <p>
                  At CSIR-CSIO, I build computer vision and vision-language
                  pipelines, fine-tune open-source models, and deploy them for
                  high-throughput inference.
                </p>
              </div>
            </div>
            <div className="experience-grid">
              <h3>Experience & education</h3>
              <div>
                <article className="experience-row" data-reveal>
                  <span className="date">NOV 2025 — PRESENT</span>
                  <h4>Project Associate — AI/ML</h4>
                  <span>CSIR-CSIO · Chandigarh</span>
                  <p>
                    Combining YOLO object detection with vision-language models
                    for real-time video analysis. Optimizing model inference
                    with vLLM and fine-tuning for domain-specific tasks.
                  </p>
                </article>
                <article className="experience-row" data-reveal>
                  <span className="date">CLASS OF 2025</span>
                  <h4>B.Tech, Computer Science</h4>
                  <span>Chandigarh College of Engineering and Technology</span>
                </article>
              </div>
            </div>
            <div className="toolkit">
              <h3>My toolkit</h3>
              <div>
                <div data-reveal>
                  <h4>Models & learning</h4>
                  <p>
                    Python / PyTorch / scikit-learn / YOLO / Vision-Language
                    Models / Transformers / DDP
                  </p>
                </div>
                <div data-reveal data-delay="60">
                  <h4>Language & retrieval</h4>
                  <p>
                    Hugging Face / LangChain / FAISS / RAG / Fine-tuning /
                    Quantization
                  </p>
                </div>
                <div data-reveal data-delay="120">
                  <h4>Building & shipping</h4>
                  <p>
                    vLLM / FastAPI / Flask / Docker / React / Next.js /
                    TypeScript / Git / Linux
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className="contact wrap"
          id="contact"
          aria-labelledby="contact-heading"
        >
          <div className="section-divider" data-scroll-rule>
            <span>LET’S CONNECT</span>
            <span>03</span>
          </div>
          <div className="contact-intro" data-reveal>
            <p>
              Have an interesting problem in mind?
              <br />
              I’d love to hear about it.
            </p>
            <span>BASED IN CHANDIGARH, INDIA</span>
          </div>
          <h2 id="contact-heading" data-reveal data-parallax="18">
            <a href={email}>
              Let’s talk.
              <Arrow diagonal />
            </a>
          </h2>
          <div className="contact-links" data-reveal>
            <a className="text-link" href={email}>
              huzaifa887256@gmail.com <Arrow diagonal />
            </a>
            <div>
              <a
                className="text-link"
                href={linkedIn}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn <Arrow diagonal />
              </a>
              <a
                className="text-link"
                href={github}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub <Arrow diagonal />
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer className="wrap">
        <span>© {new Date().getFullYear()} Huzaifa Ali</span>
        <span>Built with curiosity. Kept simple.</span>
        <a href="#top">Back to top ↑</a>
      </footer>
    </>
  );
}
