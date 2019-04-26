import { LocalBoard, sucArr, Type, State, VirtualData } from './localboard';
import { SquareState } from '../components/square';
import {History, Storage, KEY} from './storage';
import { Model } from '../index';

export interface StorageData {
    id: number[],
    isAI: boolean,
}

interface GlobalData {
    AIIsNext: boolean,
    data: number[][],
    masks: boolean[];
    lastMove: number[];
}

export interface HistoryData {
    global: VirtualData[],
    globalData: GlobalData,
    state: State
}

export class GlobalBoard {
    static INSTANCE: GlobalBoard = new GlobalBoard();
    static getInstance() {
        return this.INSTANCE;
    }
    static timeCount: number = 0;
    private global: LocalBoard[] = [];
    private historyData: HistoryData[] = [];
    private globalData: GlobalData;
    private state: State = State.active;
    private utttState: SquareState[][] = [];
    private backMove: number[] = [];
    private storagedata: StorageData[] = [];
    constructor() {
        this.globalData = {
            AIIsNext: false,
            data: [],
            masks: Array(9).fill(true),
            lastMove: [],
        };
        this.clearData();
    }

    private _init() {
        let global = [];
        for (let i = 0; i < 9; i++) {
            let local = new LocalBoard(i);
            global.push(local);
        }
        return global;
    }

    private _initGlobalData() {
        let data = [];
        for (let local of this.global) {
            data.push(local.getVirtualData().data);
        }
        this.globalData = {
            AIIsNext: false,
            data,
            masks: Array(9).fill(true),
            lastMove: [],
        };
        this.historyData = [];
        this.storagedata = [];
        this.backMove = [];
        this.state = State.active;
        this.utttState = this._transferGlobalToUtttState();
    }

    public initStartData() {
        this.globalData.masks = Array(9).fill(false);
    }

    public clearData() {
        this.global = this._init();
        this._initGlobalData();
    }

    public getGlobalData() {
        return this.globalData;
    }

    public getUtttState() {
        return this.utttState;
    }

    public setGlobalData(globalData: GlobalData) {
        this.globalData = globalData;
    }

    public getGlobal() {
        return this.global;
    }

    // public getState() {
    //     return this.state;
    // }

    private stashHistoryData() {
        let global = [];
        let globalData = JSON.parse(JSON.stringify(this.globalData));
        for (let local of this.global) {
            global.push(local.deepCloneVirtualData()); 
        }
        let state = this.state;
        this.historyData.push({global, globalData, state});
    }

    private stashStorageData(id: number[], isAI: boolean) {
        this.storagedata.push({id, isAI});
    }

    public pushData(id: number[], isAI: boolean) {
        this.stashHistoryData();
        this.stashStorageData(id, isAI);
        this.global[id[0]].pushData(id[1], isAI);
        this.globalData.AIIsNext = !this.globalData.AIIsNext;
        this.globalData.lastMove = id;
        this._transferGlobalToGlobalData();
        this._handleNextStepData(id);
        this.state = this.getState();
        if (this.backMove.length > 0) {
            if (this.backMove[0] !== id[0] && this.backMove[1] !== id[1]) {
                this.globalData.data[this.backMove[0]][this.backMove[1]] = 0;
            }
            this.backMove = [];
        }
        this.utttState = this._transferGlobalToUtttState();
        // console.log(this.getAvailablePos(id));
    }

    private _handleNextStepData(id: number[]) {
        let local = this.global[id[1]];
        if (local.getVirtualData().isActive) {
            this.globalData.masks = this.globalData.masks.map(((mask, i) => i !== id[1] && (mask = true)));
        }
    }

    private _transferGlobalToGlobalData() {
        let data = [];
        let masks = [];
        for (let local of this.global) {
            data.push(local.getVirtualData().data);
            masks.push(!local.getVirtualData().isActive);
        }
        this.globalData.data = data;
        this.globalData.masks = masks;
    }

    /**
     * @description 悔棋，返回第step步
     * @param step 步数
     */
    public resetGlobal(step: number) {
        let len = this.historyData.length;
        if (len <= 0) {
            this.initStartData();
        } else if (step < len) {
            let leftDatas = this.historyData.splice(step, len);
            this.storagedata.splice(step, len);
            for (let i = 0; i < this.global.length; i++) {
                let local = this.global[i];
                local.setVirtualData(leftDatas[0].global[i]);
            }
            this.backMove = leftDatas.length > 1 ? leftDatas[1].globalData.lastMove : this.globalData.lastMove;
            this.setGlobalData(leftDatas[0].globalData);
            this.state = leftDatas[0].state;
            this.utttState = this._transferGlobalToUtttState();
        }
    }

    public deleteLastData() {
        this.resetGlobal(this.historyData.length - 1);
    }

    /**
     * @description 悔棋，默认退两步
     */
    public popGlobal() {
        this.resetGlobal(this.historyData.length - 2);
    }

    public getState(): State {
        let state = State.active;
        let notDraw = false;
        for (let arr of sucArr) {
            let locals = [this.global[arr[0]], this.global[arr[1]], this.global[arr[2]]];
            if (locals.find(local => local.getVirtualData().state === State.draw) ||
                locals.some(local => local.getVirtualData().state === State.ai_win && 
                locals.some(local => local.getVirtualData().state === State.human_win))) {
                continue;
            } else if (locals.every(local => local.getVirtualData().state === State.ai_win)) {
                notDraw = true;
                state = State.ai_win;
                break;
            } else if (locals.every(local => local.getVirtualData().state === State.human_win)) {
                notDraw = true;
                state = State.human_win;
                break;
            } else {
                notDraw = true;
            }
        }
        if (!notDraw) {
            state = State.draw;
        }
        return state;
    }

    public getAvailablePos(id: number[]) {
        let availablePos: number[][] = [];
        let local = this.global[id[1]];
        if (local.getVirtualData().isActive) {
            local.getVirtualData().data.forEach((n, index) => {
                n === null && availablePos.push([id[1], index]);
            });
        } else {
            for (let i = 0; i < this.global.length; i++) {
                let local = this.global[i];
                if (local.getVirtualData().isActive) {
                    local.getVirtualData().data.forEach((n, index) => {
                        n === null && availablePos.push([i, index]);
                    });
                }
            }
        }
        return availablePos;
    }

    _transferGlobalToUtttState() {
        let data = this.globalData.data;
        let utttState: SquareState[][] = [];
        for (let _data of data) {
            let states = _data.map((d) => {
                return d === Type.AI ? SquareState.AI : d === Type.HUMAN ? SquareState.Human : SquareState.default;
            });
            utttState.push(states);
        }
        if (this.globalData.lastMove.length > 0) {
            utttState[this.globalData.lastMove[0]][this.globalData.lastMove[1]] = SquareState.lastMove;
        }
        if (this.backMove.length > 0) {
            utttState[this.backMove[0]][this.backMove[1]] = SquareState.back;
            // data[this.backMove[0]][this.backMove[1]] = this.globalData.AIIsNext ? Type.BACKAI : Type.BACKHUMAN;
        }
        return utttState;
    }

    public save(model_message: string, model: Model) {
        let date = new Date();
        let time = `${date.getMonth() + 1}月${date.getDate()}号${date.getHours()}时${date.getMinutes()}分`;
        let historyData: History = {time, state: this.state, data: this.storagedata.slice(), model_message, model}
        Storage.set(KEY, historyData);
    }
}