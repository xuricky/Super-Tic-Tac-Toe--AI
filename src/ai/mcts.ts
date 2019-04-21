import { GlobalBoard } from '../common/globalboard';
import { State, Type } from '../common/localboard';
import { sucArr } from '../common/localboard';

export class MctsNode {
    // 父节点
    public parent: MctsNode | null;
    // 是不是AI下
    public isAITurn: boolean;
    // 移动点坐标
    public move: number[];
    // 胜利次数
    public hits: number = 0;
    // 失败次数
    public misses: number = 0;
    // 尝试次数
    public totaltrials: number = 0;
    // 未探索节点
    public unexplored: number = 0;
    // 子节点
    public children: MctsNode[] = [];
    // 棋盘数据
    private board: number[][]

    constructor(parent: MctsNode | null, isAITurn: boolean, move: number[]) {
        this.parent = parent;
        this.isAITurn = isAITurn;
        this.move = move;
        this.board = this.getGB().getGlobalData().data;
    }

    // 获取最佳节点的移动点坐标
    public getBestMove(time: number = 0.5) {
        const now = new Date().getTime();
        let boardState = this._getBoardState(this.board);
        while(new Date().getTime() - now < 1e3 * time) {
            for (let i = 0; i < 1000; i++) {
                const now_ = new Date().getTime();
                this.createChildren(this.board, boardState, this.move);
                GlobalBoard.timeCount += (new Date().getTime() - now_) / 1000;
            }
            console.log((new Date().getTime() - now) / 1000);
        }
        let node = this._findMostTriedChild();
        return node && node.move;
    }

    // 获取全局棋盘
    public getGB() {
        return GlobalBoard.getInstance();
    }

    // 创建子节点
    public createChildren(board: number[][], boardState: State[], move: number[]) {
        board = this._deepClone(board);
        boardState = this._deepClone(boardState);
        let state = this._getState(boardState);
        if (state !== State.active) {
            this._MCTSSimulate(this, board, boardState);
        }
        let availablePos = this._getAvailablePos(board, boardState, move);
        if (this.children.length === 0) {
            for (let pos of availablePos) {
                let newMctsNode = new MctsNode(this, !this.isAITurn, pos);
                this.children.push(newMctsNode);
            }
            this.unexplored = this.children.length;
        }
        // 临时解决报错
        if (this.children.length === 0) return;
        if (this.unexplored > 0) {
            this.unexplored--;
            let unexploredChildren = this._shuffle(this.children.filter((node) => node.totaltrials === 0));
            let node = unexploredChildren[0];
            let state = this._MCTSSimulate(node, board, boardState);
            this._updateInfo(node, state)
        } else {
            this.children = this._shuffle(this.children).sort((c1, c2) => this._getNodePotential(c2) - this._getNodePotential(c1));
            let betterPotentialChild = this.children[0];
            let move = betterPotentialChild.move;
            let value = betterPotentialChild.isAITurn ? Type.AI : Type.HUMAN;
            board[move[0]][move[1]] = value;
            boardState[move[0]] = this._getLocalBoardState(board[move[0]]);
            betterPotentialChild.createChildren(board, boardState, move);
        }
    }

    // 打乱数组顺序
    private _shuffle(arr: any[]) {
        for (let i = arr.length, j; i; i--, j = Math.floor(Math.random() * i), arr.length - 1, [arr[i], arr[j]] = [arr[j], arr[i]]);
        return arr;
    }

    // 模拟胜负
    private _MCTSSimulate(node: MctsNode, board: number[][], boardState: State[]): State {
        let isAI = node.isAITurn;
        let move = node.move;
        let value = isAI ? Type.AI : Type.HUMAN;
        board[move[0]][move[1]] = value;
        boardState[move[0]] = this._getLocalBoardState(board[move[0]]);
        let state = this._getState(boardState);
        if (state === State.active) {
            let availablePos = this._getAvailablePos(board, boardState, move);
            // 临时解决报错
            if (availablePos.length === 0) return state;
            let pos = this._shuffle(availablePos)[0];
            let newNode = new MctsNode(node, !isAI, pos);
            return this._MCTSSimulate(newNode, board, boardState);
        }
        return state;
    }

    // 更新节点以及所有父节点信息
    private _updateInfo(node: MctsNode, state: State): void{
        let isAI = node.isAITurn;
        if (state === State.ai_win) {
            if (isAI) 
                node.hits++;
            else 
                node.misses++;
        } else if (state === State.human_win) {
            if (!isAI)
                node.hits++;
            else 
                node.misses++;
        }
        node.totaltrials++;
        if (node.parent) 
            node.parent._updateInfo(node.parent, state);
    }

    // 获取每个节点的性价比
    private _getNodePotential(node: MctsNode) {
        let w = node.hits - node.misses;
        let n = node.totaltrials;
        let t = node.parent ? node.parent.totaltrials : 0;
        const c = Math.sqrt(2);
        return w / n + c * Math.sqrt(Math.log(t) / n);
    }
    

    // 找到尝试次数最多的点，也是最佳点
    private _findMostTriedChild() {
        if (!this.children) 
            return null;
        else 
            return this.children.sort((c1, c2) => c2.totaltrials - c1.totaltrials)[0];
    }

    _getAvailablePos(board: number[][], boardState: State[], move: number[]): number[][] {
        let availablePos: number[][] = [];
        let index = move[1];
        if (boardState[index] === State.active || boardState[index] === State.draw && board[index].find((b) => b !== Type.AI && b !== Type.HUMAN)) {
            board[index].forEach((n, i) => {
                if (n !== Type.AI && n !== Type.HUMAN) {
                    availablePos.push([index, i]);
                }
            }) 
        } else {
            boardState.forEach((bs, i1) => {
                if (bs === State.active || boardState[index] === State.draw && board[i1].find((b) => b !== Type.AI && b !== Type.HUMAN)) {
                    board[i1].forEach((n, i2) => {
                        if (n !== Type.AI && n !== Type.HUMAN) {
                            availablePos.push([i1, i2]);
                        }
                    }) 
                }
            })
        }
        return availablePos;
    }

    _getLocalBoardState(localboard: number[]) {
        let draw = true;
        for (let s of sucArr) {
            let b1 = localboard[s[0]];
            let b2 = localboard[s[1]];
            let b3 = localboard[s[2]];
            if (b1 === b2 && b2 === b3) {
                if (b1 === Type.AI) {
                    return State.ai_win;
                } else if (b1 === Type.HUMAN) {
                    return State.human_win;
                }
            }
            if (![b1, b2, b3].includes(Type.AI) || ![b1, b2, b3].includes(Type.HUMAN)) {
                draw = false;
            }
        }
        return draw ? State.draw : State.active;
    }

    _getBoardState(board: number[][]): State[] {
        return board.map(b => this._getLocalBoardState(b));
    }

    _getState(boardState: State[]): State {
        let draw = true;
        for (let s of sucArr) {
            let b1 = boardState[s[0]];
            let b2 = boardState[s[1]];
            let b3 = boardState[s[2]];
            if (b1 === b2 && b2 === b3) {
                if (b1 === State.ai_win) {
                    return State.ai_win;
                } else if (b1 === State.human_win) {
                    return State.human_win;
                }
            }
            if (!([b1, b2, b3].includes(State.ai_win) && [b1, b2, b3].includes(State.human_win) || [b1, b2, b3].includes(State.draw))) {
                draw = false;
            }
        }
        return draw ? State.draw : State.active;
    }

    _deepClone(origin: any) {
        return JSON.parse(JSON.stringify(origin));
    }
}