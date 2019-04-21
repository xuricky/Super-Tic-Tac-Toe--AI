import * as React from 'react';
import { Icon } from 'antd';
const PlayerCSS = require('../ui/css/player.css');


export class Player extends React.Component {
    
    render() {
        return (
            <div className={PlayerCSS.player}>
                <Icon type="step-backward" />
                <Icon type={true ? 'caret-right' : "pause"} />
                <Icon type="step-forward" />
            </div>
        )
    }
}