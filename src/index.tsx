import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Layout, Menu, Icon, Button, message, Alert } from 'antd';
import './ui/css/index.css';
import * as serviceWorker from './serviceWorker';
import { SuperTicTacToe } from './components/super-tic-tac-toe';
import { Storage, KEY, History as HistoryData } from './common/storage';
import {History} from './components/history';
import 'antd/lib/layout/style/css';
import 'antd/lib/menu/style/css';
import 'antd/lib/icon/style/css';
import 'antd/lib/button/style/css';
import 'antd/lib/message/style/css';
import { any } from 'prop-types';

const { Header, Sider, Content } = Layout;
const SubMenu = Menu.SubMenu;

export enum Model {
  P2P,
  ai_easy,
  ai_medium,
  ai_hard
}

export class App extends React.Component {

  public state: {
    collapsed: boolean,
    visible: boolean,
    autoplay: boolean,
    model: Model,
    historydata: HistoryData | null,
  }
  constructor(props: any) {
    super(props);
    this.state = {
      collapsed: false,
      visible: false,
      autoplay: false,
      model: Model.P2P,
      historydata: null,
    };
  }

  public toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  render() {
    const historyData = Storage.get(KEY);
    return (
      <Layout className='container'>
        <Sider
          trigger={null}
          collapsible
          collapsed={this.state.collapsed}
        >
          <div className="logo">
            <Icon type='close-circle'></Icon>
          </div>
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['2-1']} defaultOpenKeys={['2']}>
            <Menu.Item key="1" onClick={this._openRule}>
              <Icon type="solution" />
              <span>规则</span>
            </Menu.Item>
            <SubMenu key='2' title={<span><Icon type='user' /><span>对抗模式</span></span>}>
                <Menu.Item key='2-1' onClick={() => this.selectModel('2-1')}>
                    <Icon type='user' />
                    <span>人人对战</span>
                </Menu.Item>
                <SubMenu key='2-2' title={<span><Icon type='android'></Icon><span>人机对战</span></span>}>
                    <Menu.Item key='2-2-1' onClick={() => this.selectModel('2-2-1')}>简单</Menu.Item>
                    <Menu.Item key='2-2-2' onClick={() => this.selectModel('2-2-2')}>中等</Menu.Item>
                    <Menu.Item key='2-2-3' onClick={() => this.selectModel('2-2-3')}>困难</Menu.Item>
                </SubMenu>
            </SubMenu>
            <Menu.Item key="3" onClick={() => this._renderHistory()}>
              <Icon type="profile" />
              <span>比赛记录</span>
            </Menu.Item>
            <Menu.Item key='4' onClick={() => this._openHelp()}>
                <Icon type='question-circle' />
                <span>帮助</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: 0 }}>
            <Icon
              className="trigger"
              type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggle}
            />
          </Header>
          <Content className='content' id='content'>
            <SuperTicTacToe autoplay={this.state.autoplay}
                            model={this.state.model}
                            historydata={this.state.historydata}
                            min={0}
                            max={this.state.historydata ? this.state.historydata.data.length - 1 : 0}/>
            <div className='hostory'>
                <History data={historyData}
                        handlePlay={(index: number) => this._hanlePlayHistory(index)}
                        handleDeleteHistory={() => this._handleDeleteHistory()}
                        handleCloseHistory={() => this.closeHistory()}
                        visible={this.state.visible}>
                </History>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }

  private selectModel(key: string) {
    if (key === '2-1')
      this.state.model = Model.P2P;
    else if (key === '2-2-1')
      this.state.model = Model.ai_easy;
    else if (key === '2-2-2')
     this.state.model = Model.ai_medium;
    else if (key === '2-2-3')
      this.state.model = Model.ai_hard;
    this.setState({
      model: this.state.model,
    })
  }

  private _openRule() {
      
  }


  private _openHelp() {

  }

  private _renderHistory() {
    if (Storage.valid) {
      let data = Storage.get(KEY);
      if (data) {
        this.setState({
          visible: true,
        })
      } else {
        message.info('暂无比赛记录');
      }
    }
  }

  private closeHistory() {
    this.setState({
      visible: false,
      autoplay: false,
    })
  }

  private _hanlePlayHistory(index: number) {
    let historydata = Storage.get(KEY)[index];
    this.setState({
      autoplay: true,
      visible: false,
      historydata,
    })
  }

  private _handleDeleteHistory() {
    console.log('delete');
  }

  private _handleDeleteAllHistory() {
    console.log('delete all');
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
serviceWorker.unregister();