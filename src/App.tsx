import { useState, useEffect, useRef } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalContent,
  ModalBody,
} from '@heroui/react';

import DesktopGate from './components/DesktopGate';
import Typewriter from './components/Typewriter';
import DodgeButton from './components/DodgeButton';
import HUD from './components/HUD';
import ToastStack from './components/ToastStack';
import TerminalOverlay from './components/TerminalOverlay';
import HeartConfetti from './components/HeartConfetti';

// EDIT HERE: Questions array
const QUESTIONS = [
  'Trial 1: Will you take me on a date when I land and plan the details so I only need to show up and look pretty?',
  'Trial 2: Do you consent to a day of elite-level affection?',
  'Trial 3: Will you let me brag that I have the cutest man alive?',
  'Trial 4: Will you acknowledge that my overthinking is actually advanced analytics?',
  'Final Boss: Will you authorize one additional tiny floof unit for infinite wife joy?',
];

const LANDING_NO_HINT = 'That button has commitment issues. Try again.';

const TRIAL_NO_HINTS = [
  'That choice keeps running from accountability.',
  'NO is buffering courage...',
  'Nice try. The universe rejected that input.',
  'NO saw the future and panicked.',
];

type GameState = 'landing' | 'intro' | 'trial' | 'victory';
type TrialState = 'idle' | 'showing' | 'completed';

interface Toast {
  id: string;
  message: string;
}

interface Achievement {
  id: string;
  name: string;
  unlocked: boolean;
}

export default function App() {
  const [isDesktop, setIsDesktop] = useState(true);
  const [gameState, setGameState] = useState<GameState>('landing');
  const [trialState, setTrialState] = useState<TrialState>('idle');
  const [showCardUnderTerminal, setShowCardUnderTerminal] = useState(true);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [loveMeter, setLoveMeter] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dodgeAttempts, setDodgeAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [trialStartTime, setTrialStartTime] = useState<number | null>(null);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalMessages, setTerminalMessages] = useState<string[]>([]);
  const [showFinalModal, setShowFinalModal] = useState(false);

  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 'green-flag', name: 'Green Flag Detected', unlocked: false },
    { id: 'no-button', name: '"No" Button Survivor', unlocked: false },
    { id: 'speedrunner', name: 'Speedrunner', unlocked: false },
    { id: 'completion', name: '100% Completion', unlocked: false },
  ]);

  const [konamiCode, setKonamiCode] = useState<string[]>([]);
  const [unlockedSecret, setUnlockedSecret] = useState(false);
  const [rewardIndex, setRewardIndex] = useState(0);

  const yesButtonRef = useRef<HTMLButtonElement>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);

  // Landing refs
  const titleRef = useRef<HTMLDivElement>(null);

  // Shared hint slot ref (used in landing and trials)
  const hintRef = useRef<HTMLDivElement>(null);

  // Trial question ref (so NO never jumps over question text)
  const questionRef = useRef<HTMLDivElement>(null);

  // Dark mode only
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Desktop check
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 900);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Konami code handler
  useEffect(() => {
    const konamiSequence = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ];

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const expectedKey = konamiSequence[konamiCode.length];

      const normalizedKey = key.startsWith('Arrow') ? key : key.toLowerCase();
      const normalizedExpected = expectedKey.startsWith('Arrow')
        ? expectedKey
        : expectedKey.toLowerCase();

      if (normalizedKey === normalizedExpected) {
        const newCode = [...konamiCode, normalizedKey];
        setKonamiCode(newCode);

        if (newCode.length === konamiSequence.length) {
          setUnlockedSecret(true);
          addToast('Secret ending unlocked');
          setKonamiCode([]);
        }
      } else {
        setKonamiCode([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiCode]);

  // Enter key handler for intro screen
  useEffect(() => {
    if (gameState !== 'intro') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') handleIntroComplete();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  const addToast = (message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 1800);
  };

  const handleLandingYes = () => {
    showTerminalTransition(
      ['ValentineOS booting…', 'Authenticating user…', 'Access granted.'],
      () => setGameState('intro')
    );
  };

  const handleDodgeAttempt = () => {
    const newAttempts = dodgeAttempts + 1;
    setDodgeAttempts(newAttempts);
    if (newAttempts >= 2) setShowHint(true);
  };

  const handleIntroComplete = () => {
    showTerminalTransition(['Loading next trial…'], () => {
      setGameState('trial');
      setCurrentTrial(0);
      startTrial();
    });
  };

  const getCurrentNoHint = () => {
    if (gameState === 'landing') return LANDING_NO_HINT;
    if (gameState === 'trial') return TRIAL_NO_HINTS[currentTrial] ?? 'Choice unavailable. Try again.';
    return 'Choice unavailable. Try again.';
  };  

  const startTrial = () => {
    setTrialStartTime(Date.now());
    setTrialState('showing');
    setDodgeAttempts(0);
    setShowHint(false);
  };

  const handleTrialYes = () => {
    if (trialStartTime) {
      const responseTime = (Date.now() - trialStartTime) / 1000;
      setResponseTimes((prev) => [...prev, responseTime]);

      if (responseTime < 2.5) addToast('Speedrun bonus +50');
      else addToast('Verified');
    }

    addToast('Achievement unlocked: Green Flag Verified');

    const newLoveMeter = Math.min(100, loveMeter + 20);
    setLoveMeter(newLoveMeter);

    setTrialState('completed');

    if (currentTrial < QUESTIONS.length - 1) {
      setTimeout(() => {
        showTerminalTransition(['Updating Love Meter…', 'Loading next trial…'], () => {
          setCurrentTrial((prev) => prev + 1);
          startTrial();
        });
      }, 500);
    } else {
      setAchievements((prev) =>
        prev.map((a) =>
          a.id === 'green-flag' || a.id === 'no-button' || a.id === 'completion'
            ? { ...a, unlocked: true }
            : a
        )
      );

      const speedrunCount = responseTimes.filter((t) => t < 2.5).length;
      if (speedrunCount >= 3) {
        setAchievements((prev) =>
          prev.map((a) => (a.id === 'speedrunner' ? { ...a, unlocked: true } : a))
        );
      }

      setTimeout(() => {
        showTerminalTransition(['Final trial complete…', 'Unlocking victory screen…'], () => {
          setGameState('victory');
        });
      }, 500);
    }
  };

  const handleTrialNo = () => {
    if (currentTrial === QUESTIONS.length - 1) setShowFinalModal(true);
  };

  const handleAcceptFate = () => {
    setShowFinalModal(false);
    handleTrialYes();
  };

  const terminalCallbackRef = useRef<(() => void) | null>(null);

  const showTerminalTransition = (messages: string[], onComplete: () => void) => {
    setShowCardUnderTerminal(false); // hide card immediately
    setTerminalMessages(messages);
    terminalCallbackRef.current = onComplete;
    setShowTerminal(true);
  };

  const handleTerminalComplete = () => {
    setShowTerminal(false);
    if (terminalCallbackRef.current) {
      terminalCallbackRef.current();
      terminalCallbackRef.current = null;
    }
    setShowCardUnderTerminal(true); // show card for the next screen
  };

  // Bounds helpers
  const getBounds = (el: HTMLElement | null) => {
    if (!el) return undefined;
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height };
  };

  const getYesButtonBounds = () => getBounds(yesButtonRef.current);
  const getTitleBounds = () => getBounds(titleRef.current);
  const getHintBounds = () => getBounds(hintRef.current);
  const getQuestionBounds = () => getBounds(questionRef.current);

  const getForbiddenAreas = () => {
    const areas = [getYesButtonBounds()];

    if (gameState === 'landing') {
      areas.push(getTitleBounds(), getHintBounds());
    }

    if (gameState === 'trial') {
      areas.push(getQuestionBounds(), getHintBounds());
    }

    return areas.filter(Boolean) as { x: number; y: number; width: number; height: number }[];
  };

  const rewards = [
    'Reward: One kiss voucher',
    'Reward: Dinner DLC',
    'Reward: Cuddle expansion pack',
    ...(unlockedSecret ? ['Reward: Unlimited hugs license'] : []),
  ];

  if (!isDesktop) return <DesktopGate />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900/20">
      {/* HUD */}
      {gameState === 'trial' && (
        <HUD trialNumber={currentTrial + 1} totalTrials={QUESTIONS.length} loveMeter={loveMeter} />
      )}

      {/* Terminal Overlay */}
      <TerminalOverlay
        messages={terminalMessages}
        duration={600}
        show={showTerminal}
        onComplete={handleTerminalComplete}
      />

      {/* Toast Stack */}
      <ToastStack
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      {/* Landing Screen */}
      {gameState === 'landing' && showCardUnderTerminal && (
        <div className="flex items-center justify-center min-h-screen p-8">
          <Card className="glass-card cyber-glow max-w-lg w-full">
            <CardHeader className="flex flex-col gap-2 pt-12 pb-6 px-12">
              <div ref={titleRef}>
                <h1 className="text-3xl font-bold text-center cyber-glow-text text-primary-500">
                  Do you want to be my Valentine?
                </h1>
              </div>
            </CardHeader>

            <CardBody className="flex flex-col gap-8 items-center pb-12 px-12 pt-2">
              <div className="relative flex justify-center items-center gap-10 h-[64px]">
                <Button
                  ref={yesButtonRef}
                  color="primary"
                  size="lg"
                  onClick={handleLandingYes}
                  className="min-w-[120px]"
                >
                  YES
                </Button>

                <DodgeButton
                  ref={noButtonRef}
                  color="secondary"
                  size="lg"
                  mode="dodge"
                  onDodgeAttempt={handleDodgeAttempt}
                  forbiddenAreas={getForbiddenAreas()}
                  className="min-w-[120px]"
                >
                  NO
                </DodgeButton>
              </div>

              {/* Fixed slot so card never changes height */}
              <div ref={hintRef} className="h-[24px]">
                {showHint && (
                  <Typewriter
                  text={getCurrentNoHint()}
                    speed={30}
                    className="text-sm text-gray-400 text-center"
                  />
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Intro Screen */}
      {gameState === 'intro' && showCardUnderTerminal && (
        <div className="flex items-center justify-center min-h-screen p-8">
          <Card className="glass-card cyber-glow max-w-2xl w-full">
            <CardBody className="py-10 px-10">
              <div className="space-y-4 text-white font-mono">
                <Typewriter
                  text={[
                    'Welcome to ValentineOS.',
                    'To unlock the final message, complete 5 trials.',
                    'Press Enter to proceed.',
                  ]}
                  speed={40}
                  onComplete={() => { }}
                />
              </div>

              <div className="mt-6 flex justify-center">
                <Button color="primary" onClick={handleIntroComplete}>
                  Press Enter
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Trial Screen */}
      {gameState === 'trial' && trialState === 'showing' && showCardUnderTerminal && (
        <div className="flex items-center justify-center min-h-screen p-8">
          <Card className="glass-card cyber-glow w-full">
            <CardHeader className="flex flex-col gap-2 pt-12 pb-6 px-12">
              <div ref={questionRef}>
                <Typewriter
                  text={QUESTIONS[currentTrial]}
                  speed={20}
                  instant={false}
                  className="text-2xl font-bold text-center text-white"
                />
              </div>
            </CardHeader>

            <CardBody className="flex flex-col gap-8 items-center pb-12 px-12 pt-2">
              <div className="relative flex justify-center items-center gap-10 h-[64px]">
                <Button
                  ref={yesButtonRef}
                  color="primary"
                  size="lg"
                  onClick={handleTrialYes}
                  className="min-w-[120px]"
                >
                  YES
                </Button>

                {currentTrial === QUESTIONS.length - 1 ? (
                  <Button
                    ref={noButtonRef}
                    color="secondary"
                    size="lg"
                    onClick={handleTrialNo}
                    className="min-w-[120px]"
                  >
                    NO
                  </Button>
                ) : (
                  <DodgeButton
                    ref={noButtonRef}
                    color="secondary"
                    size="lg"
                    mode="dodge"
                    onDodgeAttempt={handleDodgeAttempt}
                    forbiddenAreas={getForbiddenAreas()}
                    className="min-w-[120px]"
                  >
                    NO
                  </DodgeButton>
                )}
              </div>

              {/* Fixed slot so card never changes height */}
              <div ref={hintRef} className="h-[24px]">
                {showHint && currentTrial < QUESTIONS.length - 1 && (
                  <Typewriter
                  text={getCurrentNoHint()}
                    speed={30}
                    className="text-sm text-gray-400 text-center"
                  />
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Final Boss Modal */}
      <Modal
        isOpen={showFinalModal}
        onClose={() => setShowFinalModal(false)}
        backdrop="blur"
        placement="center"
        size="md"
        hideCloseButton
        classNames={{
          wrapper: 'items-center justify-center',
          backdrop: 'bg-black/70',
          base: 'modal-panel pointer-events-auto rounded-xl',
        }}
      >
        <ModalContent>
          <ModalBody className="p-8">
            <div className="text-center space-y-4">
              <div className="text-white font-mono text-xl">Nice try!</div>

              <Typewriter
                text="The universe reviewed your input and approved YES anyway 😬"
                speed={30}
                className="text-gray-200 font-mono"
                instant={false}
              />

              <div className="pt-2 space-y-2">
                <Button color="primary" 
                size="lg"
                className="min-w-[200px] font-semibold text-base shadow-lg shadow-primary-500/30 cyber-glow"
                 onClick={handleAcceptFate}>
                  Accept fate (YES)
                </Button>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Heart Confetti */}
      <HeartConfetti show={gameState === 'victory'} />

      {/* Victory Screen */}
      {gameState === 'victory' && showCardUnderTerminal && (
        <div className="flex items-center justify-center min-h-screen p-8">
          <Card className="glass-card cyber-glow max-w-3xl w-full">
            <CardHeader className="flex flex-col gap-2 pt-10 pb-6 px-8">
              <h1 className="text-4xl font-bold text-center cyber-glow-text text-primary-500">
                Yay, you made it!
              </h1>
            </CardHeader>

            <CardBody className="space-y-6 pb-10 px-8">
              {/* Reward Card */}
              <div className="text-center">
                <div className="glass-card p-6 rounded-lg mb-4">
                  <h2 className="text-xl font-bold text-white mb-2">
                    {rewards[rewardIndex]}
                  </h2>
                </div>
                <Button
                  color="primary"
                  size="lg"
                  onClick={() => setRewardIndex((p) => (p + 1) % rewards.length)}
                  className="min-w-[200px] font-semibold text-base shadow-lg shadow-primary-500/30 cyber-glow"
                >
                  Claim reward
                </Button>
              </div>

              {/* Achievements + Victory image */}
              <div className="flex flex-wrap items-start gap-8">
                <div className="space-y-2 flex-1 min-w-[200px]">
                  <h3 className="text-lg font-bold text-white">Achievements</h3>
                  <div className="space-y-1">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`flex items-center gap-2 text-sm ${achievement.unlocked ? 'text-green-400' : 'text-gray-500'
                          }`}
                      >
                        <span>{achievement.unlocked ? '✓' : '○'}</span>
                        <span>{achievement.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <img
                    src={`${import.meta.env.BASE_URL}victory-hug.png`}
                    alt=""
                    className="w-40 h-auto object-contain"
                  />
                </div>
              </div>

              {/* Leaderboard */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Leaderboard</h3>
                <div className="glass-card p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white">Husband</span>
                    <span className="text-primary-400 font-mono">9999</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Everyone else</span>
                    <span className="text-gray-500 font-mono">-3</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
