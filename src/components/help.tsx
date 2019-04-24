import * as React from 'react';
import { Modal } from 'antd';
import 'antd/lib/modal/style/css';

interface HelpProps {
    visible: boolean,
    handleHelpOK(): void,
    handleHelpCancel(): void,
}

export class Help extends React.Component<HelpProps> {

    public state: {
        visible: boolean,
    }

    constructor(props: HelpProps) {
        super(props);
        this.state = {
            visible: this.props.visible,
        }
    }

    render() {
        return (
            <Modal title='帮助' visible={this.state.visible}
                    onOk={this.props.handleHelpOK} onCancel={this.props.handleHelpCancel}
                    centered={true}
                    >
                <p>这里是help content.</p>
            </Modal>
        )
    }

    componentWillReceiveProps(nextProps: HelpProps) {
        this.setState({
            visible: nextProps.visible,
        })
    }
}