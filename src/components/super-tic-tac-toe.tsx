import * as React from 'react';
import { TicTacToe } from './tic-tac-toe';
const SuperTicTacToeCss = require('../ui/css/super-tic-tac-toe.css');
import { GameInfo } from './gameInfo';
import { GlobalBoard } from '../common/globalboard';
import { Type, State } from '../common/localboard';
import { MctsNode } from '../ai/mcts';
import { Storage } from '../common/storage';
import { message } from 'antd';
import * as ReactDOM from 'react-dom';
import 'antd/lib/style/css';
import { Player } from './player';
import { Model } from '../index';

interface SuperTicTacToeProps {
    [propname: string]: any;
    autoplay: boolean;
    model: Model;
}

interface SuperTicTacToeState{
    gb: GlobalBoard;
    gameStart: boolean;
    config: any;
    endGame: boolean;
    ModelIsHumanVsAi: boolean;
    lastMove: number[];
    update: boolean;
    winner: State
}

export class SuperTicTacToe extends React.Component<SuperTicTacToeProps, SuperTicTacToeState> {
    private gb: GlobalBoard;
    constructor(props: SuperTicTacToeProps) {
        super(props);
        this.gb = GlobalBoard.getInstance();
        this.state = {
            gb: this.gb,
            gameStart: true,
            config: {
                [Type.HUMAN]: 'X',
                [Type.AI]: 'O'
            },
            endGame: false,
            ModelIsHumanVsAi: true,
            lastMove: [-1, -1],
            update: false,
            winner: State.active,
        }
    }

    render() {
        const gb = this.state.gb;
        return (
            <div>
                <div className={SuperTicTacToeCss.title}>{`Next Turn to ${gb.getGlobalData().AIIsNext ? this.state.config[Type.AI] : this.state.config[Type.HUMAN]}`}</div>
                <div className={SuperTicTacToeCss['global-board']}>
                    <div className={SuperTicTacToeCss['local-board']}>
                        {this._renderTicTacToe(0)}
                        {this._renderTicTacToe(1)}
                        {this._renderTicTacToe(2)}
                    </div>
                    <div className={SuperTicTacToeCss['local-board']}>
                        {this._renderTicTacToe(3)}
                        {this._renderTicTacToe(4)}
                        {this._renderTicTacToe(5)}
                    </div>
                    <div className={SuperTicTacToeCss['local-board']}>
                        {this._renderTicTacToe(6)}
                        {this._renderTicTacToe(7)}
                        {this._renderTicTacToe(8)}
                    </div>
                </div>
                {this.props.autoplay ? <Player></Player> : <GameInfo handleGameStart={() => this._handleGameStart()}
                          handleGameOver={() => this._handleGameOver()}
                          handleBack={() => this._handleBack()}
                          handleSave={() => this._handleSave()}
                          changeModel = {() => this._changeModel()}
                          gameStart={this.state.gameStart}
                          ModelIsHumanVsAi={this.state.ModelIsHumanVsAi}
                          winner={this.state.winner}></GameInfo>}
            </div>
        )
    }

    _renderTicTacToe(i: number) {
        const gb = this.state.gb;
        let gbData = gb.getGlobalData();
        let data = gbData.data[i];
        let textData = data.map(d => d === Type.AI || d === Type.BACKAI ? this.state.config[Type.AI] :
                                    d === Type.HUMAN || d === Type.BACKHUMAN ? this.state.config[Type.HUMAN] : null);
        let global = gb.getGlobal();
        let virtualData = global[i].getVirtualData();
        return (
            <div className={gbData.masks[i] || this.state.endGame ? SuperTicTacToeCss.mask : SuperTicTacToeCss.nomask}>
                <div className={SuperTicTacToeCss.text}>
                    {virtualData.state === State.ai_win ? this.state.config[Type.AI] :
                    virtualData.state === State.human_win ? this.state.config[Type.HUMAN] : null}
                </div>
                <TicTacToe handleSquareClick={(index: number)=> this._handleClick([i, index], false)}
                            handleSquareMouseEnter={(index: number) => this._handleMouseEnter([i, index])}
                            squareStates = {gb.getUtttState()[i]}
                            texts={textData}>
                </TicTacToe>
            </div>
        )
    }

    _handleClick(id: number[], AITurn: boolean) {
        let gb = this.state.gb;
        let gbData = gb.getGlobalData();
        let data = gbData.data;
        let aiIsNext = gbData.AIIsNext;
        if (!data[id[0]][id[1]]) {
            gb.pushData(id, aiIsNext);
            this.setState({
                gb: this.gb,
                lastMove: id
            });         
        }
    }

    _handleMouseEnter(id: number[]) {
        // console.log(id);
    }

    _handleGameStart(){
        this.gb.initStartData();
        this.setState({
            gb: this.gb,
            gameStart: !this.state.gameStart,
            endGame: false
        });
    }

    _handleGameOver() {
        this.gb.clearData();
        this.setState({
            gb: this.gb,
            gameStart: !this.state.gameStart,
            winner: State.active,
        });
    }

    _handleBack() {
        this.gb.popGlobal();
        this.setState({
            gb: this.gb,
        });
    }
    
    private _changeModel() {
        this.setState({
            ModelIsHumanVsAi: !this.state.ModelIsHumanVsAi
        });
    }

    componentDidUpdate() {
        let gb = this.state.gb;
        let AITurn = gb.getGlobalData().AIIsNext;
        setTimeout(() => {
            if (this.props.model !== Model.P2P && AITurn) {
                let mcts = new MctsNode(null, !AITurn, this.state.lastMove);
                let move = mcts.getBestMove();
                if (move)
                    this._handleClick(move, !AITurn);
            }
            let state_ = gb.getState();
            if (!this.state.endGame && state_ !== null && state_ !== State.active) {
                // alert(`Game over,${state_ === State.ai_win ? 'AI WIN!' : state_ === State.human_win ? 'HUMEN WIN!' : '平局！'}`);
                this.setState({
                    endGame: true,
                    winner: state_,
                });
            }
        }, 0);
    }

    private _handleSave() {
        let gb = this.state.gb;
        message.config({
            top: 100,
            duration: 2,
            maxCount: 3,
        });
        const info = () => {
            message.success('保存成功');
        }
        if (Storage.valid()) {
            gb.save();
            info();
        }
    }
}

