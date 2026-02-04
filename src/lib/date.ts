/**
 * Одоогийн цагийг Odoo-ийн datetime (YYYY-MM-DD HH:mm:ss) форматад оруулна.
 * Local timezone ашиглана (Odoo сервер local timezone ашигладаг).
 */
export const formatOdooDatetime = (date: Date): string => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    
    // Local timezone цагийг ашиглах
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };