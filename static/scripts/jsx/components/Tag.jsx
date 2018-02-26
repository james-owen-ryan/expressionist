var React = require('react')
var MenuItem = require('react-bootstrap').MenuItem
var ajax = require('jquery').ajax
var Glyphicon = require('react-bootstrap').Glyphicon

class Tag extends React.Component {

    constructor(props) {
        super(props);
        this.handleMarkupClick = this.handleMarkupClick.bind(this);
        this.state = {}
    }

    handleMarkupClick() {
        if (this.props.currentNonterminal != "") {
            var object = {
                "nonterminal": this.props.currentNonterminal,
                "markupSet": this.props.tagset_name,
                "tag": this.props.name
            }
            ajax({
                url: $SCRIPT_ROOT + '/api/markup/toggle',
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(object),
            })
            this.props.updateFromServer()
        }
    }

    render(){
        return (
            <MenuItem style={this.props.highlighted ? {backgroundColor: '#57F7E0'} : {}} key={this.props.name} onClick={this.handleMarkupClick}>{this.props.name}{<Glyphicon glyph="ok"/>}{<Glyphicon glyph="remove"/>}</MenuItem>
        )
    }
}

module.exports = Tag;