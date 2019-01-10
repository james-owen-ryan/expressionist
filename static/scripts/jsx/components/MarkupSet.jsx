var React = require('react')
var DropdownButton = require('react-bootstrap').DropdownButton
var MenuItem = require('react-bootstrap').MenuItem
var Glyphicon = require('react-bootstrap').Glyphicon
var Button = require('react-bootstrap').Button
var ajax = require('jquery').ajax
var ButtonGroup = require('react-bootstrap').ButtonGroup

class MarkupSet extends React.Component {

    constructor(props) {
        super(props);
        this.handleMarkupClick = this.handleMarkupClick.bind(this);
        this.handleMarkupSetRename = this.handleMarkupSetRename.bind(this);
        this.handleTagsetRenameRequest = this.handleTagsetRenameRequest.bind(this);
        this.handleTagRenameRequest = this.handleTagRenameRequest.bind(this);
        this.handleTagDelete = this.handleTagDelete.bind(this);
        this.handleTagSearch = this.handleTagSearch.bind(this);
        this.disableNewTagsetNameValue = this.disableNewTagsetNameValue.bind(this);
        this.handleNewTagsetNameChange = this.handleNewTagsetNameChange.bind(this);
        this.handleTagsetDelete = this.handleTagsetDelete.bind(this);
        this.handleRenameTagsetCancel = this.handleRenameTagsetCancel.bind(this);
        this.prepareTagDropdownItemComponent = this.prepareTagDropdownItemComponent.bind(this);
        this.handleEnterKeypress = this.handleEnterKeypress.bind(this);
        this.toggleBackgroundColor = this.toggleBackgroundColor.bind(this);
        this.prepareForTagsetModification = this.prepareForTagsetModification.bind(this);
        this.state = {
            newTagsetName: '',
            renameTagsetNow: false,
        }
    }

    prepareForTagsetModification() {
        this.props.openAddTagModal(this.props.name, null);
    }

    handleMarkupClick(set, tag, event) {
        event.stopPropagation();
        if (this.props.currentNonterminal != "") {
            var object = {
                "nonterminal": this.props.currentNonterminal,
                "markupSet": set,
                "tag": tag
            }
            ajax({
                url: $SCRIPT_ROOT + '/api/markup/toggle',
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(object),
                success: () => this.props.updateFromServer(),
                cache: false
            })
        }
    }

    handleMarkupSetRename(toggleRename) {
        var object = {
            "oldset": this.props.name,
            "newset": this.state.newTagsetName
        }
        ajax({
            url: $SCRIPT_ROOT + '/api/markup/renameset',
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(object),
            success: () => this.props.updateFromServer(),
            cache: false
        })
    }

    handleTagsetRenameRequest() {
        this.setState({
            newTagsetName: this.props.name,
            renameTagsetNow: true
        })
    }

    handleTagRenameRequest(tagsetName, tagName) {
        this.props.openAddTagModal(tagsetName, tagName);
    }

    handleTagDelete(tagsetName, tagName) {
        var prompt = window.confirm("Are you sure you'd like to delete this tag? It will disappear from any nonterminal symbols to which it may be attached.");
        if (prompt == false){
            return false;
        }
        var object = {
            "tagSet": tagsetName,
            "tagName": tagName
        }
        ajax({
            url: $SCRIPT_ROOT +'/api/markup/removetag',
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(object),
            success: () => this.props.updateFromServer(),
            cache: false
        })
    }

    handleTagSearch(tagsetName, tagName) {
        var query = "$tags:" + tagsetName + ':' + tagName;
        this.props.updateSymbolFilterQuery(query);
    }

    handleNewTagsetNameChange(e) {
        this.setState({'newTagsetName': e.target.value})
    }

    handleTagsetDelete(){
        if (this.props.name.indexOf('/this is a new tagset/') === -1) {
            var prompt = window.confirm("Are you sure you'd like to delete this tagset? All of its tags will disappear, including any that are attached to nonterminal symbols.");
            if (prompt == false){
                return false;
            }
        }
        var object = {tagsetName: this.props.name}
        ajax({
            url: $SCRIPT_ROOT +'/api/markup/deletetagset',
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(object),
            success: () => this.props.updateFromServer(),
            cache: false
        })
    }

    handleRenameTagsetCancel() {
        this.setState({renameTagsetNow: false})
    }

    disableNewTagsetNameValue(){
        if (this.state.newTagsetName == '' || this.props.markups[this.state.newTagsetName] != undefined){
            return true
        }
        return false
    }

    prepareTagDropdownItemComponent(tag){
        var noCurrentNonterminal = (this.props.currentNonterminal == "");
        var ruleBeingWorkedOn = (this.props.currentRule !== -1);
        var tagAttachmentDisabled = (noCurrentNonterminal || ruleBeingWorkedOn);
        var tagAttachButtonsHoverTextDisabledSnippet = ""
        if (noCurrentNonterminal) {
            tagAttachButtonsHoverTextDisabledSnippet = " (disabled: no current symbol)"
        }
        if (ruleBeingWorkedOn) {
            if (this.props.present_nt.indexOf(tag) != -1) {
                tagAttachButtonsHoverTextDisabledSnippet = " (disabled: to remove tag from rule head, go to that symbol)"
            }
            else {
                tagAttachButtonsHoverTextDisabledSnippet = " (disabled: can't attach tags to rules)"
            }
        }
        if (tag == '/any/'){
            return !!this.props.current_set.filter((tag) => this.props.present_nt.indexOf(tag) != -1).length
        }
        if (this.props.present_nt.indexOf(tag) != -1) {
            return <MenuItem key={this.props.current_set + ":" + tag}>
                <Button title="Search for tag usages" id={"tagSearchButton:"+tag} bsStyle="success" onClick={this.handleTagSearch.bind(this, this.props.name, tag)}><Glyphicon glyph="search"/></Button>
                <Button title="Rename tag" id={"tagEditButton:"+tag} bsStyle="success" onClick={this.handleTagRenameRequest.bind(this, this.props.name, tag)}><Glyphicon glyph="pencil"/></Button>
                <Button title="Delete tag" id={"tagDeleteButton:"+tag} bsStyle="success" onClick={this.handleTagDelete.bind(this, this.props.name, tag)}><Glyphicon glyph="trash"/></Button>
                <Button title={"Remove tag from current symbol" + tagAttachButtonsHoverTextDisabledSnippet} id={"tagToggleButton:"+tag} disabled={tagAttachmentDisabled} bsStyle="success" style={{padding: "0px 10px 0px 10px", textAlign: "left", height: "32px", width: "calc(100% - 111px"}} key={tag} onClick={this.handleMarkupClick.bind(this, this.props.name, tag)}>{tag}</Button>
            </MenuItem>;
        }
        else {
            return <MenuItem key={this.props.current_set + ":" + tag}>
                <Button title="Search for tag usages" onClick={this.handleTagSearch.bind(this, this.props.name, tag)}><Glyphicon glyph="search"/></Button>
                <Button title="Rename tag" onClick={this.handleTagRenameRequest.bind(this, this.props.name, tag)}><Glyphicon glyph="pencil"/></Button>
                <Button title="Delete tag" onClick={this.handleTagDelete.bind(this, this.props.name, tag)}><Glyphicon glyph="trash"/></Button>
                <Button title={"Attach tag to current symbol" + tagAttachButtonsHoverTextDisabledSnippet} disabled={tagAttachmentDisabled} style={{padding: "0px 10px 0px 10px", textAlign: "left", height: "32px", width: "calc(100% - 111px"}} onClick={this.handleMarkupClick.bind(this, this.props.name, tag)} key={tag}>{tag}</Button>
            </MenuItem>;
        }
    }

    toggleBackgroundColor(componentId) {
        if (document.getElementById(componentId).style.backgroundColor === "#f2f2f2") {
            document.getElementById(componentId).style.backgroundColor = "#57F7E0"
        }
        else {
            document.getElementById(componentId).style.backgroundColor = "f2f2f2"
        }
    }

    handleEnterKeypress(e) {
        if (e.key === 'Enter') {
            if (document.activeElement.id === "newTagsetNameInputElement") {
                document.getElementById("newTagsetNameInputElementButton").click();
            }
         }
    }

    componentDidMount(){
        document.addEventListener("keydown", this.handleEnterKeypress, false);
    }

    render() {
        if (this.props.name.indexOf('/this is a new tagset/') != -1){
            return (
                <ButtonGroup style={{padding: '4.5px', backgroundColor: '#F2F2F2', }}>
                    <input id="newTagsetNameInputElement" type='text' onChange={this.handleNewTagsetNameChange} value={this.state.newTagsetName} style={{height: '26px', padding: '5px', width: '175px'}} placeholder='Enter tagset name.' autoFocus="true"/>
                    <div style={{'display': 'inline'}}>
                        <Button id="newTagsetNameInputElementButton" onClick={this.handleMarkupSetRename} title={this.disableNewTagsetNameValue() ? "Add tagset (disabled: empty tagset name)" : "Add tagset"} bsSize="small" bsStyle="default" style={{marginBottom: '3px', fontSize: '11px'}} disabled={this.disableNewTagsetNameValue()}><Glyphicon glyph="ok"/></Button>
                        <Button onClick={this.handleTagsetDelete} title="Cancel" bsSize="small" bsStyle="default" style={{marginBottom: '3px', fontSize: '11px'}}><Glyphicon glyph="remove"/></Button>
                    </div>
                </ButtonGroup>
            )
        }
        else if (this.state.renameTagsetNow) {
            return (
                <ButtonGroup style={{padding: '4.5px', backgroundColor: '#F2F2F2'}}>
                    <input id="newTagsetNameInputElement" type='text' onChange={this.handleNewTagsetNameChange} value={this.state.newTagsetName} style={{height: '26px', padding: '5px', width: '175px'}} placeholder='Enter new tagset name.' autoFocus="true"/>
                    <div style={{'display': 'inline'}}>
                        <Button id="newTagsetNameInputElementButton" onClick={this.handleMarkupSetRename} title={this.disableNewTagsetNameValue() ? "Rename tagset (disabled: name hasn't changed)" : "Rename tagset"} bsSize="small" bsStyle="default" style={{marginBottom: '3px', fontSize: '11px'}} disabled={this.disableNewTagsetNameValue()}><Glyphicon glyph="ok"/></Button>
                        <Button onClick={this.handleRenameTagsetCancel} title="Cancel" bsSize="small" bsStyle="default" style={{marginBottom: '3px', fontSize: '11px'}}><Glyphicon glyph="remove"/></Button>
                    </div>
                </ButtonGroup>
            )
        }
        else {
            return (
                <DropdownButton className="grp-button" id={this.props.name} title={this.props.name} bsStyle={this.prepareTagDropdownItemComponent('/any/') ? 'success' : 'default'} style={{'height': '38px'}}>
                    <div>
                        <MenuItem key={-1} header={true} style={{"backgroundColor": "transparent"}}>
                            <Button title="Create new tag" onClick={this.prepareForTagsetModification}><Glyphicon glyph="plus"/></Button>
                            <Button title="Rename tagset" onClick={this.handleTagsetRenameRequest}><Glyphicon glyph="pencil"/></Button>
                            <Button title="Delete tagset" onClick={this.handleTagsetDelete.bind(this, this.props.name)}><Glyphicon glyph="trash"/></Button>
                        </MenuItem>
                    </div>
                    { this.props.current_set.sort().map((tag) => this.prepareTagDropdownItemComponent(tag)) }
                </DropdownButton>
            );
        }
    }
}

module.exports = MarkupSet;
