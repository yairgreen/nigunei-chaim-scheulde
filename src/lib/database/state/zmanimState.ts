
import type { ZmanimData } from '../types/zmanimTypes';

// In-memory storage
let zmanimDatabase: ZmanimData[] = [];

export const getZmanimDatabase = (): ZmanimData[] => {
  return zmanimDatabase;
};

export const setZmanimDatabase = (data: ZmanimData[]): void => {
  zmanimDatabase = data;
};

export const updateZmanimEntry = (data: ZmanimData): void => {
  const existingIdx = zmanimDatabase.findIndex(item => item.date === data.date);
  if (existingIdx >= 0) {
    zmanimDatabase[existingIdx] = data;
  } else {
    zmanimDatabase.push(data);
  }
};

