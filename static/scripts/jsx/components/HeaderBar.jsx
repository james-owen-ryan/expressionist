var React = require('react')
var ButtonGroup = require('react-bootstrap').ButtonGroup
import Button from 'react-bootstrap-button-loader';
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
        this.load = this.load.bind(this);
        this.reset = this.reset.bind(this);
        this.state = {
            showLoadModal: false,
            showSaveModal: false,
            showExportModal: false,
            showTestModal: false
        };
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

    closeSystemVarsModal() {
        this.setState({showModal: false})
    }

    load(filename) {
        this.props.turnLoadButtonSpinnerOn();
        this.setState({showLoadModal: false});
        ajax({
            url: $SCRIPT_ROOT + '/api/grammar/from_file',
            type: "POST",
            contentType: "json",
            data: filename,
            success: () => {
                this.props.updateCurrentNonterminal('');
                this.props.updateMarkupFeedback([]);
                this.props.updateExpansionFeedback('');
                this.props.updateHistory("'", -1);
                this.props.update(this.props.turnLoadButtonSpinnerOff);
                this.props.disableTestButton();
                this.props.disableBuildButton();
                this.props.setCurrentGrammarName(filename);
            },
            cache: false
        })
    }

    reset() {
        var prompt = window.confirm("Are you sure you'd like to start a new grammar? All unsaved changes will be lost.");
        if (prompt == false){
            return false;
        }
        ajax({
            url: $SCRIPT_ROOT + '/api/grammar/new',
            type: 'GET',
            cache: false
        });
        this.props.updateCurrentNonterminal('');
        this.props.updateMarkupFeedback([]);
        this.props.updateExpansionFeedback('');
        this.props.updateHistory("'", -1);
        this.props.update();
        this.props.disableTestButton();
        this.props.disableBuildButton();
        this.props.setCurrentGrammarName("");
    }

    render() {
        return (
            <div>
                <ButtonToolbar>
                    <ButtonGroup>
                        <Button id="headerBarNewButton" title="Start new grammar (hot key: 'command+g' or 'ctrl+g')" onClick={this.reset} bsStyle='primary'>New</Button>
                        <Button id="headerBarLoadButton" title={this.props.loadButtonSpinnerOn ? "Loading grammar..." : "Load grammar (hot key: 'command+o' or 'ctrl+o')"} onClick={this.openLoadModal} bsStyle='primary' spinColor="#000" loading={this.props.loadButtonSpinnerOn}>{this.props.loadButtonSpinnerOn ? "Loading..." : "Load"}</Button>
                        <Button title="Save grammar (hot key: 'command+s' or 'ctrl+s')" onClick={this.openSaveModal} bsStyle={this.props.headerBarSaveButtonIsJuicing ? 'success' : 'primary'}>{this.props.headerBarSaveButtonIsJuicing ? "Saved!" : "Save"}</Button>
                        <Button title={this.props.exportButtonSpinnerOn ? "Exporting content bundle..." : this.props.exportButtonDisabled ? "Export content bundle (disabled: requires at least one top-level symbol with a production rule)" : "Export content bundle (hot key: 'command+e' or 'ctrl+e')"} disabled={this.props.exportButtonDisabled} onClick={this.openExportModal} bsStyle={this.props.headerBarExportButtonIsJuicing ? 'success' : 'primary'} spinColor="#000" loading={this.props.exportButtonSpinnerOn}>{this.props.exportButtonSpinnerOn ? "Exporting..." : this.props.headerBarExportButtonIsJuicing ? "Exported!" : "Export"}</Button>
                        <Button title={this.props.buildButtonSpinnerOn ? "Building Productionist module..." : this.props.buildButtonDisabled ? "Build Productionist module (disabled: requires exported content bundle)" : "Build Productionist module (hot key: 'command+b' or 'ctrl+b')"} disabled={this.props.buildButtonDisabled} onClick={this.props.attemptToBuildProductionist} bsStyle={this.props.headerBarBuildButtonIsJuicing ? 'success' : 'primary'} spinColor="#000" loading={this.props.buildButtonSpinnerOn}>{this.props.buildButtonSpinnerOn ? "Building..." : this.props.headerBarBuildButtonIsJuicing ? "Built!" : "Build"}</Button>
                        <Button id="headerBarTestButton" title={this.props.testButtonDisabled ? "Test Productionist module (disabled: requires built Productionist module)" : "Test Productionist module (hot key: 'command+y' or 'ctrl+y')"} disabled={this.props.testButtonDisabled} onClick={this.openTestModal} bsStyle='primary'>Test</Button>
                    </ButtonGroup>
                </ButtonToolbar>
                <TestModal show={this.state.showTestModal} onHide={this.closeTestModal} bundleName={this.props.bundleName}></TestModal>
                <Modal show={this.state.showLoadModal} onHide={this.closeLoadModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Load grammar...</Modal.Title>
                    </Modal.Header>
                    <FileList onFileClick={this.load} highlightedFile={this.props.getCurrentGrammarName()} directory='grammars'></FileList>
                </Modal>
                <ExportGrammarModal show={this.state.showExportModal} onHide={this.closeExportModal} getCurrentGrammarName={this.props.getCurrentGrammarName} setCurrentGrammarName={this.props.setCurrentGrammarName} enableBuildButton={this.props.enableBuildButton} exportButtonSpinnerOn={this.props.exportButtonSpinnerOn} turnExportButtonSpinnerOff={this.props.turnExportButtonSpinnerOff} turnExportButtonSpinnerOn={this.props.turnExportButtonSpinnerOn}></ExportGrammarModal>
                <SaveGrammarModal show={this.state.showSaveModal} onHide={this.closeSaveModal} getCurrentGrammarName={this.props.getCurrentGrammarName} setCurrentGrammarName={this.props.setCurrentGrammarName}></SaveGrammarModal>
            </div>
        );
    }
}

module.exports = HeaderBar;
