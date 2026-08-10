// src/utils/date.ts

export const toDateTimeLocal = (value?: string | null): string => {
  if (!value) return "";

  const date = new Date(value);
  if (isNaN(date.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const toBackendDateTime = (value?: string | null): string | null => {
  if (!value) return null;

  const date = new Date(value);
  if (isNaN(date.getTime())) return null;

  // Convert to MySQL-friendly format: YYYY-MM-DD HH:MM:SS
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
};
