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
        this.state = {
            grammarName: this.props.defaultGrammarName || '',
            grammarFileNames: [],
            height: '400px',
            saveGrammarBtnText: 'Save'
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

    componentWillMount(){
        this.getFileNames((data) => { this.setState({'grammarFileNames': data.results}) })
    }

    handleChange(e){
        this.setState({'grammarName': e.target.value}) 
    }

    updateGrammarName(filename){
        this.setState({'grammarName': filename})
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
        }else{
            return this.checkSaveGrammarName();
        }
    }

    checkSaveGrammarName() {
        if (this.state.grammarFileNames.indexOf(this.state.grammarName) > -1){
            return 'warning'
        } else if (this.state.grammarName == '') {
            return 'error'
        }
        return 'success'
    }

    saveGrammar() {
        this.setState({'saveGrammarBtnText': 'Saving...'})
        ajax({
            url: $SCRIPT_ROOT + '/api/grammar/save',
            type: "POST",
            contentType: "text/plain",
            data: this.state.grammarName,
            async: true,
            cache: false,
            success: (status) => { 
                this.setState({'saveGrammarBtnText': 'Saved!'})
                setTimeout(() => { this.setState({'saveGrammarBtnText': 'Save'}) }, 3000);
            }
        })
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
                            <FormControl type="text" value={this.state.grammarName} placeholder="Enter a filename." onChange={this.handleChange} />
                            <FormControl.Feedback />
                            <HelpBlock><i>Grammars are saved to /grammars. Saving will overwrite files with the same name.</i></HelpBlock>
                        </FormGroup>
                    </form>
                    <FileList onFileClick={this.updateGrammarName} highlightedFile={this.state.grammarName} height='200px' directory='grammars'></FileList>
                    <Button onClick={this.saveGrammar} type="submit" style={{marginTop: '15px'}} bsStyle={this.setSaveButtonStyle()} disabled={this.disableSaveButton()}>{this.state.saveGrammarBtnText}</Button>
                </div>
            </Modal>

        )
    }
}

module.exports = SaveGrammarModal;
