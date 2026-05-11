import { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Star, 
  Plus, 
  Loader2, 
  X,
  Maximize2
} from 'lucide-react';
import * as photoApi from '../api/photos';

export default function PhotoGallery({ type, id, onUpdate }) {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null); // For fullscreen preview

  useEffect(() => {
    fetchPhotos();
  }, [type, id]);

  const fetchPhotos = async () => {
    try {
      let data = [];
      if (type === 'BAND') data = await photoApi.getBandPhotos(id);
      else if (type === 'VENUE') data = await photoApi.getVenuePhotos(id);
      else if (type === 'ORG') data = await photoApi.getOrgPhotos(id);
      setPhotos(data);
    } catch (error) {
      console.error("Errore caricamento foto:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await photoApi.uploadPhoto(type, id, file);
      fetchPhotos();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Errore upload foto:", error);
      alert("Errore durante il caricamento della foto.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (photoId) => {
    if (!window.confirm("Sei sicuro di voler eliminare questa foto?")) return;
    try {
      await photoApi.deletePhoto(photoId);
      setPhotos(photos.filter(p => p.id !== photoId));
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Errore eliminazione foto:", error);
    }
  };

  const handleSetPrimary = async (photoId) => {
    try {
      await photoApi.setPrimaryPhoto(photoId);
      fetchPhotos(); // Ricarica per aggiornare gli stati isPrimary
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Errore impostazione foto primaria:", error);
    }
  };

  return (
    <section className="bg-slate-900 border border-white/5 p-8 rounded-[3rem] space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-3 uppercase tracking-tight">
          <ImageIcon className="text-easygig-accent" /> Galleria Fotografica
        </h3>
        
        <label className="bg-easygig-accent hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all">
          {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
          Carica Foto
          <input type="file" className="hidden" onChange={handleUpload} accept="image/*" disabled={isUploading} />
        </label>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-easygig-accent" /></div>
      ) : photos.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
          <ImageIcon size={48} className="mx-auto text-slate-700 mb-4" />
          <p className="text-slate-500 text-sm italic">Ancora nessuna foto. Carica i tuoi momenti migliori!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {(Array.isArray(photos) ? photos : []).map(photo => (
            <div key={photo.id} className="relative aspect-square rounded-2xl overflow-hidden group border border-white/5">
              <img 
                src={photo.source} 
                alt={photo.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  {!(photo.isPrimary || photo.primary) ? (
                    <button 
                      onClick={() => handleSetPrimary(photo.id)}
                      className="bg-white/20 hover:bg-amber-500 text-white p-1.5 rounded-lg transition-all"
                      title="Imposta come foto profilo"
                    >
                      <Star size={14} />
                    </button>
                  ) : (
                    <div className="bg-amber-500 text-white p-1.5 rounded-lg shadow-lg">
                      <Star size={14} fill="white" />
                    </div>
                  )}
                  <button 
                    onClick={() => handleDelete(photo.id)}
                    className="bg-rose-500/80 hover:bg-rose-500 text-white p-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <button 
                  onClick={() => setSelectedPhoto(photo)}
                  className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[10px] font-bold py-2 rounded-xl flex items-center justify-center gap-2"
                >
                  <Maximize2 size={12} /> Ingrandisci
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Preview */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
          <button 
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
          >
            <X size={32} />
          </button>
          <img 
            src={selectedPhoto.source} 
            alt={selectedPhoto.name} 
            className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl animate-zoom-in"
          />
          <div className="absolute bottom-8 text-center">
            <p className="text-white font-bold">{selectedPhoto.name}</p>
            <p className="text-slate-500 text-sm italic">{(selectedPhoto.isPrimary || selectedPhoto.primary) ? "Foto Profilo Principale" : "Foto Galleria"}</p>
          </div>
        </div>
      )}
    </section>
  );
}
