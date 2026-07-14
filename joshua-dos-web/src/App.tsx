import { useEffect, useRef, useState } from "react";

const JSDOS_CSS_URL = "https://v8.js-dos.com/latest/js-dos.css";
const JSDOS_SCRIPT_URL = "https://v8.js-dos.com/latest/js-dos.js";

function publicUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}

let jsDosScriptPromise: Promise<void> | null = null;

function loadStylesheet(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function loadScript(src: string) {
  if (jsDosScriptPromise) {
    return jsDosScriptPromise;
  }

  const existingScript = document.querySelector<HTMLScriptElement>(
    `script[src="${src}"]`
  );

  if (existingScript && window.Dos) {
    jsDosScriptPromise = Promise.resolve();
    return jsDosScriptPromise;
  }

  jsDosScriptPromise = new Promise<void>((resolve, reject) => {
    const script = existingScript ?? document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Unable to load ${src}`));

    if (!existingScript) {
      document.body.appendChild(script);
    }
  });

  return jsDosScriptPromise;
}

async function assertGameBundleExists() {
  const response = await fetch(publicUrl("/games/joshua.jsdos"), {
    method: "HEAD",
  });

  if (!response.ok) {
    throw new Error("Missing game bundle. Run npm run bundle:game.");
  }
}

export default function App() {
  const dosContainerRef = useRef<HTMLDivElement | null>(null);
  const dosControllerRef = useRef<DosController | null>(null);
  const hasStartedRef = useRef(false);
  const [status, setStatus] = useState("Preparing DOS player...");
  const [error, setError] = useState<string | null>(null);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function bootPlayer() {
      if (isGuideOpen) {
        return;
      }

      try {
        await assertGameBundleExists();
        loadStylesheet(JSDOS_CSS_URL);
        await loadScript(JSDOS_SCRIPT_URL);

        if (!isMounted || !dosContainerRef.current || hasStartedRef.current) {
          return;
        }

        if (!window.Dos) {
          throw new Error("The DOS emulator did not initialize.");
        }

        hasStartedRef.current = true;
        setStatus("Loading Joshua...");
        dosControllerRef.current = window.Dos(dosContainerRef.current, {
          url: publicUrl("/games/joshua.jsdos"),
          autoStart: true,
        });
        setStatus("Progress is controlled inside the original DOS game.");
      } catch (nextError) {
        if (!isMounted) {
          return;
        }

        setError(
          nextError instanceof Error
            ? nextError.message
            : "The DOS player could not start."
        );
      }
    }

    bootPlayer();

    return () => {
      isMounted = false;
    };
  }, [isGuideOpen]);

  async function handleRestart() {
    if (isRestarting) {
      return;
    }

    try {
      setIsRestarting(true);
      setStatus("Restarting game...");
      await dosControllerRef.current?.stop();
    } finally {
      window.location.reload();
    }
  }

  function handleFullscreen() {
    dosControllerRef.current?.setFullScreen(true);
  }

  if (isGuideOpen) {
    return (
      <main className="guideShell">
        <section className="guideHero" aria-labelledby="guide-title">
          <div className="guideHeroContent">
            <p className="eyebrow">Secret Archive</p>
            <h1 id="guide-title">Joshua</h1>
            <p className="heroLead">
              Lead Joshua through the Battle of Jericho by gathering the needed
              items, clearing hazards, and preparing for the Bible quiz activity
              that will be added after we extract the game data.
            </p>
            <div className="heroActions">
              <button
                className="controlButton primary"
                type="button"
                onClick={() => setIsGuideOpen(false)}
              >
                Continue to game
              </button>
              <a className="controlButton calendarButton" href="/">
                Back to calendar
              </a>
            </div>
          </div>

          <div className="quickGuide" aria-label="Before you play">
            <div>
              <span className="guideLabel">Route</span>
              <strong>enochscalendar.com/jericho</strong>
            </div>
            <div>
              <span className="guideLabel">Button 1</span>
              <strong>Space bar blows Joshua&apos;s trumpet.</strong>
            </div>
            <div>
              <span className="guideLabel">Move</span>
              <strong>Use the arrow keys to move Joshua.</strong>
            </div>
            <div>
              <span className="guideLabel">Next pass</span>
              <strong>Extract artifacts, objects, and quiz data.</strong>
            </div>
          </div>
        </section>

        <section className="aboutGame" aria-labelledby="about-title">
          <div className="aboutCopy">
            <p className="eyebrow">About the Game</p>
            <h2 id="about-title">Joshua and the Battle of Jericho</h2>
            <p>
              Joshua and the Battle of Jericho is a Wisdom Tree DOS game. This
              wrapper follows the same pattern as the Exodus page: the player
              gets a short guide first, then launches the original DOS game in
              the browser.
            </p>
            <p>
              Once the game wrapper is confirmed, we can extract Joshua&apos;s
              visual assets and quiz strings and add the same richer guide and
              standalone quiz activity.
            </p>
          </div>
        </section>

        <section className="controlsBand" aria-label="Controls">
          <div className="keyCard">
            <span className="keycap">Space</span>
            <div>
              <h2>Button 1: Trumpet</h2>
              <p>Blow Joshua&apos;s trumpet during play.</p>
            </div>
          </div>
          <div className="keyCard">
            <span className="keycap">Arrows</span>
            <div>
              <h2>Move Joshua</h2>
              <p>Navigate the level and avoid hazards.</p>
            </div>
          </div>
          <div className="keyCard">
            <span className="keycap">Esc</span>
            <div>
              <h2>Game menu</h2>
              <p>Use the original DOS game controls for menus and exits.</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <section className="playerPanel" aria-label="Joshua DOS player">
        <div className="playerHeader">
          <div>
            <p className="eyebrow">Secret Archive</p>
            <h1>Joshua</h1>
          </div>
          <span className="routeBadge">/jericho</span>
        </div>

        {error ? (
          <div className="messageBox" role="alert">
            <strong>Player unavailable</strong>
            <p>{error}</p>
            {error.includes("bundle") ? (
              <p>
                Run <code>npm run bundle:game</code> before building or serving
                this project.
              </p>
            ) : null}
          </div>
        ) : (
          <>
            <div ref={dosContainerRef} className="dosViewport" />
            <div className="controlBar" aria-label="Game controls">
              <button
                className="controlButton primary"
                type="button"
                onClick={handleRestart}
                disabled={!dosControllerRef.current || isRestarting}
              >
                {isRestarting ? "Restarting..." : "Restart"}
              </button>
              <button
                className="controlButton"
                type="button"
                onClick={handleFullscreen}
                disabled={!dosControllerRef.current}
              >
                Fullscreen
              </button>
            </div>
            <p className="statusText" role="status">
              {status}
            </p>
          </>
        )}
      </section>
    </main>
  );
}
