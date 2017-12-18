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
                async: false,
                cache: false
            })
            this.props.updateFromServer()
        }
    }

    handleMarkupAdd(set) {
        var markupTag = window.prompt("Enter tag name.")
        if (markupTag != "") {
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
                    async: true,
                    cache: false
                })
                this.props.updateFromServer()
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
            async: false,
            cache: false
        })
        this.props.updateFromServer()
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
                async: true,
                cache: false
            })
            this.props.updateFromServer()
        }
    }

    handleNewNameValueChange(e) {
        this.setState({'newNameVal': e.target.value})
    }

    handleTagsetDelete(){
        var prompt = window.prompt("Type 'YES' to delete this tagset.")
        if (prompt != "YES"){
            return false;
        }
        var object = {tagsetName: this.props.name}
        ajax({
            url: $SCRIPT_ROOT +'/api/markup/deletetagset',
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(object),
            async: true,
            cache: false
        })
        this.props.updateFromServer()
    }

    disableNewNameValue(){
        if (this.state.newNameVal == ''){
            return true
        }
        return false
    }

    render() {
        var tagset_rep = this.props.name
        var out_arr = []
        var total_length = this.props.current_set.length
        var any = 0


        var successStyle = {
            backgroundColor: "#57F7E0",
        }
        var tmp_sort = this.props.current_set
        tmp_sort.sort()

        out_arr.push(
            <div>
                <MenuItem key={-1} header={true}>
                    <Button style={{backgroundColor: 'white'}} onClick={this.handleMarkupAdd.bind(this, tagset_rep)}><Glyphicon glyph="plus"/></Button>
                    <Button style={{backgroundColor: 'white'}} onClick={this.handleTagsetDelete.bind(this, tagset_rep)}><Glyphicon glyph="minus"/></Button>
                    <Button style={{backgroundColor: 'white'}} onClick={this.handleMarkupSetRename.bind(this, 1)}><Glyphicon glyph="pencil"/></Button>
                </MenuItem>
                <MenuItem divider={true}></MenuItem>
            </div>
        );

        for (var tag = 0; total_length > tag; tag++) {
            var current_tag = tmp_sort[tag]
            //if the tag is present in the nonterminal
            if (this.props.present_nt.indexOf(current_tag) != -1) {
                out_arr.push(<MenuItem style={successStyle} key={tag} onClick={this.handleMarkupClick.bind(this, tagset_rep, current_tag)}>{current_tag}</MenuItem>);
                any = 1;
            }
            else {
                out_arr.push(<MenuItem bsStyle='default' onClick={this.handleMarkupClick.bind(this, tagset_rep, current_tag)} key={tag}>{current_tag}</MenuItem>);
            }

        }

        out_arr.push(<MenuItem divider={true}></MenuItem>)

        out_arr.push(<MenuItem bsStyle='primary' key={total_length+1} onClick={this.handleMarkupRename.bind(this, tagset_rep)}>Rename Tag</MenuItem>);

        if (this.props.name.indexOf('/this is a new markupset/') != -1){
            return(
                <ButtonGroup title={this.props.name} style={{padding: '5px', backgroundColor: '#F2F2F2'}}>
                    <input type='text' onChange={this.handleNewNameValueChange} value={this.state.newNameVal} style={{height: '20px', backgroundColor: 'white', padding: '5px', width: '175px', marginRight: '5px'}} placeholder='Enter tagset name.'/>
                    <div style={{'display': 'inline'}}>
                        <Button onClick={this.handleMarkupSetRename} title="new markup set" bsSize="small" bsStyle="success" style={{marginRight: '5px'}} disabled={this.disableNewNameValue()}><Glyphicon glyph="ok"/></Button>
                        <Button onClick={this.handleTagsetDelete} title="delete markup set" bsSize="small" bsStyle="danger"><Glyphicon glyph="remove"/></Button>
                    </div>
                </ButtonGroup>
            )
        } else {
            return (
                <DropdownButton className="grp-button" id={this.props.name} title={this.props.name} bsStyle={any ? 'success' : 'default'} style={{'height': '38px'}}>
                    {out_arr}
                </DropdownButton>
            );
        }
    }
}

module.exports = MarkupSet;
