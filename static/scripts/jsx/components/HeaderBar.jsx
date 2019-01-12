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
    }

    render() {
        return (
            <div>
                <ButtonToolbar>
                    <ButtonGroup>
                        <Button id="headerBarNewButton" title="Start new grammar (hot key: 'command+g' or 'ctrl+g')" onClick={this.props.reset} bsStyle='primary'>New</Button>
                        <Button id="headerBarLoadButton" title={this.props.loadButtonSpinnerOn ? "Loading grammar..." : "Load grammar (hot key: 'command+o' or 'ctrl+o')"} onClick={this.props.openLoadModal} bsStyle={this.props.loadButtonIsJuicing ? 'success' : 'primary'} spinColor="#000" loading={this.props.loadButtonSpinnerOn}>{this.props.loadButtonSpinnerOn ? "Loading..." : this.props.loadButtonIsJuicing ? "Loaded!" : "Load"}</Button>
                        <Button title="Save grammar (hot key: 'command+s' or 'ctrl+s')" onClick={this.props.openSaveModal} bsStyle={this.props.saveButtonIsJuicing ? 'success' : 'primary'}>{this.props.saveButtonIsJuicing ? "Saved!" : "Save"}</Button>
                        <Button title={this.props.exportButtonSpinnerOn ? "Exporting content bundle..." : this.props.exportButtonDisabled ? "Export content bundle (disabled: requires at least one top-level symbol with a production rule)" : "Export content bundle (hot key: 'command+e' or 'ctrl+e')"} disabled={this.props.exportButtonDisabled} onClick={this.props.openExportModal} bsStyle={this.props.exportButtonIsJuicing ? 'success' : 'primary'} spinColor="#000" loading={this.props.exportButtonSpinnerOn}>{this.props.exportButtonSpinnerOn ? "Exporting..." : this.props.exportButtonIsJuicing ? "Exported!" : "Export"}</Button>
                        <Button title={this.props.buildButtonSpinnerOn ? "Building Productionist module..." : this.props.buildButtonDisabled ? "Build Productionist module (disabled: requires exported content bundle)" : "Build Productionist module (hot key: 'command+b' or 'ctrl+b')"} disabled={this.props.buildButtonDisabled} onClick={this.props.attemptToBuildProductionist} bsStyle={this.props.buildButtonIsJuicing ? 'success' : 'primary'} spinColor="#000" loading={this.props.buildButtonSpinnerOn}>{this.props.buildButtonSpinnerOn ? "Building..." : this.props.buildButtonIsJuicing ? "Built!" : "Build"}</Button>
                        <Button id="headerBarTestButton" title={this.props.testButtonDisabled ? "Test Productionist module (disabled: requires built Productionist module)" : "Test Productionist module (hot key: 'command+y' or 'ctrl+y')"} disabled={this.props.testButtonDisabled} onClick={this.props.openTestModal} bsStyle='primary'>Test</Button>
                    </ButtonGroup>
                </ButtonToolbar>
                <TestModal show={this.props.showTestModal} onHide={this.props.closeTestModal} bundleName={this.props.bundleName}></TestModal>
                <Modal show={this.props.showLoadModal} onHide={this.props.closeLoadModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Load grammar...</Modal.Title>
                    </Modal.Header>
                    <FileList onFileClick={this.props.loadGrammar} highlightedFile={this.props.getCurrentGrammarName()} directory='grammars'></FileList>
                </Modal>
                <ExportGrammarModal show={this.props.showExportModal} onHide={this.props.closeExportModal} exportGrammar={this.props.exportGrammar} getCurrentGrammarName={this.props.getCurrentGrammarName} setCurrentGrammarName={this.props.setCurrentGrammarName} enableBuildButton={this.props.enableBuildButton} exportButtonSpinnerOn={this.props.exportButtonSpinnerOn} turnExportButtonSpinnerOff={this.props.turnExportButtonSpinnerOff} turnExportButtonSpinnerOn={this.props.turnExportButtonSpinnerOn} exportButtonIsJuicing={this.props.exportButtonIsJuicing}></ExportGrammarModal>
                <SaveGrammarModal show={this.props.showSaveModal} onHide={this.props.closeSaveModal} saveGrammar={this.props.saveGrammar} getCurrentGrammarName={this.props.getCurrentGrammarName} setCurrentGrammarName={this.props.setCurrentGrammarName} saveButtonIsJuicing={this.props.saveButtonIsJuicing}></SaveGrammarModal>
            </div>
        );
    }
}

module.exports = HeaderBar;
