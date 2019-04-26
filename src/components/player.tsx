import * as React from 'react';
import { Icon, Button } from 'antd';
const PlayerCSS = require('../ui/css/player.css');

interface PlayerPorps{
    getout(): void;
    back(): void;
    next(): void;
    play(): void;
    pause(): void;
    intoplay(): void;
    playing: boolean;
}

export class Player extends React.Component<PlayerPorps> {
    public state: {
        playing: boolean;
    }
    constructor(props: PlayerPorps) {
        super(props);
        this.state = {
            playing: this.props.playing,
        }
    }
    render() {
        return (
            <div className={PlayerCSS.player}>
                <Icon type="step-backward" onClick={this.props.back}/>
                <Icon type={this.state.playing ? "pause" : 'caret-right'} onClick={this.state.playing ? this.props.pause : this.props.play}/>
                <Icon type="step-forward" onClick={this.props.next}/>
                <Button type='primary' onClick={this.props.intoplay} className={PlayerCSS.exit}>下棋</Button>
                <Button type='primary' onClick={this.props.getout} className={PlayerCSS.exit}>退出</Button>
            </div>
        )
    }

    componentWillReceiveProps(nextProps: PlayerPorps) {
        this.setState({
            playing: nextProps.playing,
        })
    }
}