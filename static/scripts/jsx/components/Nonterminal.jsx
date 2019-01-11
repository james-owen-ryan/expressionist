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
        this.submitSymbolNameOnEnterKeypress = this.submitSymbolNameOnEnterKeypress.bind(this);
        this.state = {
            newNameVal: '',
            renameRequestAlreadySent: false
        }
    }

    handleNewNameValueChange(e) {
       this.setState({newNameVal: e.target.value})
    }

    handleNonterminalRename(e){
        this.setState({renameRequestAlreadySent: true})
        var object = {
            "old": this.props.name,
            "new": this.state.newNameVal
        }
        ajax({
            url: $SCRIPT_ROOT + '/api/nonterminal/rename',
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(object),
            success: () => {
                this.props.updateCurrentRule(-1)
                this.props.updateFromServer()
                this.props.updateCurrentNonterminal(this.state.newNameVal)
                this.props.updateHistory(this.state.newNameVal, this.props.currentRule)
            },
            cache: false
        })
    }

    submitSymbolNameOnEnterKeypress(e) {
        if (this.props.new && !this.state.renameRequestAlreadySent && !this.disableNewNameValue()) {
            if (document.activeElement.id === "newSymbolNameInputElement") {
                if (e.key === 'Enter') {
                    this.handleNonterminalRename();
                }
            }
        }
    };

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
            success: () => this.props.updateFromServer(),
            cache: false
        })
    }

    componentDidMount(){
        // Remove any earlier event listener that was added from earlier nonterminals being mounted
        // for the first time
        document.removeEventListener("keyup", this.submitSymbolNameOnEnterKeypress, false);
        // Add the new event listener
        document.addEventListener("keyup", this.submitSymbolNameOnEnterKeypress, false);
    }

    render() {
        if (this.props.new == true){
            return (
                <ListGroupItem title={this.props.name} bsSize="xsmall" style={{'padding': '0', 'height': '44px', 'marginBottom': '0px'}}>
                            <input id="newSymbolNameInputElement" type='text' onChange={this.handleNewNameValueChange} value={this.state.newNameVal} style={{'width': 'calc(100% - 80px)', 'height': '35px', 'padding': '8px', 'backgroundColor': 'white'}} placeholder='Enter symbol name.' autoFocus="true"/>
                            <div style={{'marginRight': '10px', 'display': 'inline', 'width': '80px'}}>
                                <Button id="newSymbolNameInputElementButton" onClick={this.handleNonterminalRename} title={this.disableNewNameValue() ? "Add symbol (disabled: requires at least one character)" : "Add symbol"} bsStyle="default" style={{'marginBottom': '3px', 'padding': '8px 13px', 'height': '35.5px'}} disabled={this.disableNewNameValue()}><Glyphicon glyph="ok"/></Button>
                                <Button onClick={this.handleNonterminalDelete} title="Cancel" style={{'marginBottom': '3px', 'padding': '8px 13px', 'height': '35.5px'}} bsStyle="default"><Glyphicon glyph="remove"/></Button>
                            </div>
                </ListGroupItem>
            );
        } else {
            var deep_glyph = ""
            if (this.props.deep === true)
                deep_glyph = <Glyphicon glyph="star"/>
            return (
                <ListGroupItem title="View symbol" bsSize="xsmall" bsStyle={this.props.complete ? "success" : "danger" } style={this.props.isCurrentNonterminal ? {"backgroundColor": "#ffe97f"} : {}} onClick={this.props.onClick}>{deep_glyph} {this.props.name}</ListGroupItem>
            );
        }
    }
}

module.exports = Nonterminal;
