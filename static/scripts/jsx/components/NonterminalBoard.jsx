var React = require('react')
var Button = require('react-bootstrap').Button
var Glyphicon = require('react-bootstrap').Glyphicon
var Panel = require('react-bootstrap').Panel
var ListGroupItem = require('react-bootstrap').ListGroupItem
var ListGroup = require('react-bootstrap').ListGroup
var ajax = require('jquery').ajax

class NonterminalBoard extends React.Component {

    constructor(props) {
        super(props);
        this.handleClickerThing = this.handleClickerThing.bind(this);
        this.handleNonterminalRuleClickThrough = this.handleNonterminalRuleClickThrough.bind(this);
        this.handleSetDeep = this.handleSetDeep.bind(this);
        this.handleNonterminalRename = this.handleNonterminalRename.bind(this);
        this.handleNonterminalDelete = this.handleNonterminalDelete.bind(this);
        this.handleExpand = this.handleExpand.bind(this);
        this.startSymbolNameEditing = this.startSymbolNameEditing.bind(this);
        this.stopSymbolNameEditing = this.stopSymbolNameEditing.bind(this);
        this.updateCurrentSymbolNameGivenEdit = this.updateCurrentSymbolNameGivenEdit.bind(this);
        this.state = {
            editingSymbolName: false,
            symbolNameInputVal: ''
        }
    }

    handleClickerThing(object){
        var idx = object.index
        var symbol = object.symbol
        return <ListGroupItem
            title="View symbol usage"
            key={object.index}
            style={{"border": "0px"}}
            onClick={this.handleNonterminalRuleClickThrough.bind(this, symbol, idx)}>{object['symbol']} <Glyphicon glyph="circle-arrow-right" style={{"top": "1px"}}/> {object['expansion']}</ListGroupItem>
    }

    handleNonterminalRuleClickThrough(tag, index) {
        this.props.updateCurrentSymbolName(tag)
        this.props.updateCurrentRule(index)
        this.props.updateGeneratedContentPackageTags([])
        this.props.updateGeneratedContentPackageText("")
        this.props.updateHistory(tag, index)
    }

    handleSetDeep() {
        if (this.props.currentSymbolName != "") {
            var object = {
                "nonterminal": this.props.currentSymbolName,
            }
            ajax({
                url: $SCRIPT_ROOT + '/api/nonterminal/deep',
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(object),
                success: () => {
                    this.props.updateFromServer();
                },
                cache: false
            })
        }
    }

    handleNonterminalRename(nonterminal) {
        var newsymbol = window.prompt("Enter a new name for this nonterminal symbol.", this.props.currentSymbolName);
        if (this.props.currentSymbolName !== "" && newsymbol) {
            var object = {
                "old": this.props.currentSymbolName,
                "new": newsymbol
            }
            ajax({
                url: $SCRIPT_ROOT + '/api/nonterminal/rename',
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(object),
                success: () => {
                    this.props.updateFromServer();
                    this.props.updateCurrentSymbolName(newsymbol);
                    this.props.updateHistory(newsymbol, this.props.currentRule);
                },
                cache: false
            })
        }
    }

    handleNonterminalDelete() {
        var confirmresponse = window.confirm("Are you sure you'd like to delete this nonterminal symbol? This will also delete any production rules that reference it.");
        if (this.props.currentSymbolName != "" && confirmresponse == true) {
            var object = {"nonterminal": this.props.currentSymbolName};
            ajax({
                url: $SCRIPT_ROOT + '/api/nonterminal/delete',
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(object),
                success: () => {
                    this.props.updateCurrentSymbolName("");
                    this.props.updateCurrentRule(-1);
                    this.props.updateFromServer();
                    this.props.updateHistory("", -1);
                },
                cache: false
            })
        }
    }

    handleExpand() {
        ajax({
            url: $SCRIPT_ROOT + '/api/nonterminal/expand',
            type: 'POST',
            contentType: "application/json",
            data: JSON.stringify({"nonterminal": this.props.currentSymbolName}),
            dataType: 'json',
            async: true,
            cache: false,
            success: (data) => {
                this.props.updateGeneratedContentPackageTags(data.markup);
                this.props.updateGeneratedContentPackageText(data.derivation)
            },
            error: (xhr, status, err) => {
                console.error(this.props.url, status, err.toString());
            }
        });
    }

    startSymbolNameEditing() {
        this.setState({editingSymbolName: true})
    }

    stopSymbolNameEditing() {
        this.setState({editingSymbolName: false})
    }

    updateCurrentSymbolNameGivenEdit() {
        this.props.updateCurrentSymbolName(this.state.symbolNameInputVal);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({symbolNameInputVal: nextProps.currentSymbolName});
    }

    render() {
        var expand
        var rules
        var markup
        var glyph_nt
        if (this.props.nonterminal) {
            var deep_str = ""
            if (this.props.nonterminal && this.props.nonterminal.deep) {
                deep_str = "Toggle top-level status"
                glyph_nt = <Glyphicon glyph="star"/>
            }
            else {
                deep_str = "Toggle top-level status"
                glyph_nt = <Glyphicon glyph="star-empty"/>
            }
            if( this.props.referents != []) {
                var referents = this.props.referents.map(this.handleClickerThing)
            }
        }

        return (
            <div style={{"width": "100%", "position": "absolute", "top": "30%"}}>
                <div style={{"width": "70%", "margin": "0 auto", "float": "center"}}>
                    <h1>
                    <span title="Current symbol" className="symbol-board-header" style={{"backgroundColor": this.props.nonterminal.rules.length > 0 ? "#57F7E0" : "#FF9891"}} onClick={this.startSymbolNameEditing}>{this.props.currentSymbolName}</span>
                    <br />
                    <Button bsStyle={this.props.nonterminal.deep ? "success" : "default" } onClick={this.handleSetDeep} title={deep_str}>{glyph_nt}</Button>
                    <Button id="playButton" onClick={this.handleExpand} title="Test symbol rewriting (hot key: 'command+Enter' or 'ctrl+Enter')"><Glyphicon glyph="play"/></Button>
                    <Button onClick={this.handleNonterminalRename} title="Rename symbol"><Glyphicon glyph="pencil"/></Button>
                    <Button onClick={this.handleNonterminalDelete} title="Delete symbol"><Glyphicon glyph="trash"/></Button>
                    </h1>
                </div>

                <div style={{"width": "70%", "margin": "0 auto"}}>
                    <Panel>
                        <ListGroup style={{"maxHeight": "20vh", "overflowY": "auto"}}>
                            {referents}
                        </ListGroup>
                    </Panel>
                </div>

            </div>
        )

    }
}

module.exports = NonterminalBoard;
