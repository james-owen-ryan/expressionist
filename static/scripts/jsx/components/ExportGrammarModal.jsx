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
        this.juiceExportButton = this.juiceExportButton.bind(this);
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
        return 'null'
    }

    juiceExportButton() {
        // This function gradually fades the save button from our palette green (rgb(87, 247, 224))
        // to our palette gray (rgb(242, 242, 242))
        var currentButtonRgbValues = document.getElementById("exportButton").style.backgroundColor;
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
        document.getElementById("exportButton").style.backgroundColor = "rgb("+r+","+g+","+b+")";
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
                })
                // Generate a juicy response (button lights green and fades back to gray)
                document.getElementById('exportButton').style.backgroundColor = 'rgb(87, 247, 224)';
                var juicingIntervalFunction = setInterval(this.juiceExportButton, 1);
                var that = this;
                setTimeout(function() {
                    clearInterval(juicingIntervalFunction);
                    that.setState({
                        'exportGrammarBtnText': 'Export',
                    })
                    document.getElementById('exportButton').style.backgroundColor = 'rgb(242, 242, 242)';
                }, 1250);
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
                    <Button id="exportButton" onClick={this.exportGrammar} type="submit" style={{marginTop: '15px'}} bsStyle={this.setExportButtonStyle()} disabled={this.checkDisableExportButton()}>{this.state.exportGrammarBtnText}</Button>
                </div>
            </Modal>

        )
    }
}

module.exports = ExportGrammarModal;
