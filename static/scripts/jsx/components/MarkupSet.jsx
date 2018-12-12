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
        this.handleMarkupAdd = this.handleMarkupAdd.bind(this);
        this.handleMarkupSetRename = this.handleMarkupSetRename.bind(this);
        this.handleTagRename = this.handleTagRename.bind(this);
        this.handleTagDelete = this.handleTagDelete.bind(this);
        this.handleTagSearch = this.handleTagSearch.bind(this);
        this.disableNewNameValue = this.disableNewNameValue.bind(this);
        this.handleNewNameValueChange = this.handleNewNameValueChange.bind(this);
        this.handleTagsetDelete = this.handleTagsetDelete.bind(this);
        this.isThisTagInCurrentlySelectedNT = this.isThisTagInCurrentlySelectedNT.bind(this);
        this.submitTagsetNameOnEnterKeypress = this.submitTagsetNameOnEnterKeypress.bind(this);
        this.toggleBackgroundColor = this.toggleBackgroundColor.bind(this);
        this.state = {
            newNameVal: '',
        }
    }

    handleMarkupClick(set, tag) {
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

    handleMarkupAdd(set) {
        var markupTag = window.prompt("Enter tag name.")
        if (markupTag) {
            //ensure tag does not exist in tagset
            if (this.props.markups[set].indexOf(markupTag) === -1) {
                var object = {
                    "markupSet": set,
                    "tag": markupTag
                }
                ajax({
                    url: $SCRIPT_ROOT + '/api/markup/addtag',
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(object),
                    success: () => this.props.updateFromServer(),
                    cache: false
                })
            }
        }
    }

    handleMarkupSetRename(toggleRename) {
        if (toggleRename == 1){
            this.state.newNameVal = '/this is a new markupset/'+Object.keys(this.props.markups).length
        }
        var object = {
            "oldset": this.props.name,
            "newset": this.state.newNameVal
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

    handleTagRename(tagsetName, tagName) {
        var newTagName = window.prompt("Enter a new tag name.", tagName);
        if (newTagName){
            var object = {
                "markupset": tagsetName,
                "oldtag": tagName,
                "newtag": newTagName
            }
            ajax({
                url: $SCRIPT_ROOT +'/api/markup/renametag',
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(object),
                success: () => this.props.updateFromServer(),
                cache: false
            })
        }
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

    handleNewNameValueChange(e) {
        this.setState({'newNameVal': e.target.value})
    }

    handleTagsetDelete(){
        var prompt = window.confirm("Are you sure you'd like to delete this tagset? All of its tags will disappear, including any that are attached to nonterminal symbols.");
        if (prompt == false){
            return false;
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

    submitTagsetNameOnEnterKeypress(e) {
        if (document.activeElement.id === "newTagsetNameInputElement") {
            if (e.key === 'Enter') {
                document.getElementById("newTagsetNameInputElementButton").click();
            }
        }
    };

    disableNewNameValue(){
        if (this.state.newNameVal == ''){
            return true
        }
        return false
    }

    isThisTagInCurrentlySelectedNT(tag){
        if (tag == '/any/'){
            return !!this.props.current_set.filter((tag) => this.props.present_nt.indexOf(tag) != -1).length
        }

        if (this.props.present_nt.indexOf(tag) != -1) {
            return <MenuItem>
                <Button id={"tagSearchButton:"+tag} style={{backgroundColor: "#57F7E0"}} onClick={this.handleTagSearch.bind(this, this.props.name, tag)} onMouseEnter={this.toggleBackgroundColor.bind(this, "tagSearchButton:"+tag, "rgb(87, 247, 224)", "rgb(255, 233, 127)")} onMouseLeave={this.toggleBackgroundColor.bind(this, "tagSearchButton:"+tag, "rgb(87, 247, 224)", "rgb(255, 233, 127)")}><Glyphicon glyph="pencil"/></Button>
                <Button id={"tagEditButton:"+tag} style={{backgroundColor: "#57F7E0"}} onClick={this.handleTagRename.bind(this, this.props.name, tag)} onMouseEnter={this.toggleBackgroundColor.bind(this, "tagEditButton:"+tag, "rgb(87, 247, 224)", "rgb(255, 233, 127)")} onMouseLeave={this.toggleBackgroundColor.bind(this, "tagEditButton:"+tag, "rgb(87, 247, 224)", "rgb(255, 233, 127)")}><Glyphicon glyph="pencil"/></Button>
                <Button id={"tagDeleteButton:"+tag} style={{backgroundColor: "#57F7E0"}} onClick={this.handleTagDelete.bind(this, this.props.name, tag)} onMouseEnter={this.toggleBackgroundColor.bind(this, "tagDeleteButton:"+tag, "rgb(87, 247, 224)", "rgb(255, 233, 127)")} onMouseLeave={this.toggleBackgroundColor.bind(this, "tagDeleteButton:"+tag, "rgb(87, 247, 224)", "rgb(255, 233, 127)")}><Glyphicon glyph="trash"/></Button>
                <Button id={"tagToggleButton:"+tag} style={{backgroundColor: "#57F7E0", padding: "0", paddingLeft: "10px", textAlign: "left", height: "32px", width: "calc(100% - 111px"}} key={tag} onClick={this.handleMarkupClick.bind(this, this.props.name, tag)} onMouseEnter={this.toggleBackgroundColor.bind(this, "tagToggleButton:"+tag, "rgb(87, 247, 224)", "rgb(255, 233, 127)")} onMouseLeave={this.toggleBackgroundColor.bind(this, "tagToggleButton:"+tag, "rgb(87, 247, 224)", "rgb(255, 233, 127)")}>{tag}</Button>
            </MenuItem>;
        }
        else {
            return <MenuItem>
                <Button onClick={this.handleTagSearch.bind(this, this.props.name, tag)}><Glyphicon glyph="search"/></Button>
                <Button onClick={this.handleTagRename.bind(this, this.props.name, tag)}><Glyphicon glyph="pencil"/></Button>
                <Button onClick={this.handleTagDelete.bind(this, this.props.name, tag)}><Glyphicon glyph="trash"/></Button>
                <Button style={{padding: '0', padding: "0", paddingLeft: "10px", textAlign: "left", height: "32px", width: "calc(100% - 111px"}} onClick={this.handleMarkupClick.bind(this, this.props.name, tag)} key={tag}>{tag}</Button>
            </MenuItem>;
        }
    }

    toggleBackgroundColor(componentId, color1, color2) {
        if (document.getElementById(componentId).style.backgroundColor === color1) {
            document.getElementById(componentId).style.backgroundColor = color2
        }
        else {
            document.getElementById(componentId).style.backgroundColor = color1
        }
    }

    componentDidMount(){
        document.addEventListener("keydown", this.submitTagsetNameOnEnterKeypress, false);
    }

    render() {
        if (this.props.name.indexOf('/this is a new markupset/') != -1){
            return(
                <ButtonGroup title={this.props.name} style={{padding: '4.5px', backgroundColor: '#F2F2F2'}} className='nohover'>
                    <input id="newTagsetNameInputElement" type='text' onChange={this.handleNewNameValueChange} value={this.state.newNameVal} style={{height: '26px', padding: '5px', width: '175px'}} placeholder='Enter tagset name.' autoFocus="true"/>
                    <div style={{'display': 'inline'}}>
                        <Button id="newTagsetNameInputElementButton" onClick={this.handleMarkupSetRename} title="Add tagset" bsSize="small" bsStyle="success" style={{marginBottom: '3px', fontSize: '11px'}} disabled={this.disableNewNameValue()}><Glyphicon glyph="ok"/></Button>
                        <Button onClick={this.handleTagsetDelete} title="Delete tagset" bsSize="small" bsStyle="danger" style={{marginBottom: '3px', fontSize: '11px'}}><Glyphicon glyph="remove"/></Button>
                    </div>
                </ButtonGroup>
            )
        } else {
            return (
                <DropdownButton className="grp-button" id={this.props.name} title={this.props.name} bsStyle={this.isThisTagInCurrentlySelectedNT('/any/') ? 'success' : 'default'} style={{'height': '38px'}} className='nohover'>
                    <div>
                        <MenuItem key={-1} header={true}>
                            <Button onClick={this.handleMarkupAdd.bind(this, this.props.name)}><Glyphicon glyph="plus"/></Button>
                            <Button onClick={this.handleMarkupSetRename.bind(this, 1)}><Glyphicon glyph="pencil"/></Button>
                            <Button onClick={this.handleTagsetDelete.bind(this, this.props.name)}><Glyphicon glyph="trash"/></Button>
                        </MenuItem>
                    </div>
                    { this.props.current_set.sort().map((tag) => this.isThisTagInCurrentlySelectedNT(tag)) }
                </DropdownButton>
            );
        }
    }
}

module.exports = MarkupSet;
