var React = require('react')
var ListGroupItem = require('react-bootstrap').ListGroupItem
var ListGroup = require('react-bootstrap').ListGroup
var Glyphicon = require('react-bootstrap').Glyphicon
var OverlayTrigger = require('react-bootstrap').OverlayTrigger
var FormControl = require('react-bootstrap').FormControl
var FormGroup = require('react-bootstrap').FormGroup
var ControlLabel = require('react-bootstrap').ControlLabel
var Button = require('react-bootstrap').Button
var Modal = require('react-bootstrap').Modal
var Grid = require('react-bootstrap').Grid
var Row = require('react-bootstrap').Row
var Col = require('react-bootstrap').Col
var Alert = require('react-bootstrap').Alert
var ajax = require('jquery').ajax
var ButtonGroup = require('react-bootstrap').ButtonGroup
var DropdownButton = require('react-bootstrap').DropdownButton
var MenuItem = require('react-bootstrap').MenuItem

class TestModal extends React.Component {

    constructor(props) {
        super(props);
        this.toggleTagsetStatus = this.toggleTagsetStatus.bind(this);
        this.updateTagFrequency = this.updateTagFrequency.bind(this);
        this.toggleTagStatus = this.toggleTagStatus.bind(this);
        this.getTagColorFromStatus = this.getTagColorFromStatus.bind(this);
        this.cycleStatus = this.cycleStatus.bind(this);
        this.sendTaggedContentRequest = this.sendTaggedContentRequest.bind(this);
        this.viewGeneratedText = this.viewGeneratedText.bind(this);
        this.viewGeneratedTags = this.viewGeneratedTags.bind(this);
        this.viewGeneratedTreeExpression = this.viewGeneratedTreeExpression.bind(this);
        this.state = {
            grammarFileNames: [],
            tagsets: [],
            tagsetStatuses: {},
            bundleName: '',
            bundlesList: [],
            generatedContentPackageText: '',
            generatedContentPackageTags: [],
            generatedContentPackageTreeExpression: '',
            generatedContentPackageBracketedExpression: '',
            outputError: false,
            contentRequestAlreadySubmitted: false,
            showText: true,
            showTags: false,
            showTreeExpression: false
        };
    }

    toggleTagsetStatus(tagset, event) {
        event.stopPropagation();  // Prevents the dropdown from closing
        var currentStatus = this.state.tagsetStatuses[tagset];
        var newStatus = this.cycleStatus(currentStatus);
        var updatedTagsetStatuses = this.state.tagsetStatuses;
        updatedTagsetStatuses[tagset] = newStatus;
        var updatedTagsets = this.state.tagsets;
        for (var tag in this.state.tagsets[tagset]) {
            updatedTagsets[tagset][tag].status = newStatus;
        }
        this.setState({
            tagsetStatuses: updatedTagsetStatuses,
            tagsets: updatedTagsets,
            contentRequestAlreadySubmitted: false
        });
        this.sendTaggedContentRequest(updatedTagsets);
    }

    toggleTagStatus(tagset, tag, event) {
        event.stopPropagation();  // Prevents the dropdown from closing
        var currentStatus = this.state.tagsets[tagset][tag].status;
        var newStatus = this.cycleStatus(currentStatus);
        var updatedTagsets = this.state.tagsets;
        updatedTagsets[tagset][tag].status = newStatus;
        this.setState({
            tagsets: updatedTagsets,
            contentRequestAlreadySubmitted: false
        });
        this.sendTaggedContentRequest(updatedTagsets);
    }

    updateTagFrequency(tagset, tag, status, event) {
        var newFrequency = event.target.value;
        var updatedTagsets = this.state.tagsets;
        updatedTagsets[tagset][tag].frequency = newFrequency;
        this.setState({
            tagsets: updatedTagsets,
            contentRequestAlreadySubmitted: false
        });
        if (!isNaN(newFrequency) && newFrequency != ''){
            this.sendTaggedContentRequest(updatedTagsets);
        }
    }

    getTagColorFromStatus(currentStatus) {
        if (currentStatus == 'required'){
            return 'success'
        }
        else if (currentStatus == 'enabled'){
            return 'default'
        }
        // assume currentStatus = 'disabled'
        return 'danger'
    }

    cycleStatus(currentStatus) {
        if (currentStatus == 'enabled'){
            return 'required'
        }
        else if (currentStatus == 'required'){
            return 'disabled'
        }
        return 'enabled'
    }

    sendTaggedContentRequest(tagsets) {
        // Productionist requires tags to be formatted as `tagset:tag` strings
        var contentRequest = []
        for (var tagset in tagsets) {
            for (var tag in tagsets[tagset]) {
                contentRequest.push({
                    name: tagset + ':' + tag,
                    frequency: tagsets[tagset][tag].frequency,
                    status: tagsets[tagset][tag].status
                })
            }
        }
        ajax({
            url: $SCRIPT_ROOT + '/api/grammar/tagged_content_request',
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                tags: contentRequest,
                bundleName: this.state.bundleName
            }),
            async: true,
            cache: false,
            success: (data) => {
              if (data != 'The content request cannot be satisfied by the exported content bundle.'){
                data = JSON.parse(data)
                var sortedTags = data.tags.sort();
                this.setState({
                  generatedContentPackageText: data.text,
                  generatedContentPackageTags: sortedTags,
                  generatedContentPackageTreeExpression: data.treeExpression,
                  generatedContentPackageBracketedExpression: data.bracketedExpression,
                  outputError: false,
                  contentRequestAlreadySubmitted: true
                })
              }
              else {
                this.setState({
                    outputError: true,
                    contentRequestAlreadySubmitted: true
                })
              }
            },
            error: function(err){
                alert('There was an error. Consult your Python console for more details.');
            }
        })
    }

    viewGeneratedText() {
        this.setState({
            showText: true,
            showTags: false,
            showTreeExpression: false
        })
    }

    viewGeneratedTags() {
        this.setState({
            showText: false,
            showTags: true,
            showTreeExpression: false
        })
    }

    viewGeneratedTreeExpression() {
        this.setState({
            showText: false,
            showTags: false,
            showTreeExpression: true
        })
    }

    getTagsetsFromBundle(bundleName) {
        var grammar = null;
        ajax({
            url: $SCRIPT_ROOT + '/api/load_bundle',
            type: "POST",
            contentType: "application/json",
            data: bundleName,
            async: false,
            cache: false,
            success: function(data){
                grammar = data;
            }
        })
        grammar = JSON.parse(grammar);
        var tagsets = {};
        for (var i = 0; i < Object.keys(grammar.id_to_tag).length; i++) {
            var tagsetAndTag = grammar.id_to_tag[i];
            var tagset = tagsetAndTag.split(':')[0];
            var tag = tagsetAndTag.split(':')[1];
            if (!(tagset in tagsets)) {
                tagsets[tagset] = {};
            }
            tagsets[tagset][tag] = {
                name: tag,
                frequency: 0,
                status: 'enabled'
            }
        }
        return tagsets;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.bundleName !== ''){
            var tagsets = this.getTagsetsFromBundle(nextProps.bundleName);
            var tagsetStatuses = {};
            for (var tagset in tagsets) {
                tagsetStatuses[tagset] = "enabled";
            }
            this.setState({
                bundleName: nextProps.bundleName,
                tagsets: tagsets,
                tagsetStatuses: tagsetStatuses
            });
        }
        else {
            // This happens when the tool starts up, since this modal is actually constructed at that time
            this.setState({bundleName: nextProps.bundleName})
        }
    }

    render() {
        var disabledHoverText = !this.state.generatedContentPackageText ? ' (disabled: must submit content request)' : ' (disabled: current view)';
        return (
            <Modal show={this.props.show} onHide={this.props.onHide} dialogClassName="test-productionist-module-modal" style={{overflowY: "hidden"}}>
                <Modal.Header closeButton>
                    <Modal.Title>Test Productionist module...</Modal.Title>
                </Modal.Header>
                <div id="tags">
                    <ButtonGroup className="btn-test" id='tagsList' style={{width: "100%", backgroundColor: "#f2f2f2", marginBottom: '0px'}}>
                        <Button className="grp_button" onClick={this.sendTaggedContentRequest.bind(this, this.state.tagsets)} title={this.state.contentRequestAlreadySubmitted ? "Resubmit content request" : "Submit content request"} style={{height: '38px'}}><Glyphicon glyph={this.state.contentRequestAlreadySubmitted ? "refresh" : "play"}/></Button>
                        <Button className="grp_button" onClick={this.viewGeneratedText} title={this.state.showText || !this.state.generatedContentPackageText ? "Change to text view" + disabledHoverText : "Change to text view"} style={this.state.showText && this.state.generatedContentPackageText ? {height: '38px', backgroundColor: "#ffe97f"} : {height: '38px'}} disabled={this.state.showText || !this.state.generatedContentPackageText}><Glyphicon glyph="font"/></Button>
                        <Button className="grp_button" onClick={this.viewGeneratedTags} title={this.state.showTags || !this.state.generatedContentPackageText ? "Change to tags view" + disabledHoverText : "Change to tags view"} style={this.state.showTags ? {height: '38px', backgroundColor: "#ffe97f"} : {height: '38px'}} disabled={this.state.showTags || !this.state.generatedContentPackageText}><Glyphicon glyph="tags"/></Button>
                        <Button className="grp_button" onClick={this.viewGeneratedTreeExpression} title={this.state.showTreeExpression || !this.state.generatedContentPackageText ? "Change to tree view" + disabledHoverText : "Change to tree view"} style={this.state.showTreeExpression ? {height: '38px', backgroundColor: "#ffe97f"} : {height: '38px'}} disabled={this.state.showTreeExpression || !this.state.generatedContentPackageText}><Glyphicon glyph="tree-conifer"/></Button>
                        {
                            Object.keys(this.state.tagsets).map(function (tagset) {
                                return (
                                    <DropdownButton className="grp-button" id={tagset} title={tagset} bsStyle={this.getTagColorFromStatus(this.state.tagsetStatuses[tagset])} style={{'height': '38px'}}>
                                        <MenuItem key={-1} header={true} style={{"backgroundColor": "transparent"}}>
                                            <Button title={"Toggle status in content request for all tags in this set (to: " + this.cycleStatus(this.state.tagsetStatuses[tagset]) + ")"} onClick={this.toggleTagsetStatus.bind(this, tagset)} bsStyle={this.getTagColorFromStatus(this.state.tagsetStatuses[tagset])}><Glyphicon glyph="adjust"/></Button>
                                        </MenuItem>
                                        {
                                            Object.keys(this.state.tagsets[tagset]).sort().map(function (tag) {
                                                var status = this.state.tagsets[tagset][tag].status;
                                                return (
                                                    <MenuItem key={tagset + ":" + tag} style={{backgroundColor: "transparent"}}>
                                                        <Button title={"Toggle tag status in content request (currently: " + status + ")"} bsStyle={status === "required" ? "success" : status === "disabled" ? "danger" : "default"} style={{padding: "0px 10px 0px 10px", textAlign: "left", height: "32px", width: status === "enabled" ? "calc(100% - 50px)" : "100%", overflowX: 'hidden'}} key={tag} onClick={this.toggleTagStatus.bind(this, tagset, tag)}>{tag}</Button>
                                                        {
                                                            status === "enabled"
                                                            ?
                                                            <FormControl className="test-productionist-module-modal-utility-form" title="Modify tag utility in content request" type="number" value={this.state.tagsets[tagset][tag].frequency} onClick={e => e.stopPropagation()} onChange={this.updateTagFrequency.bind(this, tagset, tag, status)} style={status === 'enabled' ? {display: 'inline', width: '50px', height: '32px', float: 'right', border: "0px", padding: "5px"} : {display: 'none'}}/>
                                                            :
                                                            ""
                                                        }
                                                    </MenuItem>
                                                )
                                            }.bind(this))
                                        }
                                    </DropdownButton>
                                )
                            }.bind(this))
                        }
                    </ButtonGroup>
                </div>
                <Alert bsStyle="danger" style={{display: this.state.outputError === true ? 'block' : 'none'}}>
                  Content request is unsatisfiable.
                </Alert>
                <div style={{whiteSpace: 'pre-wrap', marginBottom: '20px', height: '80vh', }}>
                    {
                        this.state.showText
                        ?
                        this.state.generatedContentPackageText
                        :
                        this.state.showTags
                        ?
                        this.state.generatedContentPackageTags.map(tag => (
                            this.state.generatedContentPackageTags.indexOf(tag) === 0
                            ?
                            <span>
                                * {tag}
                            </span>
                            :
                            <span>
                                <br/>* {tag}
                            </span>
                        ))
                        :
                        this.state.generatedContentPackageTreeExpression
                    }
                </div>
            </Modal>
        );
    }
}

module.exports = TestModal;
