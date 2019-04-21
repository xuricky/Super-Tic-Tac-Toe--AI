
export const sucArr = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
];

export enum Type {
    AI = 1,
    HUMAN = -1,
    BACKAI = 2,
    BACKHUMAN = -2,
}

export enum State {
    ai_win,
    human_win,
    draw,
    active,
}

export interface VirtualData {
    isActive: boolean,
    data: number[],
    state: State,
}

export class LocalBoard {
    /**
     * @description 坐标值
     */
    private id: number;
    private virtualData: VirtualData;
    constructor(id: number) {
        this.id = id;
        this.virtualData = {
            isActive: true,
            data: Array(9).fill(null),
            state: State.active,
        }
    }
    
    /**
     * @description 获取坐标值
     */
    public getId() {
        return this.id;
    }

    /**
     * @description 单步下棋
     * @param index 棋子id
     * @param isAI 是否是AI
     */
    public pushData(index: number, isAI: boolean) {
        let virtualData = this.virtualData;
        if (virtualData.data[index]) return; 
        virtualData.data[index] = isAI ? Type.AI : Type.HUMAN;
        let state = this._getState(this.virtualData.data);
        virtualData.state = state;
        state !== State.active && (virtualData.isActive = false);
    }

    public getVirtualData() {
        return this.virtualData;
    }

    /**
     * @description 深克隆
     */
    public deepCloneVirtualData(): VirtualData {
        return JSON.parse(JSON.stringify(this.virtualData));
    }

    public setVirtualData(data: VirtualData) {
        this.virtualData = data;
    }

    /**
     * @description 获取棋盘的分数和状态
     * @param data 棋盘数据
     */
    private _getState(data: number[]): State {
        let state = State.active;
        let notDraw = false;
        for (let arr of sucArr) {
            let dataArr = [data[arr[0]], data[arr[1]], data[arr[2]]];
            if (dataArr.every(n => n === Type.AI)) {
                state = State.ai_win;
                break;
            } else if (dataArr.every(n => n === Type.HUMAN)) {
                state = State.human_win;
                break;
            } else if (!dataArr.some(n => n === Type.AI) || !dataArr.some(n => n === Type.HUMAN)) {
                notDraw = true;
            }
        }
        if (state === State.active && !notDraw) {
            state = State.draw;
        }
        return state;
    }
}