import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Music, 
  X, 
  ExternalLink 
} from 'lucide-react';

export default function MusicPlayer() {
  const { currentTrack, isPlaying, setIsPlaying, stop } = usePlayerStore();
  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentTrack && !currentTrack.isExternal) {
      if (isPlaying) {
        audioRef.current?.play();
      } else {
        audioRef.current?.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  const handleTimeUpdate = () => {
    const duration = audioRef.current.duration;
    const currentTime = audioRef.current.currentTime;
    setProgress((currentTime / duration) * 100);
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      {/* Progress Bar */}
      <div className="h-1 bg-white/10 w-full">
        <div 
          className="h-full bg-easygig-accent transition-all duration-300" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="bg-slate-900/90 backdrop-blur-2xl border-t border-white/10 p-4 md:px-12 flex items-center justify-between">
        
        {/* Track Info */}
        <div className="flex items-center gap-4 w-1/3">
          <div className="w-12 h-12 bg-easygig-accent/20 rounded-xl flex items-center justify-center text-easygig-accent shrink-0">
            <Music size={24} />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-white truncate">{currentTrack.title}</h4>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">In riproduzione</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2 w-1/3">
          <div className="flex items-center gap-6">
            <button className="text-slate-500 hover:text-white transition-colors"><SkipBack size={20} /></button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
            </button>
            <button className="text-slate-500 hover:text-white transition-colors"><SkipForward size={20} /></button>
          </div>
        </div>

        {/* Extra Controls */}
        <div className="flex items-center justify-end gap-6 w-1/3">
          {currentTrack.isExternal ? (
            <a 
              href={currentTrack.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-bold text-easygig-accent hover:underline"
            >
              Apri Esterno <ExternalLink size={14} />
            </a>
          ) : (
            <div className="flex items-center gap-2 text-slate-400">
              <Volume2 size={20} />
              <div className="w-24 h-1 bg-white/10 rounded-full">
                <div className="w-1/2 h-full bg-slate-400 rounded-full" />
              </div>
            </div>
          )}
          <button onClick={stop} className="text-slate-500 hover:text-white p-2 rounded-full hover:bg-white/5">
            <X size={20} />
          </button>
        </div>

        {/* Hidden Audio Element */}
        {!currentTrack.isExternal && (
          <audio 
            ref={audioRef}
            src={currentTrack.url}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
          />
        )}
      </div>
    </div>
  );
}
