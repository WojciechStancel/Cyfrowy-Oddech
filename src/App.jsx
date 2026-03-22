import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Bell, BellOff, Volume2, VolumeX, Coffee } from 'lucide-react';

const BREAK_TASKS = [
  { text: "Spójrz przez okno na najdalszy możliwy punkt.", icon: "👁️" },
  { text: "Zrób 10 powolnych obrotów barkami do tyłu.", icon: "🧘" },
  { text: "Wypij pół szklanki wody małymi łykami.", icon: "💧" },
  { text: "Wstań i dotknij palców u stóp.", icon: "🤸" },
  { text: "Weź 5 bardzo głębokich oddechów przeponowych.", icon: "🌬️" },
  { text: "Wyjdź na balkon lub otwórz szeroko okno.", icon: "🌳" },
  { text: "Zrób krótki spacer po pokoju lub korytarzu.", icon: "🚶" },
  { text: "Umyj twarz i dłonie zimną wodą.", icon: "🌊" },
  { text: "Wyprostuj plecy i mocno ściągnij łopatki.", icon: "📏" },
  { text: "Zamknij oczy i nie myśl o pracy przez 30 sekund.", icon: "🌑" },
  { text: "Zrób 5 głębokich przysiadów.", icon: "🏋️" },
  { text: "Przewietrz pokój, w którym pracujesz.", icon: "💨" },
  { text: "Posłuchaj odgłosów otoczenia w pełnej ciszy.", icon: "🔇" },
  { text: "Zrób krótki masaż skroni palcami.", icon: "💆" },
  { text: "Napnij wszystkie mięśnie na 5s i rozluźnij je.", icon: "💪" },
  { text: "Spójrz na coś zielonego (roślina, drzewo).", icon: "🌿" },
  { text: "Zrób 'krążenia szyją' - bardzo powoli.", icon: "🔄" },
  { text: "Oprzyj dłonie o ścianę i rozciągnij klatkę piersiową.", icon: "🧗" },
  { text: "Złóż dłonie za plecami i wypchnij klatkę do przodu.", icon: "👐" },
  { text: "Potrząśnij dłońmi, aby rozluźnić nadgarstki.", icon: "🙌" },
  { text: "Zrób szybki porządek na biurku (wyrzuć śmieci).", icon: "🗑️" },
  { text: "Zjedz zdrową przekąskę (orzechy, owoc).", icon: "🍎" },
  { text: "Zrób 'koci grzbiet' na siedząco lub stojąco.", icon: "🐈" },
  { text: "Pomrugaj intensywnie oczami przez 10 sekund.", icon: "✨" },
  { text: "Wyciągnij ręce wysoko nad głowę.", icon: "⬆️" },
  { text: "Zrób skłon boczny w lewo i w prawo.", icon: "↔️" },
  { text: "Skup wzrok na czubku swojego nosa, potem w dal.", icon: "🎯" },
  { text: "Wykonaj 3 minuty 'cyfrowego detoksu' (bez ekranu).", icon: "📴" },
  { text: "Podziękuj sobie za dotychczasową pracę.", icon: "🙏" },
  { text: "Zrób kilka kroków boso po podłodze.", icon: "👣" },
];

const SOUND_URL = "/notification-sound.mp3";
const NOTIFICATION_SOUND_URL = "/break-end-sound.mp3";

function App() {
  const [workTime, setWorkTime] = useState(1 * 5);
  const [breakTime, setBreakTime] = useState(1 * 6);

  const [seconds, setSeconds] = useState(workTime);
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [isWaitingForConfirmation, setIsWaitingForConfirmation] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');

  const [totalWorkSeconds, setTotalWorkSeconds] = useState(() => {
    return JSON.parse(localStorage.getItem('totalWorkSeconds')) || 0;
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('soundEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('notificationsEnabled');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const timerEndRef = useRef(null);
  const intervalRef = useRef(null);
  const reminderRef = useRef(null);
  const lastWholeSecondRef = useRef(null);

  const mainAudioRef = useRef(null);
  const breakEndAudioRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('notificationsEnabled', JSON.stringify(notificationsEnabled));
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem('totalWorkSeconds', JSON.stringify(totalWorkSeconds));
  }, [totalWorkSeconds]);

  useEffect(() => {
    document.title = isActive
      ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} - ${isBreak ? 'Przerwa' : 'Praca'}`
      : 'Cyfrowy Oddech';
  }, [seconds, isActive, isBreak]);

  const unlockAudio = useCallback(async () => {
    try {
      if (!mainAudioRef.current) {
        mainAudioRef.current = new Audio(SOUND_URL);
        mainAudioRef.current.preload = 'auto';
      }

      if (!breakEndAudioRef.current) {
        breakEndAudioRef.current = new Audio(NOTIFICATION_SOUND_URL);
        breakEndAudioRef.current.preload = 'auto';
      }

      mainAudioRef.current.muted = true;
      await mainAudioRef.current.play();
      mainAudioRef.current.pause();
      mainAudioRef.current.currentTime = 0;
      mainAudioRef.current.muted = false;
    } catch (e) {
      console.warn('Audio unlock failed:', e);
    }
  }, []);

  const playSound = useCallback(async (type = 'main', vol = 0.4) => {
    if (!soundEnabled) return;

    try {
      const audio = type === 'breakEnd' ? breakEndAudioRef.current : mainAudioRef.current;
      if (!audio) return;

      audio.pause();
      audio.currentTime = 0;
      audio.volume = vol;
      await audio.play();
    } catch (e) {
      console.warn('Audio play blocked/failed:', e);
    }
  }, [soundEnabled]);

  const triggerNotification = useCallback(async (title, body) => {
    if (!notificationsEnabled) return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.showNotification(title, {
            body,
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            tag: 'cyfrowy-oddech',
            renotify: true,
            requireInteraction: true,
            silent: true,
          });
          return;
        }
      }

      new Notification(title, {
        body,
        icon: '/favicon.svg',
        silent: true,
      });
    } catch (e) {
      console.warn('Notification failed:', e);
    }
  }, [notificationsEnabled]);

  const startTimer = useCallback((durationInSeconds) => {
    timerEndRef.current = Date.now() + durationInSeconds * 1000;
    lastWholeSecondRef.current = durationInSeconds;
    setSeconds(durationInSeconds);
    setProgress(0);
    setIsActive(true);
  }, []);

  const stopTimer = useCallback(() => {
    setIsActive(false);
    timerEndRef.current = null;
    lastWholeSecondRef.current = null;
  }, []);

  const finishWork = useCallback(async () => {
    setIsActive(false);
    setIsWaitingForConfirmation(true);
    setProgress(100);

    const newTask = BREAK_TASKS[Math.floor(Math.random() * BREAK_TASKS.length)];
    setCurrentTask(newTask);

    await playSound('main', 0.5);
    await triggerNotification("Czas na przerwę! 🌿", `Zadanie: ${newTask.text}`);
  }, [playSound, triggerNotification]);

  const finishBreak = useCallback(async () => {
    setIsBreak(false);
    setSeconds(workTime);
    setProgress(0);
    setIsActive(true);
    timerEndRef.current = Date.now() + workTime * 1000;
    lastWholeSecondRef.current = workTime;

    await playSound('main', 0.5);
    await triggerNotification("Przerwa zakończona", "Wracamy do pracy! Skupienie włączone.");
  }, [playSound, triggerNotification, workTime]);

  const setPreset = (w, b) => {
    if (!w || w <= 0) return;

    stopTimer();
    setWorkTime(w);
    setBreakTime(b);
    setSeconds(w);
    setProgress(0);
    setIsBreak(false);
    setIsWaitingForConfirmation(false);
  };

  const startBreak = async () => {
    setIsWaitingForConfirmation(false);
    setIsBreak(true);
    setCompletedSessions(prev => prev + 1);
    setProgress(0);
    startTimer(breakTime);
  };

  useEffect(() => {
    if (!isActive || !timerEndRef.current) {
      clearInterval(intervalRef.current);
      return;
    }

    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      const totalDuration = isBreak ? breakTime : workTime;
      const msLeft = Math.max(0, timerEndRef.current - Date.now());
      const remaining = Math.ceil(msLeft / 1000);
      const nextProgress = ((totalDuration * 1000 - msLeft) / (totalDuration * 1000)) * 100;

      const prev = lastWholeSecondRef.current;

      setProgress(Math.min(100, Math.max(0, nextProgress)));
      setSeconds(remaining);

      if (!isBreak && typeof prev === 'number' && prev > remaining) {
        setTotalWorkSeconds(current => current + (prev - remaining));
      }

      if (isBreak && typeof prev === 'number' && prev > 3 && remaining <= 3 && remaining > 0) {
        await playSound('breakEnd', 0.3);
      }

      lastWholeSecondRef.current = remaining;

      if (remaining === 0) {
        clearInterval(intervalRef.current);
        timerEndRef.current = null;
        setProgress(100);

        if (isBreak) {
          await finishBreak();
        } else {
          await finishWork();
        }
      }
    }, 100);

    return () => clearInterval(intervalRef.current);
  }, [isActive, isBreak, breakTime, workTime, finishBreak, finishWork, playSound]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (!document.hidden && isActive && timerEndRef.current) {
        const totalDuration = isBreak ? breakTime : workTime;
        const msLeft = Math.max(0, timerEndRef.current - Date.now());
        const remaining = Math.ceil(msLeft / 1000);
        const nextProgress = ((totalDuration * 1000 - msLeft) / (totalDuration * 1000)) * 100;

        setSeconds(remaining);
        setProgress(Math.min(100, Math.max(0, nextProgress)));
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [isActive, isBreak, breakTime, workTime]);

  useEffect(() => {
    clearInterval(reminderRef.current);

    if (isWaitingForConfirmation) {
      reminderRef.current = setInterval(() => {
        playSound('main', 0.2);
      }, 5000);
    }

    return () => clearInterval(reminderRef.current);
  }, [isWaitingForConfirmation, playSound]);

  const toggleNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Ta przeglądarka nie wspiera powiadomień.');
      return;
    }

    if (!notificationsEnabled) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') setNotificationsEnabled(true);
      } catch (e) {
        console.warn('Permission request failed:', e);
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const handleStartPause = async () => {
    await unlockAudio();

    if (isActive) {
      stopTimer();
    } else {
      startTimer(seconds);
    }
  };

  const handleReset = () => {
    stopTimer();
    setSeconds(workTime);
    setProgress(0);
    setIsBreak(false);
    setIsWaitingForConfirmation(false);
  };

  const estimatedBreakMinutes = customMinutes && Number(customMinutes) > 0
    ? Math.max(1, Math.floor(Number(customMinutes) * 0.15))
    : 0;

  return (
    <div className={`min-h-[100dvh] flex flex-col items-center justify-between py-6 px-6 transition-all duration-1000 font-sans relative overflow-hidden ${isBreak ? 'bg-emerald-700 text-white' : 'bg-slate-950 text-slate-100'}`}>
      <div className="w-full max-w-4xl flex justify-end gap-2 z-50">
        <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-3 hover:bg-white/10 rounded-full transition-all">
          {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} className="opacity-50" />}
        </button>

        <button onClick={toggleNotifications} className={`p-3 hover:bg-white/10 rounded-full transition-all ${notificationsEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
          {notificationsEnabled ? <Bell size={24} /> : <BellOff size={24} />}
        </button>
      </div>

      <div className="w-full max-w-4xl z-20 flex flex-col justify-center min-h-[140px]">
        {!isActive && !isBreak && !isWaitingForConfirmation && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in zoom-in duration-500">
            <button
              onClick={() => {
                setCustomMinutes('');
                setPreset(25 * 60, 4 * 60);
              }}
              className="p-4 rounded-[2rem] bg-slate-900/40 backdrop-blur-xl border border-white/5 hover:border-emerald-500/50 transition-all text-left"
            >
              <div className="text-[9px] uppercase tracking-[0.2em] opacity-40 mb-1">Standard</div>
              <div className="text-2xl font-light text-white">25 <span className="text-[10px] opacity-30">min</span></div>
              <div className="mt-1 text-[8px] text-emerald-400 font-bold uppercase tracking-widest">Przerwa: 4m</div>
            </button>

            <button
              onClick={() => {
                setCustomMinutes('');
                setPreset(50 * 60, 7 * 60);
              }}
              className="p-4 rounded-[2rem] bg-slate-900/40 backdrop-blur-xl border border-white/5 hover:border-emerald-500/50 transition-all text-left"
            >
              <div className="text-[9px] uppercase tracking-[0.2em] opacity-40 mb-1">Długi</div>
              <div className="text-2xl font-light text-white">50 <span className="text-[10px] opacity-30">min</span></div>
              <div className="mt-1 text-[8px] text-emerald-400 font-bold uppercase tracking-widest">Przerwa: 7m</div>
            </button>

            <div className="p-4 rounded-[2rem] bg-slate-900/60 backdrop-blur-xl border border-emerald-500/30 flex flex-col items-center justify-center relative">
              <div className="text-[9px] uppercase tracking-[0.2em] text-emerald-400 font-bold mb-1">Własny</div>

              <div className="flex items-baseline justify-center w-full">
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  placeholder="0"
                  value={customMinutes}
                  className="bg-transparent w-full text-3xl font-light text-center outline-none text-white placeholder:opacity-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  onChange={(e) => {
                    const raw = e.target.value;
                    setCustomMinutes(raw);

                    const val = Math.max(0, parseInt(raw) || 0);
                    const breakMins = Math.max(1, Math.floor(val * 0.15));

                    if (val > 0) {
                      setPreset(val * 60, breakMins * 60);
                    }
                  }}
                />
                <span className="text-[9px] opacity-30 uppercase font-bold ml-1">min</span>
              </div>

              {estimatedBreakMinutes > 0 && (
                <div className="mt-1 text-[8px] text-emerald-400 font-bold uppercase tracking-widest">
                  Przerwa: {estimatedBreakMinutes}m
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md text-center z-10 py-4">
        <h1 className="text-[10px] sm:text-xs tracking-[0.4em] uppercase mb-4 opacity-40 font-bold">
          {isBreak ? "Regeneracja" : "Głębokie Skupienie"}
        </h1>

        <div className="text-[18vw] sm:text-9xl font-extralight tabular-nums tracking-tighter leading-none mb-6">
          {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
        </div>

        <div className="w-full h-1 bg-white/10 mb-8 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400 transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>

        {isBreak && currentTask && (
          <div className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2rem] p-6 mb-4 animate-in zoom-in w-full max-w-xs">
            <div className="text-4xl mb-3 leading-none">{currentTask.icon}</div>
            <p className="text-base font-medium text-white leading-tight">{currentTask.text}</p>
          </div>
        )}
      </div>

      <div className="w-full max-w-md flex flex-col items-center gap-6 z-10">
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={handleStartPause}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-white/10 border border-white/20' : 'bg-white text-slate-900'}`}
          >
            {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </button>

          <button onClick={handleReset} className="text-[10px] opacity-30 hover:opacity-100 uppercase tracking-widest flex items-center gap-2">
            <RotateCcw size={14} /> Resetuj Sesję
          </button>

          <div className="flex flex-wrap justify-center gap-2 min-h-[24px]">
            {[...Array(completedSessions)].map((_, i) => <Coffee key={i} size={16} className="text-emerald-400" />)}
          </div>
        </div>

        <div className="w-full grid grid-cols-2 opacity-40 text-center border-t border-white/5 pt-6">
          <div>
            <div className="text-xl font-light">{Math.floor(totalWorkSeconds / 60)}</div>
            <div className="text-[8px] uppercase">Minut Dziś</div>
          </div>
          <div>
            <div className="text-xl font-light">{completedSessions}</div>
            <div className="text-[8px] uppercase">Sesje Dziś</div>
          </div>
        </div>
      </div>

      {isWaitingForConfirmation && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-xs animate-in slide-in-from-bottom-8">
            <h2 className="text-4xl font-bold mb-6 text-white leading-tight">Zasłużyłeś na przerwę!</h2>

            <button
              onClick={startBreak}
              className="w-full bg-emerald-500 py-6 rounded-2xl text-xl font-bold transition-all active:scale-95"
            >
              Zacznij przerwę 🌿
            </button>

            <button
              onClick={() => {
                setIsWaitingForConfirmation(false);
                setProgress(0);
                startTimer(2 * 60);
              }}
              className="mt-8 text-[10px] opacity-30 hover:opacity-100 uppercase tracking-[0.2em] transition-all"
            >
              Daj mi jeszcze 2 minuty ⏳
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;