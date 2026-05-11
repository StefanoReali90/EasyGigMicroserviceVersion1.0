import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  Music, 
  Upload, 
  ExternalLink, 
  Trash2, 
  Play, 
  Pause,
  Plus, 
  Loader2, 
  Headphones,
  Link as LinkIcon
} from 'lucide-react';
import * as trackApi from '../api/tracks';
import { usePlayerStore } from '../store/playerStore';

export default function TrackManager({ bandId = null }) {
  const { currentTrack, isPlaying, setCurrentTrack, togglePlay } = usePlayerStore();
  const { user } = useAuthStore();
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form state
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchTracks();
  }, [bandId, user.id]);

  const fetchTracks = async () => {
    try {
      let data = [];
      if (bandId) {
        data = await trackApi.getBandTracks(bandId);
      } else {
        data = await trackApi.getArtistTracks(user.id);
      }
      setTracks(data);
    } catch (error) {
      console.error("Errore recupero brani:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || (!file && !externalUrl)) return;

    setIsUploading(true);
    try {
      if (file) {
        // Upload File
        if (bandId) {
          await trackApi.uploadBandTrack(bandId, title, file);
        } else {
          await trackApi.uploadArtistTrack(user.id, title, file);
        }
      } else {
        // Add External
        if (bandId) {
          await trackApi.addExternalBandTrack(bandId, title, externalUrl);
        } else {
          await trackApi.addExternalArtistTrack(user.id, title, externalUrl);
        }
      }
      alert("Brano aggiunto con successo!");
      setTitle("");
      setFile(null);
      setExternalUrl("");
      setShowUpload(false);
      fetchTracks();
    } catch (error) {
      console.error("Errore aggiunta brano:", error);
      alert("Errore durante l'aggiunta del brano.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="bg-slate-900 border border-white/5 p-8 rounded-[3rem] space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-3 uppercase tracking-tight">
          <Headphones className="text-easygig-accent" /> Libreria Musicale
        </h3>
        <button 
          onClick={() => setShowUpload(!showUpload)}
          className="bg-easygig-accent/10 hover:bg-easygig-accent/20 text-easygig-accent p-3 rounded-2xl transition-all"
        >
          {showUpload ? <Trash2 size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showUpload && (
        <form onSubmit={handleUpload} className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4 animate-slide-down">
          <div className="space-y-2">
            <label className="text-[10px] uppercase text-slate-500 font-bold ml-2">Titolo Brano</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es. Summer Hit 2024" 
              className="w-full bg-slate-800 border border-white/10 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-easygig-accent"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-slate-500 font-bold ml-2">File Audio (MP3/WAV)</label>
              <div className="relative h-[52px]">
                <input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  accept="audio/*"
                />
                <div className="absolute inset-0 bg-slate-800 border border-dashed border-white/20 rounded-2xl flex items-center justify-center gap-2 text-slate-400 text-sm">
                  <Upload size={16} /> {file ? file.name : "Carica File"}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-slate-500 font-bold ml-2">Link Esterno (Spotify/YT)</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-4 text-slate-500" size={16} />
                <input 
                  type="url" 
                  value={externalUrl} 
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://open.spotify.com/..." 
                  className="w-full bg-slate-800 border border-white/10 rounded-2xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-easygig-accent"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isUploading}
            className="w-full bg-easygig-accent hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            {isUploading ? <Loader2 className="animate-spin" /> : "Aggiungi alla Libreria"}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-easygig-accent" /></div>
        ) : tracks.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
            <Music size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-500 text-sm italic">Nessun brano caricato. Fatti sentire!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {(Array.isArray(tracks) ? tracks : []).map(track => (
              <div key={track.id} className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/5 flex items-center justify-between group transition-all">
                <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => currentTrack?.id === track.id ? togglePlay() : setCurrentTrack(track)}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${currentTrack?.id === track.id ? 'bg-easygig-accent text-white shadow-lg shadow-indigo-500/20' : 'bg-easygig-accent/10 text-easygig-accent'}`}>
                    {currentTrack?.id === track.id && isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill={currentTrack?.id === track.id ? "currentColor" : "none"} />}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${currentTrack?.id === track.id ? 'text-easygig-accent' : 'text-white'}`}>{track.title}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                      {track.isExternal ? "External Link" : "Native Track"}
                    </p>
                  </div>
                </div>
                <a 
                  href={track.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-easygig-accent"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
