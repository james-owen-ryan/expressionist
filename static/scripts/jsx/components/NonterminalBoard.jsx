var React = require('react')
var Button = require('react-bootstrap').Button
var Glyphicon = require('react-bootstrap').Glyphicon
var Panel = require('react-bootstrap').Panel
var ListGroupItem = require('react-bootstrap').ListGroupItem
var ListGroup = require('react-bootstrap').ListGroup
var ajax = require('jquery').ajax


const AUTHOR_IS_USING_A_MAC = navigator.platform.toUpperCase().indexOf('MAC') >= 0;


class NonterminalBoard extends React.Component {

    constructor(props) {
        super(props);
        this.handleClickerThing = this.handleClickerThing.bind(this);
        this.handleNonterminalRuleClickThrough = this.handleNonterminalRuleClickThrough.bind(this);
        this.handleSetDeep = this.handleSetDeep.bind(this);
        this.handleNonterminalDelete = this.handleNonterminalDelete.bind(this);
        this.handleExpand = this.handleExpand.bind(this);
        this.startSymbolNameEditing = this.startSymbolNameEditing.bind(this);
        this.stopSymbolNameEditing = this.stopSymbolNameEditing.bind(this);
        this.updateSymbolNameInputVal = this.updateSymbolNameInputVal.bind(this);
        this.stopEditingRuleNameOnEnter = this.stopEditingRuleNameOnEnter.bind(this);
        this.renameCurrentSymbol = this.renameCurrentSymbol.bind(this);
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
        this.setState({
            editingSymbolName: true,
            symbolNameInputVal: this.props.currentSymbolName
        });
        this.props.letInterfaceKnowTextFieldEditingHasStarted();
    }

    updateSymbolNameInputVal(e) {
        this.setState({symbolNameInputVal: e.target.value});
    }

    stopEditingRuleNameOnEnter(e) {
        if (e.key === 'Enter' && this.state.editingSymbolName) {
            e.preventDefault();
            this.stopSymbolNameEditing();
        }
    }

    stopSymbolNameEditing() {
        var validRename = true;
        if (this.state.symbolNameInputVal === "") {
            validRename = false;
        }
        else if (this.props.symbolNameAlreadyExists(this.state.symbolNameInputVal)) {
            validRename = false;
        }
        if (validRename) {
            this.renameCurrentSymbol();
        }
        else if (this.state.symbolNameInputVal === this.props.currentSymbolName || (this.state.symbolNameInputVal === "")) {
            // It's fine to stick with the same name after all, but there's no need to actually
            // send the rename request, so just turn editing off; note that we treat clicking away
            // from an empty box as an action that causes the current name to be kept
            this.setState({editingSymbolName: false});
        }
        this.props.letInterfaceKnowTextFieldEditingHasStopped();
    }

    renameCurrentSymbol() {
        var object = {
            "old": this.props.currentSymbolName,
            "new": this.state.symbolNameInputVal
        }
        ajax({
            url: $SCRIPT_ROOT + '/api/nonterminal/rename',
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(object),
            success: () => {
                this.setState({editingSymbolName: false});
                this.props.updateFromServer();
                this.props.updateCurrentSymbolName(this.state.symbolNameInputVal);
            },
            cache: false
        })
    }

    componentDidMount() {
        document.addEventListener("keydown", this.stopEditingRuleNameOnEnter, false);
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
                    {
                        this.state.editingSymbolName
                        ?
                        <textarea type='text' title="Press Enter or click outside this area to submit your changes." value={this.state.symbolNameInputVal} onChange={this.updateSymbolNameInputVal} onBlur={this.stopSymbolNameEditing} style={{width: '90%', border: '0px solid #d7d7d7', height: '43px', marginTop: '10px', marginBottom: '15px', fontSize: '18px', padding: '8px 12px', backgroundColor: '#f2f2f2'}} autoFocus="true"/>
                        :
                        <span title="Current symbol (click to edit name)" className="symbol-board-header" style={{"backgroundColor": this.props.nonterminal.rules.length > 0 ? "#57F7E0" : "#FF9891"}} onClick={this.startSymbolNameEditing}>{this.props.currentSymbolName}</span>
                    }
                    <br />
                    <Button bsStyle={this.props.nonterminal.deep ? "success" : "default" } onClick={this.handleSetDeep} title={deep_str}>{glyph_nt}</Button>
                    <Button id="playButton" onClick={this.handleExpand} title={AUTHOR_IS_USING_A_MAC ? "Test symbol rewriting (⌘↩)" : "Save grammar (Ctrl+Enter)"} bsStyle={this.props.playButtonIsJuicing ? 'success' : 'default'}><Glyphicon glyph="play"/></Button>
                    <Button onClick={this.startSymbolNameEditing} title="Rename symbol"><Glyphicon glyph="pencil"/></Button>
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
