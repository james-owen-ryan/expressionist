{/*This will contain the Individual NonterminalSymbols which are nested within NonterminalList*/
}
var React = require('react')
var ListGroupItem = require('react-bootstrap').ListGroupItem
var Glyphicon = require('react-bootstrap').Glyphicon
var LinkContainer = require('react-router-bootstrap').LinkContainer

class Nonterminal extends React.Component {

    render() {
        var deep_glyph = ""
        if (this.props.deep === true)
            deep_glyph = <Glyphicon glyph="asterisk"/>

        var button_title = this.props.name

        return (
            <ListGroupItem title={button_title} bsSize="xsmall" bsStyle={this.props.complete ? "success" : "danger" }
                       onClick={this.props.onClick}>{deep_glyph} {this.props.name}</ListGroupItem>
        );
    }
}

module.exports = Nonterminal;
