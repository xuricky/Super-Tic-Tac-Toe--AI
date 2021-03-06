import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Layout, Menu, Icon, Button, message, Alert, Modal } from 'antd';
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
import 'antd/lib/modal/style/css';
import { Rule } from './components/rule';
import { Help } from './components/help';
import { GlobalBoard } from './common/globalboard';

const { Header, Sider, Content } = Layout;
const SubMenu = Menu.SubMenu;

export enum Model {
  P2P,
  ai_easy,
  ai_medium,
  ai_hard
}

const ModelMessage = {
  P2P : '人人',
  ai_easy : '人机(简单的)',
  ai_medium : "人机(中等的)",
  ai_hard : "人机(困难的)"
}

export class App extends React.Component {

  public state: {
    collapsed: boolean,
    visible: boolean,
    autoplay: boolean,
    model: Model,
    historydata: HistoryData | null,
    rule_visible: boolean,
    help_visible: boolean,
    model_message: string,
  }
  constructor(props: any) {
    super(props);
    this.state = {
      collapsed: false,
      visible: false,
      autoplay: false,
      model: Model.P2P,
      historydata: null,
      rule_visible: false,
      help_visible: false,
      model_message: ModelMessage.P2P,
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
            <Menu.Item key="1" onClick={() => this._openRule()}>
              <Icon type="solution" />
              <span>规则</span>
            </Menu.Item>
            <SubMenu key='2' title={<span><Icon type='user' /><span>对抗模式</span></span>}>
                <Menu.Item key='2-1' onClick={() => this.selectModel(Model.P2P)}>
                    <Icon type='user' />
                    <span>人人对战</span>
                </Menu.Item>
                <SubMenu key='2-2' title={<span><Icon type='android'></Icon><span>人机对战</span></span>}>
                    <Menu.Item key='2-2-1' onClick={() => this.selectModel(Model.ai_easy)}>简单</Menu.Item>
                    <Menu.Item key='2-2-2' onClick={() => this.selectModel(Model.ai_medium)}>中等</Menu.Item>
                    <Menu.Item key='2-2-3' onClick={() => this.selectModel(Model.ai_hard)}>困难</Menu.Item>
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
                            model_message={this.state.model_message}
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
            <Rule visible={this.state.rule_visible}
                  handleRuleOK={() => this._closeRule()}
                  handleRuleCancel={() => this._closeRule()} />
            <Help visible={this.state.help_visible}
                  handleHelpOK={() => this._closeHelp()}
                  handleHelpCancel={() => this._closeHelp()} />
          </Content>
        </Layout>
      </Layout>
    );
  }

  private selectModel(model: number) {
    if (this.state.model !== model) {
      let model_message;
      if (model === Model.P2P) {
        model_message = ModelMessage.P2P;
      } else if (model === Model.ai_easy) {
        model_message = ModelMessage.ai_easy;
      } else if (model === Model.ai_medium) {
        model_message = ModelMessage.ai_medium;
      } else if (model === Model.ai_hard) {
        model_message = ModelMessage.ai_hard;
      }
      this.setState({
        model,
        model_message,
        historydata: null,
      })
    }
  }

  private _openRule() {
      this.setState({
        rule_visible: true,
      })
  }

  private _closeRule() {
    this.setState({
      rule_visible: false,
    })
  }

  private _openHelp() {
    this.setState({
      help_visible: true,
    })
  }

  private _closeHelp() {
    this.setState({
      help_visible: false,
    })
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
    GlobalBoard.getInstance().clearData();
    let historydata = Storage.get(KEY)[index];
    this.setState({
      autoplay: true,
      visible: false,
      historydata,
      gb: GlobalBoard.getInstance(),
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