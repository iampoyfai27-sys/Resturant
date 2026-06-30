import { createClient } from '@supabase/supabase-js';

// ดึงการตั้งค่าจาก Environment Variables หรือ LocalStorage (สำหรับให้กรอกหน้าเว็บได้ง่ายๆ)
const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey) {
    return { url: envUrl, key: envKey };
  }

  // หากไม่มีใน env ให้ลองดึงจาก localStorage
  const localUrl = localStorage.getItem('supabase_url');
  const localKey = localStorage.getItem('supabase_anon_key');

  return { url: localUrl || '', key: localKey || '' };
};

const config = getSupabaseConfig();

export const hasSupabaseConfig = () => {
  return config.url !== '' && config.key !== '';
};

// สร้าง Client หากมีการกำหนดค่าเรียบร้อย
export const supabase = hasSupabaseConfig()
  ? createClient(config.url, config.key)
  : null;

// ฟังก์ชันบันทึกการตั้งค่าลง LocalStorage (สำหรับใช้ใน Setup Modal)
export const saveSupabaseConfig = (url, key) => {
  localStorage.setItem('supabase_url', url);
  localStorage.setItem('supabase_anon_key', key);
  window.location.reload();
};

// ฟังก์ชันล้างการตั้งค่า
export const clearSupabaseConfig = () => {
  localStorage.removeItem('supabase_url');
  localStorage.removeItem('supabase_anon_key');
  window.location.reload();
};
