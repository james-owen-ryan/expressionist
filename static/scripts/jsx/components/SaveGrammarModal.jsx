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
        this.saveGrammar = this.saveGrammar.bind(this);
        this.juiceSaveButton = this.juiceSaveButton.bind(this);
        this.state = {
            grammarFileNames: [],
            height: '400px',
            saveGrammarBtnText: 'Save',
            getCurrentGrammarName: this.props.getCurrentGrammarName,
            setCurrentGrammarName: this.props.setCurrentGrammarName
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
        this.state.setCurrentGrammarName(e.target.value);
    }

    updateGrammarName(filename){
        this.state.setCurrentGrammarName(filename);
    }

    disableSaveButton(){
        if (this.checkSaveGrammarName() == 'error'){
            return true
        }
        return false
    }

    setSaveButtonStyle(){
        if (this.checkSaveGrammarName() == 'error'){
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
        if (this.state.grammarFileNames.indexOf(this.state.getCurrentGrammarName()) > -1){
            return 'warning'
        } else if (this.state.getCurrentGrammarName() == '') {
            return 'error'
        }
        return null
    }

    saveGrammar() {
        // Generate a juicy response (button lights yellow and fades back to gray)
        document.getElementById('saveButton').style.backgroundColor = 'rgb(87, 247, 224)';
        document.getElementById('saveButton').innerHTML = 'Saved!'
        var juicingIntervalFunction = setInterval(this.juiceSaveButton, 1);
        ajax({
            url: $SCRIPT_ROOT + '/api/grammar/save',
            type: "POST",
            contentType: "text/plain",
            data: this.state.getCurrentGrammarName(),
            async: true,
            cache: false,
            success: (status) => {}
        })
        setTimeout(function() {
            clearInterval(juicingIntervalFunction);
            document.getElementById('saveButton').innerHTML = 'Save';
            document.getElementById('saveButton').style.backgroundColor = 'rgb(242, 242, 242)';
        }, 1250);
    }

    juiceSaveButton() {
        // This function gradually fades the save button from our palette green (rgb(87, 247, 224))
        // to our palette gray (rgb(242, 242, 242))
        var currentButtonRgbValues = document.getElementById("saveButton").style.backgroundColor;
        var extractedRgbComponents = currentButtonRgbValues.match(/\d+/g);
        var r = extractedRgbComponents[0];
        var g = extractedRgbComponents[1];
        var b = extractedRgbComponents[2];
        if (r < 242){
            r++;
        }
        if (g > 242){
            g--;
        }
        if (b < 242){
            b++;
        }
        document.getElementById("saveButton").style.backgroundColor = "rgb("+r+","+g+","+b+")";
    }

    componentWillMount(){
        this.getFileNames((data) => { this.setState({'grammarFileNames': data.results}) })
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
                            <FormControl type="text" value={this.state.getCurrentGrammarName()} placeholder="Enter a filename." onChange={this.handleChange} />
                            <FormControl.Feedback />
                            <HelpBlock><i>Grammars are saved to /grammars. Saving will overwrite files with the same name.</i></HelpBlock>
                        </FormGroup>
                    </form>
                    <FileList onFileClick={this.updateGrammarName} highlightedFile={this.state.getCurrentGrammarName() + '.json'} height='200px' directory='grammars'></FileList>
                    <Button id="saveButton" onClick={this.saveGrammar} type="submit" style={{marginTop: '15px'}} bsStyle={this.setSaveButtonStyle()} disabled={this.disableSaveButton()}>{this.state.saveGrammarBtnText}</Button>
                </div>
            </Modal>

        )
    }
}

module.exports = SaveGrammarModal;
