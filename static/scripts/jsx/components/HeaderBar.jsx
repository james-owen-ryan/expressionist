{/* This will contain the operations which can be used on the grammar at any time, import, load, save, export {. This is nested directly within the main interface*/
}
var React = require('react')
var ButtonGroup = require('react-bootstrap').ButtonGroup
var Button = require('react-bootstrap').Button
var ButtonToolbar = require('react-bootstrap').ButtonToolbar
var Modal = require('react-bootstrap').Modal
var ajax = require('jquery').ajax

var HeaderBar = React.createClass({
    getInitialState() {
        return {
            showModal: false,
            showLoadModal: false,
            grammarFileNames: [],
        };
    },

    componentDidMount() {
        ajax({
            url: $SCRIPT_ROOT + '/api/grammar/load_dir',
            type: "GET",
            cache: false,
            success: (data) => { this.setState({'grammarFileNames': data.results}) }
        })
    },

    close(prop) {
        this.setState({[prop]: false});
    },

    open(prop) {
        this.setState({[prop]: true});
    },

    load: function(filename){
        ajax({
            url: $SCRIPT_ROOT + '/api/grammar/from_file',
            type: "POST",
            contentType: "text/plain",
            data: filename,
            async: false,
            cache: false
        })
        this.props.update()
        this.setState({showLoadModal: false})
    },

    render: function () {
        return (
            <div>
                <ButtonToolbar>
                    <ButtonGroup>
                        <Button onClick={this.open.bind(this, 'showLoadModal')} bsStyle='primary'>Load</Button>
                        <Button onClick={this.props.saveGrammar} bsStyle='primary'>Save</Button>
                        <Button onClick={this.open.bind(this, 'showModal')} bsStyle='primary'>Show System Vars</Button>
                        <Button onClick={this.props.reset} bsStyle='danger'>Start Over</Button>
                    </ButtonGroup>
                </ButtonToolbar>
                <Modal show={this.state.showLoadModal} onHide={this.close.bind(this, 'showLoadModal')}>
                    <Modal.Header closeButton>
                        <Modal.Title>Load A Grammar</Modal.Title>
                    </Modal.Header>
                    <div id='grammarFiles' style={{'overflowY': 'scroll', 'height':'400px'}}>
                        {   this.state.grammarFileNames.map(function (filename) {
                                return (
                                    <button className='list-group-item list-group-item-xs nonterminal' 
                                    style={{'margin':'0', 'border':'1px solid #ddd'}} 
                                    onClick={this.load.bind(this, filename)} key={filename}>{filename}
                                    </button>
                                )
                            }.bind(this))
                        }
                    </div>
                </Modal>
                <Modal show={this.state.showModal} onHide={this.close.bind(this, 'showModal')}>
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
