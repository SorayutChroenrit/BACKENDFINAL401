"use client";
export function getCookie(name: string): string | null {
  if (typeof document !== "undefined") {
    const cookies = `; ${document.cookie}`;
    const parts = cookies.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  }
  return null;
}
