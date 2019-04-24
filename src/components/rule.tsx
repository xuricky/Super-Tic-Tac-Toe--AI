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
                <p>这里是rule content.</p>
            </Modal>
        )
    }

    componentWillReceiveProps(nextProps: RuleProps) {
        this.setState({
            visible: nextProps.visible,
        })
    }
}