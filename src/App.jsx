import { useState, useEffect } from 'react';
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

function App() {
  const [workTime, setWorkTime] = useState(60 * 60); 
  const [breakTime, setBreakTime] = useState(9 * 60); 
  
  const [seconds, setSeconds] = useState(workTime);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalWorkMinutes, setTotalWorkMinutes] = useState(() => JSON.parse(localStorage.getItem('totalWorkMinutes')) || 0);
  const [isWaitingForConfirmation, setIsWaitingForConfirmation] = useState(false);
  
  const SOUND_URL = "/notification-sound.mp3"; 
  const NOTIFICATION_SOUND_URL = "/break-end-sound.mp3"; // Nowy dźwięk ostrzegawczy

  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('soundEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('notificationsEnabled');
    return saved !== null ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('notificationsEnabled', JSON.stringify(notificationsEnabled));
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem('totalWorkMinutes', JSON.stringify(totalWorkMinutes));
  }, [totalWorkMinutes]);

  useEffect(() => {
    document.title = isActive 
      ? `${Math.floor(seconds/60)}:${seconds%60 < 10 ? '0' : ''}${seconds%60} - ${isBreak ? 'Przerwa' : 'Praca'}`
      : 'Cyfrowy Oddech';
  }, [seconds, isActive, isBreak]);

  // Ulepszona funkcja dźwięku obsługująca różne pliki
  const playSound = (url = SOUND_URL, vol = 0.4) => {
    if (soundEnabled) {
      const audio = new Audio(url);
      audio.volume = vol;
      audio.play().catch(() => {});
    }
  };

  const toggleNotifications = () => {
    if (!notificationsEnabled) {
      Notification.requestPermission().then(p => {
        if (p === "granted") setNotificationsEnabled(true);
      });
    } else {
      setNotificationsEnabled(false);
    }
  };

  const setPreset = (w, b) => {
    if (!w || w <= 0) return;
    setIsActive(false);
    setWorkTime(w);
    setBreakTime(b);
    setSeconds(w);
    setIsBreak(false);
    setIsWaitingForConfirmation(false);
  };

  useEffect(() => {
    let interval = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(s => {
          // Zmiana: używamy notification-sound.mp3 przed końcem przerwy
          if (isBreak && s === 3) playSound(NOTIFICATION_SOUND_URL, 0.3); 
          return s - 1;
        });
        if (!isBreak) setTotalWorkMinutes(prev => prev + (1/60));
      }, 1000);
    } else if (seconds === 0) {
      if (!isBreak) {
        if (!isWaitingForConfirmation) {
          setIsActive(false);
          setIsWaitingForConfirmation(true);
          playSound();
          const newTask = BREAK_TASKS[Math.floor(Math.random() * BREAK_TASKS.length)];
          setCurrentTask(newTask);
          triggerNotification("Czas na przerwę! 🌿", `Zadanie dla Ciebie: ${newTask.text}`);
        }
      } else {
        setIsBreak(false);
        setSeconds(workTime);
        playSound();
        triggerNotification("Przerwa zakończona", "Wracamy do pracy! Skupienie włączone.");
      }
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, isBreak, workTime, isWaitingForConfirmation]);

  useEffect(() => {
    let reminder = null;
    if (isWaitingForConfirmation) {
      reminder = setInterval(() => {
        if (soundEnabled) playSound(SOUND_URL, 0.2); 
      }, 5000);
    }
    return () => clearInterval(reminder);
  }, [isWaitingForConfirmation, soundEnabled]);

  const startBreak = () => {
    setIsWaitingForConfirmation(false);
    setIsBreak(true);
    setSeconds(breakTime);
    setCompletedSessions(prev => prev + 1);
    setIsActive(true);
  };

  const progress = (((isBreak ? breakTime : workTime) - seconds) / (isBreak ? breakTime : workTime)) * 100;

  const triggerNotification = (title, body) => {
    if (notificationsEnabled && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/vite.svg", silent: true });
    }
  };

  return (
    <div className={`min-h-screen max-h-screen flex flex-col items-center justify-center transition-all duration-1000 font-sans relative overflow-hidden ${isBreak ? 'bg-emerald-700 text-white' : 'bg-slate-950 text-slate-100'}`}>
      
      <div className="absolute top-8 right-8 flex gap-4 z-50">
        <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-3 hover:bg-white/10 rounded-full transition-all">
          {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} className="opacity-50" />}
        </button>
        <button onClick={toggleNotifications} className={`p-3 hover:bg-white/10 rounded-full transition-all ${notificationsEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
          {notificationsEnabled ? <Bell size={24} /> : <BellOff size={24} />}
        </button>
      </div>

      {!isActive && !isBreak && !isWaitingForConfirmation && (
        <div className="absolute top-16 sm:top-24 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 sm:px-6 z-20 animate-in fade-in zoom-in duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <button onClick={() => setPreset(25 * 60, 4 * 60)} className="p-6 rounded-[2.5rem] bg-slate-900/40 backdrop-blur-xl border border-white/5 hover:border-emerald-500/50 transition-all">
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-2">Standard</div>
              <div className="text-3xl font-light text-white">25 <span className="text-xs opacity-30">min</span></div>
              <div className="mt-2 text-[9px] text-emerald-400/60 font-bold uppercase tracking-widest">Przerwa: 4m</div>
            </button>

            <button onClick={() => setPreset(50 * 60, 7 * 60)} className="p-6 rounded-[2.5rem] bg-slate-900/40 backdrop-blur-xl border border-white/5 hover:border-emerald-500/50 transition-all">
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-2">Długi</div>
              <div className="text-3xl font-light text-white">50 <span className="text-xs opacity-30">min</span></div>
              <div className="mt-2 text-[9px] text-emerald-400/60 font-bold uppercase tracking-widest">Przerwa: 7m</div>
            </button>

            <div className="p-6 rounded-[2.5rem] bg-slate-900/60 backdrop-blur-xl border border-emerald-500/30 flex flex-col items-center justify-center relative">
              <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-bold mb-1">Własny</div>
              <div className="flex items-baseline justify-center w-full">
                <input 
                  type="number" 
                  inputMode="numeric"
                  min="0"
                  placeholder="0"
                  className="bg-transparent w-full text-4xl font-light text-center outline-none text-white placeholder:opacity-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value) || 0);
                    const breakMins = Math.max(1, Math.floor(val * 0.15));
                    setPreset(val * 60, breakMins * 60);
                  }} 
                />
                <span className="text-[10px] opacity-30 uppercase font-bold absolute right-8 bottom-10 sm:static sm:ml-1">min</span>
              </div>
              <div className="h-4 mt-1">
                {workTime > 0 && (
                  <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest animate-in fade-in">
                    Przerwa: {Math.floor(breakTime / 60)}m
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      <div className="relative z-10 max-w-md w-full px-6 text-center mt-40 sm:mt-60">
        <h1 className="text-[10px] sm:text-xs tracking-[0.4em] uppercase mb-4 opacity-40 font-bold">
          {isBreak ? "Regeneracja" : "Głębokie Skupienie"}
        </h1>
        <div className="text-7xl sm:text-9xl font-extralight tabular-nums tracking-tighter mb-4">
          {Math.floor(seconds/60)}:{seconds%60 < 10 ? '0' : ''}{seconds%60}
        </div>
        
        <div className="w-full h-1 bg-white/10 mb-12 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-400 transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }}></div>
        </div>

        {isBreak && currentTask && (
          <div className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] p-8 mb-12 animate-in zoom-in">
            <div className="text-6xl mb-4 leading-none">{currentTask.icon}</div>
            <p className="text-xl font-medium text-white">{currentTask.text}</p>
          </div>
        )}

        <div className="flex flex-col gap-8 items-center">
          <button onClick={() => setIsActive(!isActive)} className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-white/10 border border-white/20' : 'bg-white text-slate-900'}`}>
            {isActive ? <Pause size={40} /> : <Play size={40} className="ml-2" />}
          </button>
          <button onClick={() => {setIsActive(false); setSeconds(workTime); setIsBreak(false);}} className="text-[10px] opacity-30 hover:opacity-100 uppercase tracking-widest flex items-center gap-2"><RotateCcw size={14}/> Resetuj Sesję</button>
          <div className="flex gap-2 bg-black/20 px-4 py-2 rounded-full">
            {[...Array(completedSessions)].map((_, i) => <Coffee key={i} size={16} className="text-emerald-400" />)}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 w-full grid grid-cols-2 opacity-40 text-center">
          <div><div className="text-2xl font-light">{Math.floor(totalWorkMinutes)}</div><div className="text-[8px] uppercase">Minut Dziś</div></div>
          <div><div className="text-2xl font-light">{completedSessions}</div><div className="text-[8px] uppercase">Sesje Dziś</div></div>
        </div>
      </div>

      {isWaitingForConfirmation && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-xs animate-in slide-in-from-bottom-8">
            <h2 className="text-4xl font-bold mb-4 text-white">Czas na przerwę!</h2>
            <button onClick={startBreak} className="w-full bg-emerald-500 py-6 rounded-2xl text-2xl font-bold transition-all hover:scale-105">Zacznij przerwę 🌿</button>
            <button 
              onClick={() => { setSeconds(2 * 60); setIsActive(true); setIsWaitingForConfirmation(false); }}
              className="mt-8 text-xs opacity-30 hover:opacity-100 uppercase tracking-[0.2em] transition-all hover:text-emerald-400"
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