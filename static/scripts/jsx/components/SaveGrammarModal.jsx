var React = require('react')
var Modal = require('react-bootstrap').Modal
var FormGroup = require('react-bootstrap').FormGroup
var FormControl = require('react-bootstrap').FormControl
var ControlLabel = require('react-bootstrap').ControlLabel
var HelpBlock = require('react-bootstrap').HelpBlock
var FileList = require('./FileList.jsx')
var ajax = require('jquery').ajax
var Button = require('react-bootstrap').Button

class SaveGrammarModal extends React.Component {

    constructor(props) {
        super(props);
        this.getFileNames = this.getFileNames.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.updateGrammarName = this.updateGrammarName.bind(this);
        this.disableSaveButton = this.disableSaveButton.bind(this);
        this.setSaveButtonStyle = this.setSaveButtonStyle.bind(this);
        this.saveGrammarOnEnter = this.saveGrammarOnEnter.bind(this);
        this.state = {
            grammarFileNames: [],
            height: '400px',
        };
    }

    getFileNames(onSuccess) {
        ajax({
            url: $SCRIPT_ROOT + '/api/grammar/load_dir',
            type: "GET",
            cache: false,
            success: onSuccess
        })
    }

    handleChange(e){
        if (e.key !== 'Enter') {
            this.props.setCurrentGrammarName(e.target.value);
        }
    }

    saveGrammarOnEnter(e) {
        if (this.props.show) {
            if (e.key === 'Enter' && !(e.ctrlKey || e.metaKey)) {
                document.getElementById("saveButton").click();
                e.preventDefault();
            }
        }
    };

    updateGrammarName(filename){
        this.props.setCurrentGrammarName(filename);
    }

    disableSaveButton(){
        if (this.checkSaveGrammarName() == 'error'){
            return true
        }
        return false
    }

    setSaveButtonStyle(){
        if (this.props.saveButtonIsJuicing) {
            return 'success'
        }
        else if (this.checkSaveGrammarName() == 'error'){
            return 'danger'
        }
        else if (this.checkSaveGrammarName() === null){
            return 'default'
        }
        else {
            return this.checkSaveGrammarName();
        }
    }

    checkSaveGrammarName() {
        if (this.state.grammarFileNames.indexOf(this.props.getCurrentGrammarName()) > -1){
            return 'warning'
        } else if (this.props.getCurrentGrammarName() == '') {
            return 'error'
        }
        return null
    }

    componentWillMount(){
        this.getFileNames((data) => { this.setState({'grammarFileNames': data.results}) })
    }

    componentDidMount(){
        document.addEventListener("keydown", this.saveGrammarOnEnter, false);
    }

    render() {
        return (
            <Modal show={this.props.show} onHide={this.props.onHide}>
                <Modal.Header closeButton>
                    <Modal.Title>Save grammar...</Modal.Title>
                </Modal.Header>
                <div style={{padding: '15px'}}>
                    <form>
                        <FormGroup controlId="saveGrammarForm" validationState={this.checkSaveGrammarName()}>
                            <ControlLabel>Grammar name</ControlLabel>
                            <FormControl type="text" value={this.props.getCurrentGrammarName()} placeholder="Enter a filename." onChange={this.handleChange} autoFocus="true"/>
                            <FormControl.Feedback />
                            <HelpBlock><i>Grammars are saved to /grammars. Saving will overwrite files with the same name.</i></HelpBlock>
                        </FormGroup>
                    </form>
                    <FileList onFileClick={this.updateGrammarName} highlightedFile={this.props.getCurrentGrammarName() + '.json'} height='200px' directory='grammars'></FileList>
                    <Button title="Save grammar file (to /grammars)" id="saveButton" onClick={this.props.saveGrammar} style={{marginTop: '15px'}} bsStyle={this.setSaveButtonStyle()} disabled={this.disableSaveButton()}>{this.props.saveButtonIsJuicing ? 'Saved!' : 'Save'}</Button>
                </div>
            </Modal>

        )
    }
}

module.exports = SaveGrammarModal;
