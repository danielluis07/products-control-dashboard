import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatBarcode = (value: string) => {
  let formatted = value.replace(/\D/g, "");

  formatted = formatted.slice(0, 14);

  return formatted;
};
