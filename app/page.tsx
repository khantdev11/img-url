'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabaseClient';

export default function ImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [history, setHistory] = useState<{ name: string, url: string }[]>([]);
  const [customName, setCustomName] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null); // Notification state

  // Notification ပြသရန် function
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const saved = localStorage.getItem('upload-history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!customName) return showNotification("enter your link name!");
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const fileName = `${customName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;
    const { error } = await supabase.storage.from('profile-photos').upload(fileName, file);

    if (!error) {
      const { data } = supabase.storage.from('profile-photos').getPublicUrl(fileName);
      const newEntry = { name: customName, url: data.publicUrl };
      const updatedHistory = [newEntry, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('upload-history', JSON.stringify(updatedHistory));
      setCustomName('');
      setPreview(null);
      showNotification("successfully upload!");
    } else {
      showNotification("❌ Error: " + error.message);
    }
    setUploading(false);
  };

  return (
    <div className="upload-section">
      {/* In-app Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
            className="toast-notification"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Gallery Vault</h1>

      <input placeholder="Enter file name..." value={customName} onChange={(e) => setCustomName(e.target.value)} className="custom-input" />

      <label className="upload-btn">
        <input type="file" onChange={uploadFile} disabled={uploading || !customName} style={{ display: 'none' }} />
        {uploading ? 'Uploading...' : 'Select & Upload'}
      </label>

      {/* Preview Section */}
      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ marginTop: '20px' }}>
            <img src={preview} alt="Preview" style={{ width: '120px', height: '120px', borderRadius: '15px', objectFit: 'cover', margin: '10px auto', border: '2px solid white' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Gallery Section */}
      <div className="gallery-grid">
        <AnimatePresence>
          {history.map((item, index) => (
            <motion.div key={item.url} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="gallery-item">
              <img src={item.url} alt={item.name} onClick={() => { navigator.clipboard.writeText(item.url); showNotification("Copied Link!"); }} />
              <button className="delete-btn" onClick={() => {
                const updated = history.filter((_, i) => i !== index);
                setHistory(updated);
                localStorage.setItem('upload-history', JSON.stringify(updated));
              }}>
                <i className="fa-solid fa-trash"></i>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}