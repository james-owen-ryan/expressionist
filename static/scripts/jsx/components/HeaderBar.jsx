{/* This will contain the operations which can be used on the grammar at any time, import, load, save, export {. This is nested directly within the main interface*/
}
var React = require('react')
var ButtonGroup = require('react-bootstrap').ButtonGroup
var Button = require('react-bootstrap').Button
var ButtonToolbar = require('react-bootstrap').ButtonToolbar
var Modal = require('react-bootstrap').Modal

var HeaderBar = React.createClass({
    getInitialState() {
        return {showModal: false};
    },

    close() {
        this.setState({showModal: false});
    },

    open() {
        this.setState({showModal: true});
    },


    render: function () {
        return (
            <div>
                <ButtonToolbar>
                    <ButtonGroup>
                        <Button onClick={this.props.loadGrammar} bsStyle='primary'>Load</Button>
                        <Button onClick={this.props.saveGrammar} bsStyle='primary'>Save</Button>
                        <Button onClick={this.open} bsStyle='primary'>Show System Vars</Button>
                        <Button onClick={this.props.reset} bsStyle='danger'>Start Over</Button>
                    </ButtonGroup>
                </ButtonToolbar>
                <Modal show={this.state.showModal} onHide={this.close}>
                    <Modal.Header closeButton>
                        <Modal.Title>Defined System Variables</Modal.Title>
                    </Modal.Header>
                    {this.props.systemVars.map(function (system_var) {
                            return (
                                <p>{system_var}</p>
                            );
                        }
                    )
                    }
                </Modal>
            </div>
        );
    }

})

module.exports = HeaderBar
