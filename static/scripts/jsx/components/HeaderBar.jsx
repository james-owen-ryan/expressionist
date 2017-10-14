var React = require('react')
var ButtonGroup = require('react-bootstrap').ButtonGroup
var Button = require('react-bootstrap').Button
var ButtonToolbar = require('react-bootstrap').ButtonToolbar
var Modal = require('react-bootstrap').Modal
var ajax = require('jquery').ajax
var TestModal = require('./TestModal.jsx')

class HeaderBar extends React.Component {

    constructor(props) {
        super(props);
        this.openLoadModal = this.openLoadModal.bind(this);
        this.openTestModal = this.openTestModal.bind(this);
        this.closeTestModal = this.closeTestModal.bind(this);
        this.closeLoadModal = this.closeLoadModal.bind(this);
        this.load = this.load.bind(this);
        this.reset = this.reset.bind(this);
        this.saveGrammar = this.saveGrammar.bind(this);
        this.exportGrammar = this.exportGrammar.bind(this);
        this.buildProductionist = this.buildProductionist.bind(this);
        this.state = {
            showLoadModal: false,
            showTestModal: false,
            grammarFileNames: [],
            bundleName: ''
        }
    }

    openLoadModal() {
        this.setState({showLoadModal: true});
        ajax({
            url: $SCRIPT_ROOT + '/api/grammar/load_dir',
            type: "GET",
            cache: false,
            success: (data) => { this.setState({'grammarFileNames': data.results}) }
        })
    }

    openTestModal() {
        this.setState({showTestModal: true});
    }

    closeTestModal() {
        this.setState({showTestModal: false});
    }

    closeLoadModal() {
        this.setState({showLoadModal: false});
    }

    closeSystemVarsModal() {
        this.setState({showModal: false})
    }

    load(filename) {
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
    }

    reset() {
        ajax({
            url: $SCRIPT_ROOT + '/api/grammar/new',
            type: 'GET',
            async: false,
            cache: false
        });
        this.props.updateCurrentNonterminal('');
        this.props.updateMarkupFeedback([]);
        this.props.updateExpansionFeedback('');
        this.props.updateHistory("'", -1);
        this.props.update()
    }

    saveGrammar() {
        var filename = window.prompt("Enter a filename for your grammar.")
        if (filename != "") {
            ajax({
                url: $SCRIPT_ROOT + '/api/grammar/save',
                type: "POST",
                contentType: "text/plain",
                data: filename,
                async: true,
                cache: false,
                success: function(status){
                    window.alert(status);
                }
            })
        }
    }

    exportGrammar() {
        var filename = window.prompt("Enter a filename for your content bundle.")
        if (filename != "") {
            ajax({
                url: $SCRIPT_ROOT + '/api/grammar/export',
                type: "POST",
                contentType: "text/plain",
                data: filename,
                async: true,
                cache: false,
                success: function(status){
                    window.alert(status);
                }
            })
        }
    }

    buildProductionist() {
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
    }

    render() {
        return (
            <div>
                <ButtonToolbar>
                    <ButtonGroup>
                        <Button onClick={this.reset} bsStyle='danger'>New</Button>
                        <Button onClick={this.openLoadModal} bsStyle='primary'>Load</Button>
                        <Button onClick={this.saveGrammar} bsStyle='primary'>Save</Button>
                        <Button onClick={this.exportGrammar} bsStyle='primary'>Export</Button>
                        <Button onClick={this.buildProductionist} bsStyle='primary'>Build</Button>
                        <Button onClick={this.openTestModal} bsStyle='primary'>Test</Button>
                    </ButtonGroup>
                </ButtonToolbar>
                <TestModal  show={this.state.showTestModal} 
                            onHide={this.closeTestModal}
                            bundleName={this.state.bundleName}>
                </TestModal>
                <Modal show={this.state.showLoadModal} onHide={this.closeLoadModal}>
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
            </div>
        );
    }
}

module.exports = HeaderBar;
