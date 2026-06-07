import type { DayboardApi } from './dayboard-api';

declare global {
  interface Window {
    dayboard: DayboardApi;
  }
}

export {};
