import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STORAGE_KEY = 'khala_el_eyal_data';

export const loadData = <T,>(key: string, defaultValue: T): T => {
  const saved = localStorage.getItem(key);
  if (!saved) return defaultValue;
  try {
    return JSON.parse(saved);
  } catch {
    return defaultValue;
  }
};

export const saveData = <T,>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};
