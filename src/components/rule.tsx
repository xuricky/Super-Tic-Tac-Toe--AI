import * as React from 'react';
import { Modal } from 'antd';
import 'antd/lib/modal/style/css';

interface RuleProps {
    visible: boolean,
    handleRuleOK(): void,
    handleRuleCancel(): void,
}

export class Rule extends React.Component<RuleProps> {

    public state: {
        visible: boolean,
    }

    constructor(props: RuleProps) {
        super(props);
        this.state = {
            visible: this.props.visible,
        }
    }

    render() {
        return (
            <Modal title='规则' visible={this.state.visible}
                    onOk={this.props.handleRuleOK} onCancel={this.props.handleRuleCancel}
                    centered={true}
                    >
                <p>在 3X3 的方阵中，一共有 9 个区域，每个区域又是由 3X3 的小方阵组成。两人对垒的时候，先手一方先在大方阵的某一区域的小方阵中选择一点，根据这一点来确定下一个选手在大方阵中的小方阵位置，选择好后以此规则再返给先手，能在小方阵中直线点亮三点就能永久点亮这个小方阵，作为大方阵的一点，以此往复，直到在大方阵中也能够完成直线链接。</p>
            </Modal>
        )
    }

    componentWillReceiveProps(nextProps: RuleProps) {
        this.setState({
            visible: nextProps.visible,
        })
    }
}