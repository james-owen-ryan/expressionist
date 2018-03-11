var React = require('react')
var ButtonGroup = require('react-bootstrap').ButtonGroup
var Button = require('react-bootstrap').Button
var ButtonToolbar = require('react-bootstrap').ButtonToolbar
var Modal = require('react-bootstrap').Modal
var ajax = require('jquery').ajax
var TestModal = require('./TestModal.jsx')
var SaveGrammarModal = require('./SaveGrammarModal.jsx')
var ExportGrammarModal = require('./ExportGrammarModal.jsx')
var FileList = require('./FileList.jsx')

class HeaderBar extends React.Component {

    constructor(props) {
        super(props);
        this.openLoadModal = this.openLoadModal.bind(this);
        this.openTestModal = this.openTestModal.bind(this);
        this.openSaveModal = this.openSaveModal.bind(this);
        this.closeTestModal = this.closeTestModal.bind(this);
        this.closeLoadModal = this.closeLoadModal.bind(this);
        this.closeSaveModal = this.closeSaveModal.bind(this);
        this.openExportModal = this.openExportModal.bind(this);
        this.closeExportModal = this.closeExportModal.bind(this);
        this.openBuildModal = this.openBuildModal.bind(this);
        this.closeBuildModal = this.closeBuildModal.bind(this);
        this.load = this.load.bind(this);
        this.reset = this.reset.bind(this);
        this.buildProductionist = this.buildProductionist.bind(this);
        this.state = {
            showLoadModal: false,
            showTestModal: false,
            showSaveModal: false,
            showExportModal: false,
            showBuildModal: false,
            buildNavTitle: 'Build',
            buildModalTitle: 'Build A Grammar',
            bundleName: '',
            loadedGrammarName: 'example.json'
        }
    }

    openLoadModal() {
        this.setState({showLoadModal: true});
    }

    openTestModal() {
        this.setState({showTestModal: true});
    }

    openSaveModal() {
        this.setState({showSaveModal: true});
    }

    openExportModal(){
        this.setState({showExportModal: true});
    }

    openBuildModal(){
        this.setState({showBuildModal: true});
    }

    closeTestModal() {
        this.setState({showTestModal: false});
    }

    closeLoadModal() {
        this.setState({showLoadModal: false});
    }

    closeSaveModal() {
        this.setState({showSaveModal: false});
    }

    closeExportModal(){
        this.setState({showExportModal: false});
    }

    closeBuildModal(){
        this.setState({showBuildModal: false});
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
            success: () => {
                this.props.update()
                this.setState({
                    showLoadModal: false,
                    loadedGrammarName: filename
                })
            },
            cache: false
        })
    }

    reset() {
        ajax({
            url: $SCRIPT_ROOT + '/api/grammar/new',
            type: 'GET',
            cache: false
        });
        this.props.updateCurrentNonterminal('');
        this.props.updateMarkupFeedback([]);
        this.props.updateExpansionFeedback('');
        this.props.updateHistory("'", -1);
        this.props.update()
        this.setState({loadedGrammarName: ''})
    }

    buildProductionist(contentBundleName) {
        this.setState({
            buildNavTitle: 'Building...',
            buildModalTitle: 'Building...'
        })
        ajax({
            url: $SCRIPT_ROOT + '/api/grammar/build',
            type: "POST",
            contentType: "text/plain",
            data: contentBundleName,
            cache: false,
            success: (data) => {
                this.setState({
                    bundleName: data.bundleName,
                    showBuildModal: false,
                    buildNavTitle: 'Build',
                    buildModalTitle: 'Build A Grammar'
                })
            }
        })
    }

    render() {
        return (
            <div>
                <ButtonToolbar>
                    <ButtonGroup>
                        <Button onClick={this.reset} bsStyle='danger'>New</Button>
                        <Button onClick={this.openLoadModal} bsStyle='primary'>Load</Button>
                        <Button onClick={this.openSaveModal} bsStyle='primary'>Save</Button>
                        <Button onClick={this.openExportModal} bsStyle='primary'>Export</Button>
                        <Button onClick={this.openBuildModal} bsStyle='primary'>{this.state.buildNavTitle}</Button>
                        <Button onClick={this.openTestModal} bsStyle='primary'>Test</Button>
                    </ButtonGroup>
                </ButtonToolbar>
                <TestModal show={this.state.showTestModal} onHide={this.closeTestModal} bundleName={this.state.bundleName}></TestModal>
                <Modal show={this.state.showLoadModal} onHide={this.closeLoadModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Load A Grammar</Modal.Title>
                    </Modal.Header>
                    <FileList onFileClick={this.load} highlightedFile={this.state.loadedGrammarName} directory='grammars'></FileList>
                </Modal>
                <ExportGrammarModal show={this.state.showExportModal} onHide={this.closeExportModal} defaultGrammarName={this.state.loadedGrammarName}></ExportGrammarModal>
                <SaveGrammarModal show={this.state.showSaveModal} onHide={this.closeSaveModal} defaultGrammarName={this.state.loadedGrammarName}></SaveGrammarModal>
                <Modal show={this.state.showBuildModal} onHide={this.closeBuildModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>{this.state.buildModalTitle}</Modal.Title>
                    </Modal.Header>
                    <FileList onFileClick={this.buildProductionist} highlightedFile={this.state.loadedGrammarName} directory='exports'></FileList>
                </Modal>
            </div>
        );
    }
}

module.exports = HeaderBar;
