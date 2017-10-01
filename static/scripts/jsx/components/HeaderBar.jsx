var React = require('react');
var ButtonGroup = require('react-bootstrap').ButtonGroup;
var Button = require('react-bootstrap').Button;
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var Modal = require('react-bootstrap').Modal;
var ajax = require('jquery').ajax;
var GenerateModal = require('./GenerateModal.jsx');

var HeaderBar = React.createClass({
    getInitialState() {
        return {
            showModal: false,
            showLoadModal: false,
            showGenerateModal: false,
            grammarFileNames: [],
        };
    },

    close(prop) {
        this.setState({[prop]: false});
    },

    open(prop) {
        this.setState({[prop]: true});
        ajax({
            url: $SCRIPT_ROOT + '/api/grammar/load_dir',
            type: "GET",
            cache: false,
            success: (data) => { this.setState({'grammarFileNames': data.results}) }
        })
    },

    load: function(filename){
        ajax({
            url: $SCRIPT_ROOT + '/api/grammar/from_file',
            type: "POST",
            contentType: "json",
            data: filename,
            async: false,
            cache: false
        })
        this.props.update()
        this.setState({showLoadModal: false})
    },

    openGenerateModal: function(){
        this.setState({showGenerateModal: true})
    },

    render: function () {
        return (
            <div>
                <ButtonToolbar>
                    <ButtonGroup>
                        <Button onClick={this.open.bind(this, 'showLoadModal')} bsStyle='primary'>Load</Button>
                        <Button onClick={this.props.saveGrammar} bsStyle='primary'>Save</Button>
                        <Button onClick={this.props.exportGrammar} bsStyle='primary'>Export</Button>
                        <Button onClick={this.openGenerateModal} bsStyle='primary'>Generate</Button>
                        <Button onClick={this.props.reset} bsStyle='danger'>Start Over</Button>
                    </ButtonGroup>
                </ButtonToolbar>
                <GenerateModal  show={this.state.showGenerateModal} 
                                onHide={this.close.bind(this, 'showGenerateModal')}
                                markups={this.props.markups}>
                </GenerateModal>
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
