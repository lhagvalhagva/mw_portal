// lib/utils.ts

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Энэ функцийг нэмэх/шинэчлэх
export function getOdooImage(base64String: any) {
  // 1. Хэрэв өгөгдөл байхгүй эсвэл 'false' (boolean) ирсэн бол null буцаана
  if (!base64String || typeof base64String !== 'string') {
    return null;
  }

  // 2. Шинэ мөр болон зайг цэвэрлэх
  const cleanString = base64String.replace(/[\r\n\s]+/g, '');

  // 3. Хэрэв аль хэдийн prefix-тэй бол шууд буцаана
  if (cleanString.startsWith('data:image')) {
    return cleanString;
  }

  // 4. Prefix залгаж буцаана
  return `data:image/png;base64,${cleanString}`;
}