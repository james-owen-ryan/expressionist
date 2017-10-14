var React = require('react')
var DropdownButton = require('react-bootstrap').DropdownButton
var MenuItem = require('react-bootstrap').MenuItem
var Glyphicon = require('react-bootstrap').Glyphicon
var Button = require('react-bootstrap').Button
var ajax = require('jquery').ajax

class MarkupSet extends React.Component {

    constructor(props) {
        super(props);
        this.handleMarkupClick = this.handleMarkupClick.bind(this);
        this.handleMarkupAdd = this.handleMarkupAdd.bind(this);
        this.handleMarkupSetRename = this.handleMarkupSetRename.bind(this);
        this.handleMarkupRename = this.handleMarkupRename.bind(this);
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
        var markupTag = window.prompt("Please enter Markup Tag")
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

    handleMarkupSetRename(set) {
        var newset = window.prompt("Please enter New Markup Set Name")
        if (newset != "") {
            //ensure tag does not exist in tagset
            var object = {
                "oldset": set,
                "newset": newset 
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
    }

    handleMarkupRename(set) {
        var oldTag = window.prompt("Please Enter the name of the original Markup")
        var markupTag = window.prompt("Please enter New Markup Tag")
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
            this.updateFromServer()
        }
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

        for (var tag = 0; total_length > tag; tag++) {
            var current_tag = tmp_sort[tag]
            //if the tag is present in the nonterminal
            if (this.props.present_nt.indexOf(current_tag) != -1) {
                out_arr.push(<MenuItem style={successStyle} key={tag}
                                       onClick={this.handleMarkupClick.bind(this, tagset_rep, current_tag)}
                >{current_tag}</MenuItem>);
                any = 1;
            }
            else {
                out_arr.push(<MenuItem bsStyle='default'
                                       onClick={this.handleMarkupClick.bind(this, tagset_rep, current_tag)}
                                       key={tag}>{current_tag}</MenuItem>);
            }

        }

        out_arr.push(<MenuItem bsStyle='primary' key={total_length}
                               onClick={this.handleMarkupAdd.bind(this, tagset_rep)}><Glyphicon
            glyph="plus"/></MenuItem>);

        out_arr.push(<MenuItem bsStyle='primary' key={total_length+1}
          onClick={this.handleMarkupSetRename.bind(this, tagset_rep)}>Rename Tagset</MenuItem>);

        out_arr.push(<MenuItem bsStyle='primary' key={total_length+2}
          onClick={this.handleMarkupRename.bind(this, tagset_rep)}>Rename Tag</MenuItem>);

        return (
            <DropdownButton className="grp-button" id={this.props.name} title={this.props.name}
                            bsStyle={any ? 'success' : 'default'}>
                {out_arr}
            </DropdownButton>
        );
    }
}

module.exports = MarkupSet;
