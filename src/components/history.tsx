import * as React from 'react';
const HistoryCss = require('../ui/css/history.css');
import { Drawer, List, Icon, Pagination, Divider } from 'antd';
import {History as HistoryData, KEY, Storage} from '../common/storage';
import { State } from '../common/localboard';
import 'antd/lib/drawer/style/css';
import 'antd/lib/pagination/style/css';

interface HistoryProps {
    handlePlay(index: number): void,
    handleDeleteHistory(): void;
    visible: boolean,
    data: HistoryData[],
}


export class History extends React.Component<HistoryProps> {
    public state: {
        visible: boolean,
        defaultPageSize: number,
        current: number
    };
    constructor(props: HistoryProps) {
        super(props);
        this.state = {
            visible: this.props.visible,
            defaultPageSize: 20,
            current: 1
        }
    }

    render() {
        return (
            <div>
                <Drawer title='历史记录'
                        placement='right'
                        closable={false}
                        onClose={this.onClose.bind(this)}
                        visible={this.state.visible}
                        width='350px'
                        >
                        {this.renderdata()}
                        <Pagination defaultPageSize={this.state.defaultPageSize}
                                    defaultCurrent={this.state.current}
                                    showQuickJumper
                                    size='small'
                                    showSizeChanger 
                                    // hideOnSinglePage={true}
                                    total={this.props.data ? this.props.data.length : 0}
                                    onChange={this.changepage.bind(this)}
                                    onShowSizeChange={this.changeSize.bind(this)}
                                    className={HistoryCss.page}></Pagination>
                </Drawer>
                
            </div>
        )
    }
    
    renderdata() {
        let data = this.props.data;
        if (!data) return;
        let page = this.state.current;
        let pagesize = this.state.defaultPageSize;
        return data.slice((page - 1) * pagesize, page * pagesize).map((_data, index) => {
            let state = _data.state === State.ai_win ? 'AI WIN' :
            _data.state === State.human_win ? 'HUMAN WIN' :
            _data.state === State.draw ? '平局' : '未结束对局';
            return (<div key={index} className={HistoryCss.item}>
                <span className={HistoryCss.itemtext}>{`${(page - 1) * pagesize + index + 1}.${_data.time}-${state}`}</span>
                <Icon className={HistoryCss.icon} type='close' onClick={() => this.handleDelete.call(this, (page - 1) * pagesize + index)}></Icon>
                <Icon className={HistoryCss.icon} type='play-circle' onClick={() => this.props.handlePlay((page - 1) * pagesize + index)}></Icon>
            </div>)
        })
    }

    private onClose() {
        this.setState({
            visible: false,
        })
    }

    private changepage(page: number, pagesize: number | undefined) {
        this.setState({
            defaultPageSize: pagesize,
            current: page
        })
    }

    private changeSize(current: number, size: number) {
        this.setState({
            defaultPageSize: size,
            current: current
        })
    }

    private handleDelete(index: number) {
        let data = Storage.get(KEY);
        if (data) data.splice(index, 1);
        Storage.remove(KEY);
        data.forEach((_data: HistoryData) => Storage.set(KEY, _data))
    }
}

