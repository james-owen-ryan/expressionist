{/*This will contain the Individual NonterminalSymbols which are nested within NonterminalList*/
}
var React = require('react')
var ListGroupItem = require('react-bootstrap').ListGroupItem
var Glyphicon = require('react-bootstrap').Glyphicon
var LinkContainer = require('react-router-bootstrap').LinkContainer
var ajax = require('jquery').ajax
var Button = require('react-bootstrap').Button

class Nonterminal extends React.Component {

    constructor(props) {
        super(props);
        this.handleNonterminalDelete = this.handleNonterminalDelete.bind(this);
        this.disableNewNameValue = this.disableNewNameValue.bind(this);
        this.handleNewNameValueChange = this.handleNewNameValueChange.bind(this);
        this.handleNonterminalRename = this.handleNonterminalRename.bind(this);
        this.state = {
            newNameVal: ''
        }
    }

    handleNewNameValueChange(e) {
       this.setState({'newNameVal': e.target.value})
    }

    handleNonterminalRename(e){
        var object = {
            "old": this.props.name,
            "new": this.state.newNameVal
        }
        ajax({
            url: $SCRIPT_ROOT + '/api/nonterminal/rename',
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(object),
            async: false,
            cache: false
        })
        this.props.updateFromServer()
        this.props.updateCurrentNonterminal(this.state.newNameVal)
        this.props.updateHistory(this.state.newNameVal, this.props.currentRule)
    }

    disableNewNameValue(){
        if (this.state.newNameVal == '' || this.props.other_names[this.state.newNameVal] != undefined){
            return true
        }
        return false
    }

    handleNonterminalDelete(){
        var object = {"nonterminal": this.props.name}
        ajax({
            url: $SCRIPT_ROOT + '/api/nonterminal/delete',
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(object),
            async: false,
            cache: false
        })
        this.props.updateFromServer()
    }

    render() {
        if (this.props.new == true){
            return (
                <ListGroupItem title={this.props.name} bsSize="xsmall" style={{'background-color': 'white'}}>
                            <input type='text' onChange={this.handleNewNameValueChange} value={this.state.newNameVal} style={{'width': '70%', 'height': '30px', 'padding': '5px', 'margin-right': '10px'}} placeholder='Enter a new nonterminal name.'/>
                            <div style={{'margin-right': '10px', 'display': 'inline'}}>
                                <Button onClick={this.handleNonterminalRename} title="new nt" bsStyle="success" style={{'margin-right': '5px'}} disabled={this.disableNewNameValue()}><Glyphicon glyph="ok"/></Button>
                                <Button onClick={this.handleNonterminalDelete} title="delete nt" bsStyle="danger"><Glyphicon glyph="remove"/></Button>
                            </div>
                </ListGroupItem>
            );
        } else {
            var deep_glyph = ""
            if (this.props.deep === true)
                deep_glyph = <Glyphicon glyph="asterisk"/>

            return (
                <ListGroupItem title={this.props.name} bsSize="xsmall" bsStyle={this.props.complete ? "success" : "danger" }
                           onClick={this.props.onClick}>{deep_glyph} {this.props.name}</ListGroupItem>
            );
        }
    }
}

module.exports = Nonterminal;
