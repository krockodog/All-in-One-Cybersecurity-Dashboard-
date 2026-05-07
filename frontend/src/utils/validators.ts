import { TargetType } from "@/types";

const patterns: Record<TargetType, RegExp> = {
  domain: /^(?!-)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,63}$/,
  ip: /^(?:\d{1,3}\.){3}\d{1,3}$/,
  cidr: /^(?:\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/,
  url: /^https?:\/\/.+/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  username: /^[\w.-]{3,64}$/,
  phone: /^\+?[\d\s-]{6,22}$/,
  address: /^.{6,255}$/
};

export const isValidTarget = (type: TargetType, value: string) => patterns[type].test(value.trim());
