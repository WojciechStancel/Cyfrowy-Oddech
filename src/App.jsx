import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Bell, BellOff, Volume2, VolumeX, Coffee } from 'lucide-react';

// Baza zadań
const BREAK_TASKS = [
  { text: "Spójrz przez okno na najdalszy punkt przez 20 sekund.", icon: "👁️" },
  { text: "Zrób 10 powolnych obrotów barkami do tyłu.", icon: "🧘" },
  { text: "Wypij pół szklanki wody (małymi łykami).", icon: "💧" },
  { text: "Wstań i dotknij palców u stóp bez uginania kolan.", icon: "🤸" },
  { text: "Zamknij oczy i weź 5 bardzo głębokich oddechów.", icon: "🌬️" },
];

const WORK_TIME = 1 * 2; // 50 minut
const BREAK_TIME = 1 * 7; // 5 minut
const SOUND_URL = "/alex_jauk-zen-gong-199844.mp3"; // Upewnij się, że plik jest w /public/

function App() {
  // --- STANY (Z LOCAL STORAGE) ---
  const [seconds, setSeconds] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [completedSessions, setCompletedSessions] = useState(0);

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('notificationsEnabled');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('soundEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [totalWorkMinutes, setTotalWorkMinutes] = useState(() => {
  const saved = localStorage.getItem('totalWorkMinutes');
  return saved !== null ? JSON.parse(saved) : 0;
});



  // --- PERSYSTENCJA ---
  useEffect(() => {
    localStorage.setItem('notificationsEnabled', JSON.stringify(notificationsEnabled));
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);
  useEffect(() => {
  localStorage.setItem('totalWorkMinutes', JSON.stringify(totalWorkMinutes));
}, [totalWorkMinutes]);

  useEffect(() => {
  document.title = isActive 
    ? `${formatTime(seconds)} - ${isBreak ? 'Przerwa' : 'Praca'}`
    : 'Cyfrowy Oddech';
}, [seconds, isActive, isBreak]);

  // --- LOGIKA POWIADOMIEŃ I DŹWIĘKU ---
  const playSound = () => {
    if (soundEnabled) {
      const audio = new Audio(SOUND_URL);
      audio.volume = 0.4;
      audio.play().catch(() => console.log("Audio zablokowane - kliknij na stronę."));
    }
  };

  const toggleNotifications = () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      return;
    }
    if (!("Notification" in window)) return;

    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        setNotificationsEnabled(true);
        new Notification("Powiadomienia aktywne!", { silent: true });
      }
    });
  };

  const triggerNotification = (title, body) => {
    if (notificationsEnabled && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/vite.svg", silent: true });
    }
  };

  // --- GŁÓWNY LICZNIK ---
useEffect(() => {
  let interval = null;
  if (isActive && seconds > 0) {
    interval = setInterval(() => {
      setSeconds(s => s - 1);
      // Jeśli to czas pracy, dodaj sekundę do statystyk dnia
      if (!isBreak) {
        setTotalWorkMinutes(prev => prev + (1/60)); 
      }
    }, 1000);
  } else if (seconds === 0) {
      const nextIsBreak = !isBreak;
      setIsBreak(nextIsBreak);
      setSeconds(nextIsBreak ? BREAK_TIME : WORK_TIME);
      
      if (nextIsBreak) {
        const task = BREAK_TASKS[Math.floor(Math.random() * BREAK_TASKS.length)];
        setCurrentTask(task);
        setCompletedSessions(prev => prev + 1);
        playSound();
        triggerNotification("Czas na przerwę! 🌿", task.text);
      } else {
        playSound();
        triggerNotification("Wracamy do pracy! 💻", "Czas na skupienie.");
      }
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, isBreak]);

  // --- POMOCNIKI ---
  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progress = (( (isBreak ? BREAK_TIME : WORK_TIME) - seconds) / (isBreak ? BREAK_TIME : WORK_TIME)) * 100;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center transition-all duration-1000 font-sans relative overflow-hidden ${isBreak ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-100'}`}>
      
      {/* 1. Animacja oddechu (Tło) */}
      {isBreak && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="w-[500px] h-[500px] bg-emerald-300 rounded-full blur-[120px] animate-breath opacity-40"></div>
        </div>
      )}

      {/* 2. Górny pasek ustawień */}
      <div className="absolute top-8 right-8 flex gap-4 z-20">
        <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-3 hover:bg-white/10 rounded-full transition-all">
          {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} className="opacity-50" />}
        </button>
        <button onClick={toggleNotifications} className={`p-3 hover:bg-white/10 rounded-full transition-all ${notificationsEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
          {notificationsEnabled ? <Bell size={24} /> : <BellOff size={24} />}
        </button>
      </div>

      {/* 3. Główny kontener treści */}
      <div className="relative z-10 max-w-md w-full px-6 text-center">
        <h1 className="text-sm tracking-[0.4em] uppercase mb-4 opacity-60 font-bold drop-shadow-md">
          {isBreak ? "Regeneracja" : "Deep Work"}
        </h1>
        
        <div className="relative mb-12">
          <div className="text-9xl font-extralight tabular-nums tracking-tighter drop-shadow-2xl">
            {formatTime(seconds)}
          </div>
          <div className="w-full h-1 bg-white/10 mt-6 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-400 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(52,211,153,0.6)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Karta Zadania w Przerwie */}
        {isBreak && currentTask && (
          <div className="bg-emerald-900/40 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] p-8 mb-12 animate-in fade-in zoom-in duration-700 shadow-2xl">
            <div className="text-6xl mb-4 leading-none">{currentTask.icon}</div>
            <p className="text-xl font-medium leading-relaxed text-white drop-shadow-md">
              {currentTask.text}
            </p>
          </div>
        )}

        {/* Przyciski Sterowania */}
        <div className="flex flex-col gap-8 items-center">
          <button 
            onClick={() => setIsActive(!isActive)}
            className={`group w-24 h-24 rounded-full flex items-center justify-center transition-all transform active:scale-90 shadow-[0_20px_50px_rgba(0,0,0,0.3)] ${
              isActive ? 'bg-white/10 border border-white/20 text-white' : 'bg-white text-slate-900'
            }`}
          >
            {isActive ? <Pause size={40} /> : <Play size={40} className="ml-2" />}
          </button>
          
          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={() => {setIsActive(false); setSeconds(WORK_TIME); setIsBreak(false);}}
              className="flex items-center gap-2 text-[10px] opacity-40 hover:opacity-100 transition-opacity uppercase tracking-[0.2em]"
            >
              <RotateCcw size={14} /> Resetuj Sesję
            </button>

            {/* Licznik kaw/sesji */}
            <div className="flex gap-2 mt-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
              {completedSessions === 0 && <span className="text-[10px] opacity-40 uppercase">Brak sesji</span>}
              {[...Array(completedSessions)].map((_, i) => (
                <Coffee key={i} size={16} className="text-emerald-400 animate-in fade-in slide-in-from-right-2" />
              ))}
            </div>
          </div>
        </div>

        {/* Panel Statystyk Dnia */}
<div className="mt-12 pt-8 border-t border-white/10 w-full grid grid-cols-2 gap-4">
  <div className="text-center">
    <div className="text-2xl font-light">{Math.floor(totalWorkMinutes)}</div>
    <div className="text-[10px] uppercase tracking-tighter opacity-40">Minut Skupienia</div>
  </div>
  <div className="text-center">
    <div className="text-2xl font-light">{completedSessions}</div>
    <div className="text-[10px] uppercase tracking-tighter opacity-40">Ukończone Sesje</div>
  </div>
</div>

{/* Przycisk czyszczenia statystyk (opcjonalnie) */}
<button 
  onClick={() => {
    if(confirm("Czy na pewno chcesz wyzerować statystyki dnia?")) {
      setTotalWorkMinutes(0);
      setCompletedSessions(0);
    }
  }}
  className="mt-4 text-[9px] opacity-20 hover:opacity-50 transition-opacity uppercase"
>
  Resetuj statystyki dnia
</button>
      </div>
    </div>
  );
}

export default App;