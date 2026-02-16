import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { useMagneticHover } from '../../hooks/useMagneticHover';
import { StravaCard } from '../Strava';
import { Piano } from '../Piano';
import { useEffects } from '../../contexts/EffectsContext';
import { 
  WHITE_KEY_NOTES, 
  BLACK_KEY_NOTES, 
  noteToFrequency,
  type PianoKeyRange 
} from '../../utils/pianoKeyboard';
import styles from './Hobbies.module.css';

interface Language {
  name: string;
  level: number;
  flag: string;
}

const languages: Language[] = [
  { name: 'German', level: 75, flag: '🇩🇪' },
  { name: 'Japanese', level: 40, flag: '🇯🇵' },
  { name: 'Spanish', level: 25, flag: '🇪🇸' },
];

const MINI_PIANO_RANGE: PianoKeyRange = {
  startOctave: 4,
  whiteKeyCount: 8,
};

interface HobbyCardProps {
  title: string;
  icon: React.ReactNode;
  index: number;
  isVisible: boolean;
  children: React.ReactNode;
  className?: string;
}

const HobbyCard = memo(function HobbyCard({ 
  title, 
  icon, 
  index, 
  isVisible, 
  children,
  className 
}: HobbyCardProps) {
  const { ref, style, handlers } = useMagneticHover({ strength: 0.2 });

  return (
    <div
      ref={ref}
      className={`${styles.card} ${isVisible ? styles.visible : ''} ${className || ''}`}
      style={{
        ...style,
        transitionDelay: `${index * 100}ms`,
      }}
      {...handlers}
      role="article"
      aria-label={`${title} hobby`}
    >
      <div className={styles.cardHeader}>
        <div className={styles.iconWrapper}>
          <div className={styles.icon}>{icon}</div>
        </div>
        <h3 className={styles.cardTitle}>{title}</h3>
      </div>
      <div className={styles.cardContent}>
        {children}
      </div>
      <div className={styles.cardGlow} />
    </div>
  );
});

interface MiniPianoKeyProps {
  note: string;
  isSharp: boolean;
  isActive: boolean;
  onNoteStart: (note: string) => void;
  onNoteEnd: (note: string) => void;
}

const MiniPianoKey = memo(function MiniPianoKey({
  note,
  isSharp,
  isActive,
  onNoteStart,
  onNoteEnd,
}: MiniPianoKeyProps) {
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    onNoteStart(note);
  }, [note, onNoteStart]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    onNoteEnd(note);
  }, [note, onNoteEnd]);

  const handlePointerLeave = useCallback((e: React.PointerEvent) => {
    if (e.buttons > 0) {
      onNoteEnd(note);
    }
  }, [note, onNoteEnd]);

  return (
    <button
      type="button"
      className={`${isSharp ? styles.miniBlackKey : styles.miniWhiteKey} ${isActive ? styles.active : ''}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerUp}
      aria-label={`Play note ${note}`}
    />
  );
});

interface MiniPianoProps {
  className?: string;
}

const MiniPiano = memo(function MiniPiano({ className }: MiniPianoProps) {
  const effects = useEffects();
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const activeNotesRef = useRef<Set<string>>(activeNotes);

  useEffect(() => {
    activeNotesRef.current = activeNotes;
  }, [activeNotes]);

  const handleNoteStart = useCallback((note: string) => {
    setActiveNotes((prev) => {
      const next = new Set(prev);
      next.add(note);
      return next;
    });
    
    const frequency = noteToFrequency(note);
    
    if (!effects.isMuted) {
      effects.pianoEngineRef.current?.play(note, 0.7);
    }
    
    effects.wavePluck(frequency / 1000);
  }, [effects]);

  const handleNoteEnd = useCallback((note: string) => {
    setActiveNotes((prev) => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
    
    if (!effects.isMuted) {
      effects.pianoEngineRef.current?.stop(note);
    }
  }, [effects]);

  const { whiteKeys, blackKeyMap } = generateMiniKeyLayout(MINI_PIANO_RANGE);

  return (
    <div className={`${styles.miniPiano} ${className || ''}`} role="application" aria-label="Mini piano keyboard">
      <div className={styles.miniKeyboard}>
        {whiteKeys.map((keyInfo) => {
          const blackKey = blackKeyMap.get(keyInfo.note);
          
          return (
            <div key={keyInfo.note} className={styles.miniWhiteKeyWrapper}>
              <MiniPianoKey
                note={keyInfo.note}
                isSharp={false}
                isActive={activeNotes.has(keyInfo.note)}
                onNoteStart={handleNoteStart}
                onNoteEnd={handleNoteEnd}
              />
              {blackKey && (
                <MiniPianoKey
                  note={blackKey.note}
                  isSharp={true}
                  isActive={activeNotes.has(blackKey.note)}
                  onNoteStart={handleNoteStart}
                  onNoteEnd={handleNoteEnd}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

interface KeyInfo {
  note: string;
  isSharp: boolean;
}

function generateMiniKeyLayout(range: PianoKeyRange): { whiteKeys: KeyInfo[]; blackKeyMap: Map<string, KeyInfo> } {
  const whiteKeys: KeyInfo[] = [];
  const blackKeyMap = new Map<string, KeyInfo>();
  
  const { startOctave, whiteKeyCount } = range;
  let keyIndex = 0;
  
  for (let octaveOffset = 0; octaveOffset < Math.ceil(whiteKeyCount / 7); octaveOffset++) {
    const currentOctave = startOctave + octaveOffset;
    
    for (let noteIndex = 0; noteIndex < 7 && keyIndex < whiteKeyCount; noteIndex++) {
      const whiteNote = WHITE_KEY_NOTES[noteIndex];
      
      if (whiteNote) {
        whiteKeys.push({
          note: `${whiteNote}${currentOctave}`,
          isSharp: false,
        });
      }
      
      const blackNote = BLACK_KEY_NOTES[noteIndex];
      
      if (blackNote) {
        const blackKeyInfo: KeyInfo = {
          note: `${blackNote}${currentOctave}`,
          isSharp: true,
        };
        blackKeyMap.set(`${whiteNote}${currentOctave}`, blackKeyInfo);
      }
      
      keyIndex++;
    }
  }
  
  return { whiteKeys, blackKeyMap };
}

function LanguageProgress({ languages: langs, isVisible }: { languages: Language[]; isVisible: boolean }) {
  return (
    <div className={styles.languageList}>
      {langs.map((lang, index) => (
        <div key={lang.name} className={styles.languageItem}>
          <div className={styles.languageHeader}>
            <span className={styles.languageFlag}>{lang.flag}</span>
            <span className={styles.languageName}>{lang.name}</span>
            <span className={styles.languageLevel}>{lang.level}%</span>
          </div>
          <div className={styles.languageBar}>
            <div
              className={styles.languageProgress}
              style={{
                width: isVisible ? `${lang.level}%` : '0%',
                transitionDelay: `${index * 100}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export const Hobbies = memo(function Hobbies() {
  const [containerRef, isVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section id="hobbies" className={styles.section}>
      <div
        ref={containerRef}
        className={`${styles.container} ${isVisible ? styles.visible : ''}`}
      >
        <h2 className={styles.title}>
          <span className={styles.titleAccent}>//</span> Hobbies
        </h2>

        <div className={styles.grid}>
          <HobbyCard
            title="Running"
            icon={
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066l-2.084 4.116zM7.731 8.712l2.928 5.772h4.574L7.731 0 0 14.484h4.574l3.157-5.772z" />
              </svg>
            }
            index={0}
            isVisible={isVisible}
          >
            <StravaCard className={styles.stravaCard} />
          </HobbyCard>

          <HobbyCard
            title="Piano"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <line x1="6" y1="4" x2="6" y2="14" />
                <line x1="10" y1="4" x2="10" y2="14" />
                <line x1="14" y1="4" x2="14" y2="14" />
                <line x1="18" y1="4" x2="18" y2="14" />
              </svg>
            }
            index={1}
            isVisible={isVisible}
          >
            <div className={styles.pianoWrapper}>
              <p className={styles.pianoDescription}>
                I enjoy playing piano in my free time. Try it out below!
              </p>
              <MiniPiano />
              <p className={styles.pianoHint}>
                Click or tap keys to play
              </p>
            </div>
          </HobbyCard>

          <HobbyCard
            title="Languages"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              </svg>
            }
            index={2}
            isVisible={isVisible}
          >
            <div className={styles.languageWrapper}>
              <p className={styles.languageDescription}>
                Learning new languages is a passion of mine.
              </p>
              <LanguageProgress languages={languages} isVisible={isVisible} />
            </div>
          </HobbyCard>
        </div>
      </div>
    </section>
  );
});

export default Hobbies;
