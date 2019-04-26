import { StorageData } from './globalboard';
import { State } from './localboard';
export interface History {
    data: StorageData[],
    state: State,
    time: string,
    model_message: string,
}

export const KEY = 'LOVEXLL';
const maxStack: number = 100;

export class Storage {
    static valid() {
        if (!window.localStorage) {
            alert('浏览器不支持缓存');
            return false;
        }
        return true;
    }

    static set(key: string, value: History) {
        if (Storage.has(key)) {
            let data = Storage.get(key);
            data.push(value);
            data.length > maxStack && data.shift();
            let _data = JSON.stringify(data);
            localStorage.setItem(key, _data);
        } else {
            let _data = JSON.stringify([value]);
            localStorage.setItem(key, _data);
        }
    }

    static get(key: string) {
        if (Storage.has(key)) {
            let data = localStorage.getItem(key);
            if (data)
                return JSON.parse(data);
        }
        return null;
    }

    static remove(key: string) {
        localStorage.removeItem(key);
        return Storage;
    }

    static clear() {
        localStorage.clear();
    }

    static has(key: string) {
        return Object.keys(localStorage).includes(key);
    }
}