
import type { ZmanimData } from '../types/zmanim';

let zmanimDatabase: ZmanimData[] = [];

export const setZmanimDatabase = (data: ZmanimData[]) => {
  zmanimDatabase = data;
};

export const getZmanimFromMemory = (): ZmanimData[] => {
  return zmanimDatabase;
};
