var React = require('react')
var Modal = require('react-bootstrap').Modal
var FormGroup = require('react-bootstrap').FormGroup
var FormControl = require('react-bootstrap').FormControl
var ControlLabel = require('react-bootstrap').ControlLabel
var HelpBlock = require('react-bootstrap').HelpBlock
var FileList = require('./FileList.jsx')
var ajax = require('jquery').ajax
var Button = require('react-bootstrap').Button

class ExportGrammarModal extends React.Component {

    constructor(props) {
        super(props);
        this.getFileNames = this.getFileNames.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.updateGrammarName = this.updateGrammarName.bind(this);
        this.setExportButtonStyle = this.setExportButtonStyle.bind(this);
        this.exportGrammar = this.exportGrammar.bind(this);
        this.checkExportGrammarName = this.checkExportGrammarName.bind(this);
        this.checkDisableExportButton = this.checkDisableExportButton.bind(this);
        this.state = {
            grammarFileNames: [],
            height: '400px',
            exportGrammarBtnText: 'Export bundle',
            disableExportButton: false,
            validationState: 'success',
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

    componentWillMount(){
        this.getFileNames((data) => { this.setState({'grammarFileNames': data.results}) })
    }

    handleChange(e){
        this.state.setCurrentGrammarName(e.target.value);
    }

    updateGrammarName(filename){
        this.state.setCurrentGrammarName(filename);
    }

    setExportButtonStyle(){
        if (this.checkExportGrammarName() == 'error'){
            return 'danger'
        }else{
            return this.checkExportGrammarName();
        }
    }

    checkDisableExportButton(){
        if (this.checkExportGrammarName() == 'error'){
            return true
        } else {
            return false
        }
    }

    checkExportGrammarName() {
        if (this.state.grammarFileNames.indexOf(this.state.getCurrentGrammarName()) > -1){
            return 'warning'
        } else if (this.state.getCurrentGrammarName() == '') {
            return 'error'
        }
        return 'success'
    }

    exportGrammar() {
        this.setState({'exportGrammarBtnText': 'Exporting...'})
        ajax({
            url: $SCRIPT_ROOT + '/api/grammar/export',
            type: "POST",
            contentType: "text/plain",
            data: this.state.getCurrentGrammarName(),
            async: true,
            cache: false,
            success: (status) => { 
                this.setState({
                    'exportGrammarBtnText': 'Exported!',
                    'disableExportButton': true
                })
                setTimeout(() => { this.setState({
                    'exportGrammarBtnText': 'Export',
                    'disableExportButton': false
                }) }, 3000);
            }
        })
    }

    render() {
        return (
            <Modal show={this.props.show} onHide={this.props.onHide}>
                <Modal.Header closeButton>
                    <Modal.Title>Export content bundle...</Modal.Title>
                </Modal.Header>
                <div style={{padding: '15px'}}>
                    <form>
                        <FormGroup controlId="exportGrammarForm" validationState={this.checkExportGrammarName()}>
                            <ControlLabel>Bundle name</ControlLabel>
                            <FormControl type="text" value={this.state.getCurrentGrammarName()} placeholder="Enter a name for your content bundle." onChange={this.handleChange} />
                            <FormControl.Feedback />
                            <HelpBlock><i>Content bundles are exported to /exports. Exporting will overwrite files with the same bundle name.</i></HelpBlock>
                        </FormGroup>
                    </form>
                    <FileList onFileClick={this.updateGrammarName} highlightedFile={this.state.getCurrentGrammarName()} height='200px' directory='exports'></FileList>
                    <Button onClick={this.exportGrammar} type="submit" style={{marginTop: '15px'}} bsStyle={this.setExportButtonStyle()} disabled={this.checkDisableExportButton()}>{this.state.exportGrammarBtnText}</Button>
                </div>
            </Modal>

        )
    }
}

module.exports = ExportGrammarModal;
