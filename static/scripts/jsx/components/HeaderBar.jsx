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
var DropdownButton = require('react-bootstrap').DropdownButton
var Glyphicon = require('react-bootstrap').Glyphicon


const AUTHOR_IS_USING_A_MAC = navigator.platform.toUpperCase().indexOf('MAC') >= 0;


class HeaderBar extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <ButtonToolbar>
                    <ButtonGroup>
                        <DropdownButton id="logoButton" className="grp-button" title=<Glyphicon glyph="list-alt"/> bsStyle={this.props.logoButtonIsJuicing ? 'success' : 'default'}>
                            <div>
                                <Button key="goBackMenuItem" title="Go back to previous symbol or rule" style={{width: '250px', textAlign: 'left'}} onClick={this.props.goBack}>Back<span style={{position: 'absolute', right: '12px'}}>{AUTHOR_IS_USING_A_MAC ? "⌘←" : "Ctrl+Left"}</span></Button>
                                <Button key="goForwardMenuItem" title="Go forward to next symbol or rule" style={{width: '250px', textAlign: 'left'}} onClick={this.props.goForward}>Forward<span style={{position: 'absolute', right: '12px'}}>{AUTHOR_IS_USING_A_MAC ? "⌘→" : "Ctrl+Right"}</span></Button>
                                <Button key="undoMenuItem" title="Undo last action (that changed the grammar)" style={{width: '250px', textAlign: 'left'}} onClick={this.props.undo}>Undo<span style={{position: 'absolute', right: '12px'}}>{AUTHOR_IS_USING_A_MAC ? "⌘Z" : "Ctrl+Z"}</span></Button>
                                <Button key="redoMenuItem" title="Redo last action (that changed the grammar)" style={{width: '250px', textAlign: 'left'}} onClick={this.props.redo}>Redo<span style={{position: 'absolute', right: '12px'}}>{AUTHOR_IS_USING_A_MAC ? "⇧⌘Z / ⌘Y" : "Ctrl+Y / Ctrl+Shift+Z"}</span></Button>
                            </div>
                        </DropdownButton>
                        <Button id="headerBarNewButton" title={AUTHOR_IS_USING_A_MAC ? "Start new grammar (⌘G)" : "Start new grammar (Ctrl+G)"} onClick={this.props.newGrammar} bsStyle={this.props.newButtonIsJuicing ? 'success' : 'default'}>{this.props.newButtonIsJuicing ? "New!" : "New"}</Button>
                        <Button id="headerBarLoadButton" title={this.props.loadButtonSpinnerOn ? "Loading grammar..." : AUTHOR_IS_USING_A_MAC ? "Load grammar (⌘O)" : "Load grammar (Ctrl+O)"} onClick={this.props.openLoadModal} bsStyle={this.props.loadButtonIsJuicing ? 'success' : 'default'} spinColor="#000" loading={this.props.loadButtonSpinnerOn}>{this.props.loadButtonSpinnerOn ? "Loading..." : this.props.loadButtonIsJuicing ? "Loaded!" : "Load"}</Button>
                        <Button title={AUTHOR_IS_USING_A_MAC ? "Save grammar (⌘S)" : "Save grammar (Ctrl+S)"} onClick={this.props.openSaveModal} bsStyle={this.props.saveButtonIsJuicing ? 'success' : 'default'}>{this.props.saveButtonIsJuicing ? "Saved!" : "Save"}</Button>
                        <Button title={this.props.exportButtonSpinnerOn ? "Exporting content bundle..." : this.props.exportButtonDisabled ? "Export content bundle (disabled: requires at least one top-level symbol with a production rule)" : AUTHOR_IS_USING_A_MAC ? "Export grammar (⌘E)" : "Save grammar (Ctrl+E)"} disabled={this.props.exportButtonDisabled} onClick={this.props.openExportModal} bsStyle={this.props.exportButtonIsJuicing ? 'success' : 'default'} spinColor="#000" loading={this.props.exportButtonSpinnerOn}>{this.props.exportButtonSpinnerOn ? "Exporting..." : this.props.exportButtonIsJuicing ? "Exported!" : "Export"}</Button>
                        <Button title={this.props.buildButtonSpinnerOn ? "Building Productionist module..." : this.props.buildButtonDisabled ? "Build Productionist module (disabled: requires exported content bundle)" : AUTHOR_IS_USING_A_MAC ? "Build Productionist module (⌘B)" : "Build Productionist module (Ctrl+B)"} disabled={this.props.buildButtonDisabled} onClick={this.props.attemptToBuildProductionist} bsStyle={this.props.buildButtonIsJuicing ? 'success' : 'default'} spinColor="#000" loading={this.props.buildButtonSpinnerOn}>{this.props.buildButtonSpinnerOn ? "Building..." : this.props.buildButtonIsJuicing ? "Built!" : "Build"}</Button>
                        <Button id="headerBarTestButton" title={this.props.testButtonDisabled ? "Test Productionist module (disabled: requires built Productionist module)" : AUTHOR_IS_USING_A_MAC ? "Test Productionist module (⌘.)" : "Test Productionist module (Ctrl+.)"} disabled={this.props.testButtonDisabled} onClick={this.props.openTestModal} bsStyle='default'>Test</Button>
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
