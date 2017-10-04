var React = require('react')
var Button = require('react-bootstrap').Button
var Glyphicon = require('react-bootstrap').Glyphicon
var Panel = require('react-bootstrap').Panel
var ListGroupItem = require('react-bootstrap').ListGroupItem
var ListGroup = require('react-bootstrap').ListGroup

var NonterminalBoard = React.createClass({
    PropTypes: {
        name: React.PropTypes.string,
        nonterminal: React.PropTypes.object,
        expand: React.PropTypes.func,
        setDeep: React.PropTypes.func
    },

    handleClickerThing: function(object){
        var idx = object.index
        var symbol = object.symbol
        //console.log(idx)
        //console.log(symbol)
        return <ListGroupItem
            onClick={this.props.onRuleClickThrough.bind(null, symbol, idx)}>{object['expansion']}</ListGroupItem>
    },
    render: function () {

        var expand
        var rules
        var markup
        var glyph_nt
        if (this.props.nonterminal) {
            var name = this.props.name
            var deep_str = ""
            if (this.props.nonterminal && this.props.nonterminal.deep) {
                deep_str = "Toggle Top-Level"
                glyph_nt = <Glyphicon glyph="asterisk"/>
            }
            else {
                deep_str = "Toggle Top-Level"
                glyph_nt = <Glyphicon glyph="remove"/>
            }
            //console.log(this.props.referents)
            if( this.props.referents != []) {
                var referents = this.props.referents.map(this.handleClickerThing)
            }
        }

        return (
            <div>
                <div style={{"width": "70%", "margin": "0 auto", "float": "center"}}>
                    <h1>
                    <span style={{"padding": "5px"}}>{name}</span>
                    <br></br>
                    <Button bsStyle={this.props.nonterminal.deep ? "success" : "danger" }
                                         onClick={this.props.setDeep} title={deep_str}>{glyph_nt}</Button>
                    <Button onClick={this.props.expand} title="Test"><Glyphicon
                        glyph="resize-full"/></Button>
                    <Button onClick={this.props.rename} title="Rename">
                        Rename</Button>
                    <Button onClick={this.props.delete_nt}
                            title="Delete"> Delete</Button>
                    </h1>
                </div>

                <div style={{"width": "70%", "float": "left"}}>
                    <Panel>
                        <ListGroup style={{"maxHeight": "320", "overflowY": "auto"}}>
                            {referents}
                        </ListGroup>
                    </Panel>
                </div>

            </div>
        )

    }


});

module.exports = NonterminalBoard
