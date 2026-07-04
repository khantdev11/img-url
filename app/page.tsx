'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabaseClient';

export default function ImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [history, setHistory] = useState<{ name: string, url: string }[]>([]);
  const [customName, setCustomName] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('upload-history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Copy လုပ်တဲ့ Function
  const copyToClipboard = (text: string) => {
    const fullLink = `${window.location.origin}/${text}`;
    navigator.clipboard.writeText(fullLink);
    showNotification("📋 Link copied to clipboard!");
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!customName) return showNotification(" Enter a unique link name!");
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const fileName = `${customName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage.from('profile-photos').upload(fileName, file);

    if (uploadError) {
      showNotification(" Error: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('profile-photos').getPublicUrl(fileName);
    const { error: dbError } = await supabase.from('links').insert([
      { slug: customName, original_url: data.publicUrl }
    ]);

    if (dbError) {
      showNotification(" This name is already taken!");
    } else {
      const newEntry = { name: customName, url: data.publicUrl };
      const updatedHistory = [newEntry, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('upload-history', JSON.stringify(updatedHistory));

      showNotification(" Uploaded! Click to copy.");
      setCustomName('');
      setPreview(null);
    }
    setUploading(false);
  };

  const deleteItem = (index: number) => {
    const updated = history.filter((_, i) => i !== index);
    setHistory(updated);
    localStorage.setItem('upload-history', JSON.stringify(updated));
  };

  if (!isClient) return null;

  return (
    <div className="upload-section">
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="toast-notification">
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <h1>Gallery Vault</h1>
      <input placeholder="Enter custom name..." value={customName} onChange={(e) => setCustomName(e.target.value)} className="custom-input" />

      <label className="upload-btn">
        <input type="file" onChange={uploadFile} disabled={uploading} style={{ display: 'none' }} />
        {uploading ? 'Uploading...' : 'Select & Upload'}
      </label>

      <div className="gallery-grid">
        {history.map((item, index) => (
          <motion.div key={item.url} className="gallery-item">
            {/* ပုံကို နှိပ်ရင် copy ဖြစ်မယ် */}
            <img
              src={item.url}
              alt={item.name}
              onClick={() => copyToClipboard(item.name)}
              style={{ cursor: 'pointer' }}
            />
            <p onClick={() => copyToClipboard(item.name)} style={{ cursor: 'pointer' }}>
              /{item.name}
            </p>
            <button className="delete-btn" onClick={() => deleteItem(index)}>➖</button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}