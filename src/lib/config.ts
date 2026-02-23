/**
 * Odoo API-ийн суурь URL.
 * Local: .env.local дээр NEXT_PUBLIC_ODOO_BASE_URL=http://localhost:4444/
 * Production: .env.production эсвэл host env дээр NEXT_PUBLIC_ODOO_BASE_URL=https://erp.ayanhotelsmongolia.com/
 */
const DEFAULT_ODOO_URL = 'https://erp.ayanhotelsmongolia.com/';

export function getOdooBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_ODOO_BASE_URL || DEFAULT_ODOO_URL;
  return url.replace(/\/+$/, '');
}
