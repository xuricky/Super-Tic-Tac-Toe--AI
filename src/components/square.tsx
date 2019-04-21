import * as React from 'react';
const squareCss = require('../ui/css/square.css');
import * as ColorOption from '../ui/color/color';
export interface SquareProps{
    handleClick(): void,
    handleMouseEnter(): void,
    text: string,
    squareState: SquareState
}

export enum SquareState {
    back,
    lastMove,
    AI,
    Human,
    default
}

export class Square extends React.Component<SquareProps> {
    private config: any;
    constructor(props: SquareProps) {
        super(props);
        this.config = {
            [SquareState.back]: {color: ColorOption.backColor, background: ColorOption.backgroundColor},
            [SquareState.lastMove]: {color: ColorOption.lastMoveColor},
            [SquareState.AI]: {color: ColorOption.AIColor},
            [SquareState.Human]: {color: ColorOption.HumanColor},
            [SquareState.default]: {color: ColorOption.defaultColor}
        }
    }

    render() {
        return (
            <button onClick={this.props.handleClick.bind(this)}
                    onMouseEnter={this.props.handleMouseEnter.bind(this)}
                    className={`${squareCss.button}`}
                    style={this.config[this.props.squareState]}>
                    {this.props.text}
                    
            </button>
        )
    }
}