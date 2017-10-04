var React = require('react');
var ButtonGroup = require('react-bootstrap').ButtonGroup;
var Button = require('react-bootstrap').Button;
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var Modal = require('react-bootstrap').Modal;
var ajax = require('jquery').ajax;
var TestModal = require('./TestModal.jsx');

var HeaderBar = React.createClass({
    getInitialState() {
        return {
            showModal: false,
            showLoadModal: false,
            showTestModal: false,
            grammarFileNames: [],
            bundleName: ''
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

    buildProductionist: function () {
        var contentBundleName = window.prompt("Enter the name of the content bundle that you'd like to build a generator for.")
        if (contentBundleName != "") {
            ajax({
                url: $SCRIPT_ROOT + '/api/grammar/build',
                type: "POST",
                contentType: "text/plain",
                data: contentBundleName,
                async: true,
                cache: false,
                success: function(data){
                    window.alert(data.status);
                    this.setState({bundleName: data.bundleName})
                }.bind(this)
            })
        }
    },

    openTestModal: function(){
        this.setState({showTestModal: true}) 
    },

    render: function () {
        return (
            <div>
                <ButtonToolbar>
                    <ButtonGroup>
                        <Button onClick={this.props.reset} bsStyle='danger'>New</Button>
                        <Button onClick={this.open.bind(this, 'showLoadModal')} bsStyle='primary'>Load</Button>
                        <Button onClick={this.props.saveGrammar} bsStyle='primary'>Save</Button>
                        <Button onClick={this.props.exportGrammar} bsStyle='primary'>Export</Button>
                        <Button onClick={this.buildProductionist} bsStyle='primary'>Build</Button>
                        <Button onClick={this.openTestModal} bsStyle='primary'>Test</Button>
                    </ButtonGroup>
                </ButtonToolbar>
                <TestModal  show={this.state.showTestModal} 
                            onHide={this.close.bind(this, 'showTestModal')}
                            bundleName={this.state.bundleName}>
                </TestModal>
                <Modal show={this.state.showLoadModal} onHide={this.close.bind(this, 'showLoadModal')}>
                    <Modal.Header closeButton>
                        <Modal.Title>Load A Grammar</Modal.Title>
                    </Modal.Header>
                    <div id='grammarFiles' style={{'overflowY': 'scroll', 'height':'400px'}}>
                        {   this.state.grammarFileNames.map(function (filename) {
                                return (
                                    <button className='list-group-item list-group-item-xs nonterminal' 
                                    style={{'margin':'0', 'border':'0px solid #ddd'}}
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
