{/*This will contain the list of nonterminals as nested components,
 as well as a add button to add a new Nonterminal at the bottom of the bar
 This has props of an array of Nonterminals And an Array of Markups representing
 Markups defined in the Grammar.*/
}

var React = require('react');
var Nonterminal = require('./Nonterminal.jsx');
var ListGroupItem = require('react-bootstrap').ListGroupItem;
var ListGroup = require('react-bootstrap').ListGroup;
var Glyphicon = require('react-bootstrap').Glyphicon;

var NonterminalList = React.createClass({
    propTypes: {
        nonterminals: React.PropTypes.object,
        onAddNonterminal: React.PropTypes.func,
        onClickNonterminal: React.PropTypes.func
    },

    render: function () {

        var incomplete = [];
        var complete = [];
        var deep_inc = [];
        var deep_comp = [];


        {/*forgive me for I have sinned*/
        }
        var NT_LIST = Object.keys(this.props.nonterminals);
        var arr_length = NT_LIST.length;
        for (var i = 0; i < arr_length; i++) {
            var current = this.props.nonterminals[NT_LIST[i]];
            if (current.complete === false) {
                if (current.deep === true) {
                    deep_inc.push(<Nonterminal {...current}
                        onClick={this.props.onClickNonterminal.bind(null, NT_LIST[i])} name={NT_LIST[i]}
                        key={NT_LIST[i]}>{NT_LIST[i]}</Nonterminal>);
                }
                else {
                    incomplete.push(<Nonterminal {...current}
                        onClick={this.props.onClickNonterminal.bind(null, NT_LIST[i])} name={NT_LIST[i]}
                        key={NT_LIST[i]}>{NT_LIST[i]}</Nonterminal>);
                }

            }
            else {
                if (current.deep === true) {
                    deep_comp.push(<Nonterminal {...current}
                        onClick={this.props.onClickNonterminal.bind(null, NT_LIST[i])} name={NT_LIST[i]}
                        key={NT_LIST[i]}>{NT_LIST[i]}</Nonterminal>);
                }
                else {
                    complete.push(<Nonterminal {...current}
                        onClick={this.props.onClickNonterminal.bind(null, NT_LIST[i])} name={NT_LIST[i]}
                        key={NT_LIST[i]}>{NT_LIST[i]}</Nonterminal>);
                }
            }
        }
        var total = deep_inc.concat(incomplete.concat(deep_comp.concat(complete)))


        return (

            <div>

                <ListGroup id='nonterminalList'>
                    {total}
                    <ListGroupItem bsSize="xsmall" key="ADDNEW" onClick={this.props.onAddNonterminal}><Glyphicon
                        glyph="plus"/></ListGroupItem>

                </ListGroup>
            </div>
        );
    }
});

module.exports = NonterminalList
