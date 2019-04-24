import * as React from 'react';
import { Interface } from 'readline';
import { State } from '../common/localboard';
import { Button, message } from 'antd';
const GameInfoCss = require('../ui/css/gameinfo.css');
import 'antd/lib/button/style/css';

export enum Model {
    HUMAN_AI,
    HUMAN_HUMAN
}
export interface GameInfoProps {
    handleGameStart(): void;
    handleGameOver(): void;
    handleBack(): void;
    handleSave(): void;
    gameStart: boolean;
    winner: State
}

export class GameInfo extends React.Component<GameInfoProps> {
    constructor(props: GameInfoProps) {
        super(props);
    }

    render() {
        return (
            <div>
                <div className={GameInfoCss.gameinfo}>
                    <Button type='primary'
                        onClick={this.props.gameStart ? this.props.handleGameStart : this.props.handleGameOver}>
                        {this.props.gameStart ? '开始' : '结束'}
                    </Button>
                    <Button type='primary'
                            onClick={this.props.handleBack}
                            disabled={this.props.winner !== State.active}>
                        悔棋
                    </Button>
                    {/* <Button type='primary'
                            onClick={this.props.changeModel}
                            disabled={!this.props.gameStart}>
                        {this.props.ModelIsHumanVsAi ? '人机' : '人人'}
                    </Button> */}
                    <Button type='primary'
                            onClick={this.props.handleSave}>
                        保存
                    </Button>
                </div>
                <div className={GameInfoCss.gameinfo}>
                    {/* {this.props.winner === State.ai_win? 'GAME OVER, WINNER IS AI!' 
                    : this.props.winner === State.human_win ? 'Game Over, WINNER IS HUMAN!'
                    : this.props.winner === State.draw ? '平局'
                    : null} */}
                    {this.props.winner !== State.active && this.renderWinnerInfo(this.props.winner)}
                </div>
            </div>
        )
    }

    renderWinnerInfo(state: State) {
        let info = state === State.ai_win ? 'GAME OVER, WINNER IS AI!' : state === State.human_win ? 'Game Over, WINNER IS HUMAN!' : '平局';
        message.success(info, 10);
    }
}