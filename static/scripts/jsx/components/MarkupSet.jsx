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
        this.handleMarkupRename = this.handleMarkupRename.bind(this);
        this.disableNewNameValue = this.disableNewNameValue.bind(this);
        this.handleNewNameValueChange = this.handleNewNameValueChange.bind(this);
        this.handleTagsetDelete = this.handleTagsetDelete.bind(this);
        this.isThisTagInCurrentlySelectedNT = this.isThisTagInCurrentlySelectedNT.bind(this);
        this.submitTagsetNameOnEnterKeypress = this.submitTagsetNameOnEnterKeypress.bind(this);
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

    handleMarkupRename(set) {
        var oldTag = window.prompt("Please enter the original tag name.")
        var markupTag = window.prompt("Please enter the new tag name.")
        if ( markupTag != "" && oldTag != "" ){
            var object = {
                "markupset": set,
                "oldtag": oldTag,
                "newtag": markupTag
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

    handleNewNameValueChange(e) {
        this.setState({'newNameVal': e.target.value})
    }

    handleTagsetDelete(){
        var prompt = window.confirm("Are you sure you'd like to delete this tagset?");
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
            return <MenuItem style={{backgroundColor: "#57F7E0"}} key={tag} onClick={this.handleMarkupClick.bind(this, this.props.name, tag)}>{tag}</MenuItem>;
        }
        else {
            return <MenuItem bsStyle='default' onClick={this.handleMarkupClick.bind(this, this.props.name, tag)} key={tag}>{tag}</MenuItem>;
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
                        <Button id="newTagsetNameInputElementButton" onClick={this.handleMarkupSetRename} title="new markup set" bsSize="small" bsStyle="success" style={{marginBottom: '3px', fontSize: '11px'}} disabled={this.disableNewNameValue()}><Glyphicon glyph="ok"/></Button>
                        <Button onClick={this.handleTagsetDelete} title="delete markup set" bsSize="small" bsStyle="danger" style={{marginBottom: '3px', fontSize: '11px'}}><Glyphicon glyph="remove"/></Button>
                    </div>
                </ButtonGroup>
            )
        } else {
            return (
                <DropdownButton className="grp-button" id={this.props.name} title={this.props.name} bsStyle={this.isThisTagInCurrentlySelectedNT('/any/') ? 'success' : 'default'} style={{'height': '38px'}} className='nohover'>
                    <div>
                        <MenuItem key={-1} header={true}>
                            <Button style={{backgroundColor: 'white'}} onClick={this.handleMarkupAdd.bind(this, this.props.name)}><Glyphicon glyph="plus"/></Button>
                            <Button style={{backgroundColor: 'white'}} onClick={this.handleTagsetDelete.bind(this, this.props.name)}><Glyphicon glyph="minus"/></Button>
                            <Button style={{backgroundColor: 'white'}} onClick={this.handleMarkupSetRename.bind(this, 1)}><Glyphicon glyph="pencil"/></Button>
                        </MenuItem>
                        <MenuItem divider={true}></MenuItem>
                    </div>
                    { this.props.current_set.sort().map((tag) => this.isThisTagInCurrentlySelectedNT(tag)) }
                    <MenuItem divider={true}></MenuItem>
                    <MenuItem bsStyle='primary' key={this.props.current_set.length+1} onClick={this.handleMarkupRename.bind(this, this.props.name)}>Rename Tag</MenuItem>
                </DropdownButton>
            );
        }
    }
}

module.exports = MarkupSet;
