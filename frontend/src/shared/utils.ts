import { COLORS } from './constants';

export const getColors = (theme: 'light' | 'dark') => COLORS[theme];

export const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  return `${hours}:${minutes}:${seconds}`;
};

export const processContentLinks = (content: string): string => {
  return content.replace(/https?:\/\/[^\s)]+/gi, (match) => `🔗 ${match}`);
};
