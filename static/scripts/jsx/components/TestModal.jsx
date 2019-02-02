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


const AUTHOR_IS_USING_A_MAC = navigator.platform.toUpperCase().indexOf('MAC') >= 0;


class TestModal extends React.Component {

    constructor(props) {
        super(props);
        this.toggleTagsetStatus = this.toggleTagsetStatus.bind(this);
        this.updateTagFrequency = this.updateTagFrequency.bind(this);
        this.toggleTagStatus = this.toggleTagStatus.bind(this);
        this.getTagColorFromStatus = this.getTagColorFromStatus.bind(this);
        this.cycleStatus = this.cycleStatus.bind(this);
        this.startStateEditing = this.startStateEditing.bind(this);
        this.lockProductionistStateStr = this.lockProductionistStateStr.bind(this);
        this.unlockProductionistStateStr = this.unlockProductionistStateStr.bind(this);
        this.updateProductionistStateStr = this.updateProductionistStateStr.bind(this);
        this.stopStateEditing = this.stopStateEditing.bind(this);
        this.sendTaggedContentRequest = this.sendTaggedContentRequest.bind(this);
        this.viewGeneratedText = this.viewGeneratedText.bind(this);
        this.viewGeneratedTags = this.viewGeneratedTags.bind(this);
        this.viewGeneratedTreeExpression = this.viewGeneratedTreeExpression.bind(this);
        this.viewProductionistState = this.viewProductionistState.bind(this);
        this.handlePotentialHotKeyPress = this.handlePotentialHotKeyPress.bind(this);
        this.changeToLockedStateView = this.changeToLockedStateView.bind(this);
        this.changeToUpdatedStateView = this.changeToUpdatedStateView.bind(this);
        this.state = {
            grammarFileNames: [],
            tagsets: [],
            tagsetStatuses: {},
            bundleName: '',
            bundlesList: [],
            generatedContentPackageText: null,
            generatedContentPackageTags: [],
            generatedContentPackageTreeExpression: '',
            lockedProductionistStateStr: null,
            productionistStateStr: '{}',  // The state is represented as a JSON string
            editingState: false,
            outputError: false,
            contentRequestAlreadySubmitted: false,
            showText: true,
            showTags: false,
            showTreeExpression: false,
            showState: false,
            viewLockedState: false
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

    startStateEditing() {
        this.unlockProductionistStateStr();
        this.setState({
            editingState: true,
            // The state is now out of sync with regard to the other views, so reset the state
            // that drives them, thereby disabling those other views and reverting the button
            // for submitting a content request to 'submit' state as opposed to 'resubmit' state
            generatedContentPackageText: null,
            generatedContentPackageTags: [],
            generatedContentPackageTreeExpression: '',
            contentRequestAlreadySubmitted: false
        });
    }

    updateProductionistStateStr(e) {
        if (e.target.value === '') {
            var newProductionistStateStr = '{}';
        }
        else {
            var newProductionistStateStr = e.target.value;
        }
        this.setState({productionistStateStr: newProductionistStateStr});
    }

    lockProductionistStateStr() {
        this.setState({
            lockedProductionistStateStr: this.state.productionistStateStr,
            viewLockedState: true
        })
    }

    unlockProductionistStateStr() {
        var newProductionistStateStr = this.state.viewLockedState ? this.state.lockedProductionistStateStr : this.state.productionistStateStr;
        this.setState({
            productionistStateStr: newProductionistStateStr,
            lockedProductionistStateStr: null,
            viewLockedState: false,
        })
    }

    stopStateEditing() {
        this.setState({editingState: false});
    }

    changeToLockedStateView() {
        this.setState({viewLockedState: true});
    }

    changeToUpdatedStateView() {
        this.setState({viewLockedState: false});
    }

    sendTaggedContentRequest(tagsets) {
        // Turn off state editing, in case it was on
        this.setState({editingState: false})
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
            url: $SCRIPT_ROOT + '/api/grammar/content_request',
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                tags: contentRequest,
                bundleName: this.state.bundleName,
                state: this.state.lockedProductionistStateStr ? this.state.lockedProductionistStateStr : this.state.productionistStateStr
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
                    // JSON.stringify allows us to pretty-print the state in Expressionist
                    productionistStateStr: JSON.stringify(JSON.parse(data.state), null, 4),
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
            showTreeExpression: false,
            showState: false
        })
    }

    viewGeneratedTags() {
        this.setState({
            showText: false,
            showTags: true,
            showTreeExpression: false,
            showState: false
        })
    }

    viewGeneratedTreeExpression() {
        this.setState({
            showText: false,
            showTags: false,
            showTreeExpression: true,
            showState: false
        })
    }

    viewProductionistState() {
        this.setState({
            showText: false,
            showTags: false,
            showTreeExpression: false,
            showState: true
        })
    }

    handlePotentialHotKeyPress(e) {
        if (e.key === 'Tab' && this.props.show) {
            e.preventDefault();
            if (!this.state.editingState) {
                // Tab switches to a new view
                if (this.state.generatedContentPackageText === null || this.state.outputError) {
                    // If all the other views are disabled, go to the state view
                    this.viewProductionistState();
                }
                else if (this.state.showText) {
                    if (e.shiftKey) {
                        this.viewProductionistState();
                    }
                    else {
                        this.viewGeneratedTags();
                    }
                }
                else if (this.state.showTags) {
                    if (e.shiftKey) {
                        this.viewGeneratedText();
                    }
                    else {
                        this.viewGeneratedTreeExpression();
                    }
                }
                else if (this.state.showTreeExpression) {
                    if (e.shiftKey) {
                        this.viewGeneratedTags();
                    }
                    else {
                        this.viewProductionistState();
                    }

                }
                else if (this.state.showState) {
                    if (e.shiftKey) {
                        this.viewGeneratedTreeExpression();
                    }
                    else {
                        this.viewGeneratedText();
                    }

                }
            }
            else if (this.state.editingState) {
                // Tab inserts whitespace
                var stateEditInput = document.getElementById("stateEditInput")
                var cursorPositionStart = stateEditInput.selectionStart;
                var cursorPositionEnd = stateEditInput.selectionEnd;
                var stateStr = this.state.viewLockedState ? this.state.lockedProductionistStateStr : this.state.productionistStateStr;
                var stateStrWithWhitespaceInserted = stateStr.slice(0, cursorPositionStart) + '    ' + stateStr.slice(cursorPositionEnd)
                var callbackToMoveCursorOnceStateIsSet = function () { this.props.moveCursorToPositionOrRange.call(null, "stateEditInput", cursorPositionStart+4, cursorPositionStart+4); };
                if (this.state.viewLockedState) {
                    this.setState({lockedProductionistStateStr: stateStrWithWhitespaceInserted}, callbackToMoveCursorOnceStateIsSet);
                }
                else {
                    this.setState({productionistStateStr: stateStrWithWhitespaceInserted}, callbackToMoveCursorOnceStateIsSet);
                }
            }
        }
        else {
            // Check for a hot-key match (ctrl/command + ...)
            var viewLockedStateHotKeyMatch = false; // up
            var viewUpdatedStateHotKeyMatch = false; // down
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'ArrowUp') {
                    // Disable this if the author is editing the state or the state has not been locked
                    if (this.state.lockedProductionistStateStr && !this.state.editingState) {
                        e.preventDefault();
                        viewLockedStateHotKeyMatch = true;
                    }
                }
                else if (e.key === 'ArrowDown') {
                    // Disable this if the author is editing the state or the state has not been locked
                    if (this.state.lockedProductionistStateStr && !this.state.editingState) {
                        e.preventDefault();
                        viewUpdatedStateHotKeyMatch = true;
                    }
                }
            }
            if (viewLockedStateHotKeyMatch) {
                this.setState({viewLockedState: true});
            }
            else if (viewUpdatedStateHotKeyMatch) {
                this.setState({viewLockedState: false});
            }
        }
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

    componentDidMount() {
        document.addEventListener("keydown", this.handlePotentialHotKeyPress, false);
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
        var viewButtonsDisabledTooltip = this.state.generatedContentPackageText === null ? " (disabled: must submit content request)" : this.state.outputError ? " (disabled: unsatisfiable content request)" : "";
        var viewButtonsDisabled = !!viewButtonsDisabledTooltip;
        return (
            <Modal show={this.props.show} onHide={this.props.onHide} dialogClassName="test-productionist-module-modal" style={{overflowY: "hidden"}}>
                <Modal.Header closeButton>
                    <Modal.Title>Test Productionist module...</Modal.Title>
                </Modal.Header>
                <div id="tags">
                    <ButtonGroup className="btn-test" id='tagsList' style={{width: "100%", backgroundColor: "#f2f2f2", marginBottom: '0px'}}>
                        <Button id="testModalPlayButton" className="grp_button" onClick={this.sendTaggedContentRequest.bind(this, this.state.tagsets)} title={this.state.outputError ? "Resubmit content request (disabled: unsatisfiable content request)" : this.state.contentRequestAlreadySubmitted ? AUTHOR_IS_USING_A_MAC ? "Resubmit content request (⌘↩)" : "Resubmit content request (Ctrl+Enter)" : AUTHOR_IS_USING_A_MAC ? "Submit content request (⌘↩)" : "Submit content request (Ctrl+Enter)"} style={{height: '38px'}} disabled={this.state.outputError} bsStyle={this.props.playButtonIsJuicing ? 'success' : 'default'}><Glyphicon glyph={this.state.contentRequestAlreadySubmitted ? "refresh" : "play"}/></Button>
                        <Button className="grp_button" onClick={this.viewGeneratedText} title={viewButtonsDisabledTooltip ? "Change to text view" + viewButtonsDisabledTooltip : AUTHOR_IS_USING_A_MAC ? "Change to text view (toggle: ⇥, ⇧⇥)" : "Change to text view (toggle: Tab, Shift+Tab)"} style={this.state.showText && this.state.generatedContentPackageText !== null && !this.state.outputError ? {height: '38px', backgroundColor: "#ffe97f"} : {height: '38px'}} disabled={viewButtonsDisabled}><Glyphicon glyph="font"/></Button>
                        <Button className="grp_button" onClick={this.viewGeneratedTags} title={viewButtonsDisabledTooltip ? "Change to text view" + viewButtonsDisabledTooltip : AUTHOR_IS_USING_A_MAC ? "Change to tags view (toggle: ⇥, ⇧⇥)" : "Change to tags view (toggle: Tab, Shift+Tab)"} style={this.state.showTags && this.state.generatedContentPackageText !== null && !this.state.outputError ? {height: '38px', backgroundColor: "#ffe97f"} : {height: '38px'}} disabled={viewButtonsDisabled}><Glyphicon glyph="tags"/></Button>
                        <Button className="grp_button" onClick={this.viewGeneratedTreeExpression} title={viewButtonsDisabledTooltip ? "Change to text view" + viewButtonsDisabledTooltip : AUTHOR_IS_USING_A_MAC ? "Change to tree view (toggle: ⇥, ⇧⇥)" : "Change to tree view (toggle: Tab, Shift+Tab)"} style={this.state.showTreeExpression && this.state.generatedContentPackageText !== null && !this.state.outputError ? {height: '38px', backgroundColor: "#ffe97f"} : {height: '38px'}} disabled={viewButtonsDisabled}><Glyphicon glyph="tree-conifer"/></Button>
                        <Button className="grp_button" onClick={this.viewProductionistState} title={AUTHOR_IS_USING_A_MAC ? "Change to state view (toggle: ⇥, ⇧⇥)" : "Change to state view (toggle: Tab, Shift+Tab)"} style={this.state.showState ? {height: '38px', backgroundColor: "#ffe97f"} : {height: '38px'}}><Glyphicon glyph="list-alt"/></Button>
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
                {
                    this.state.outputError
                    ?
                    <div style={{backgroundColor: '#ff9891', color: '#fff', height: '70vh', padding: '25px', fontSize: '18px'}}>Content request is unsatisfiable given the exported content bundle.</div>
                    :
                    <div style={this.state.editingState ? {whiteSpace: 'pre-wrap', height: '70vh', overflowY: 'scroll', backgroundColor: "#f2f2f2", padding: '25px'} : {whiteSpace: 'pre-wrap', height: '70vh', overflowY: 'scroll', backgroundColor: "#fff", fontSize: '18px', padding: '25px'}}>
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
                            this.state.showTreeExpression
                            ?
                            this.state.generatedContentPackageTreeExpression
                            :
                            this.state.editingState
                            ?
                            <textarea id="stateEditInput" type='text' title="Submit a content request or click outside this area to freeze your changes." value={this.state.lockedProductionistStateStr ? this.state.lockedProductionistStateStr : this.state.productionistStateStr} onChange={this.updateProductionistStateStr} onBlur={this.stopStateEditing} style={{position: "relative", width: '100%', height: '100%', border: '0px', fontSize: '18px', backgroundColor: '#f2f2f2', overflowY: 'scroll', resize: 'none'}} autoFocus="true"/>
                            :
                            <div>
                                <div style={{position: 'relative', height: '60vh', width: '100%'}} onClick={this.startStateEditing}>
                                    <span style={{width: '100%', height: '60vh', overflowY: 'scroll'}}>{this.state.viewLockedState ? this.state.lockedProductionistStateStr : this.state.productionistStateStr}</span>
                                </div>
                                {
                                    this.state.lockedProductionistStateStr
                                    ?
                                    <div style={{height: '10%'}}>
                                        <ButtonGroup style={{position: 'absolute', bottom: '0px', left: '0px'}}>
                                            <Button className="grp_button" onClick={this.state.lockedProductionistStateStr ? this.unlockProductionistStateStr : this.lockProductionistStateStr} title={this.state.lockedProductionistStateStr ? "Unlock this state in the content request (the updated state will always be sent instead)" : "Lock this state in the content request (this state will be resent instead of the updated state)"} style={this.state.lockedProductionistStateStr ? {height: '38px', backgroundColor: "#ffe97f"} : {height: '38px'}}><Glyphicon glyph="lock"/></Button>
                                            <Button className="grp_button" onClick={this.changeToLockedStateView} title={AUTHOR_IS_USING_A_MAC ? "View locked state (⌘↑)" : "View locked state (Ctrl+Up)"} style={this.state.viewLockedState ? {height: '38px', backgroundColor: "#ffe97f"} : {height: '38px'}}><Glyphicon glyph="open"/></Button>
                                            <Button className="grp_button" onClick={this.changeToUpdatedStateView} title={AUTHOR_IS_USING_A_MAC ? "View updated state (⌘↓)" : "View locked state (Ctrl+Down)"} style={this.state.viewLockedState ? {height: '38px'} : {height: '38px', backgroundColor: "#ffe97f"}}><Glyphicon glyph="save"/></Button>
                                        </ButtonGroup>
                                    </div>
                                    :
                                    <div style={{height: '10%'}}>
                                        <Button className="grp_button" onClick={this.state.lockedProductionistStateStr ? this.unlockProductionistStateStr : this.lockProductionistStateStr} title={this.state.lockedProductionistStateStr ? "Unlock this state in the content request (the updated state will always be sent instead)" : "Lock this state in the content request (this state will be resent instead of the updated state)"} style={this.state.lockedProductionistStateStr ? {position: 'absolute', bottom: '0px', left: '0px', height: '38px', backgroundColor: "#ffe97f"} : {position: 'absolute', bottom: '0px', left: '0px', height: '38px'}}><Glyphicon glyph="lock"/></Button>
                                    </div>
                                }
                            </div>
                        }
                    </div>
                }
            </Modal>
        );
    }
}

module.exports = TestModal;
