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
        this.createSymbolUsageListGroupItem = this.createSymbolUsageListGroupItem.bind(this);
        this.handleNonterminalRuleClickThrough = this.handleNonterminalRuleClickThrough.bind(this);
        this.toggleSymbolTopLevelStatus = this.toggleSymbolTopLevelStatus.bind(this);
        this.toggleSymbolPinnedStatus = this.toggleSymbolPinnedStatus.bind(this);
        this.handleNonterminalDelete = this.handleNonterminalDelete.bind(this);
        this.handleExpand = this.handleExpand.bind(this);
        this.startSymbolNameEditing = this.startSymbolNameEditing.bind(this);
        this.stopSymbolNameEditing = this.stopSymbolNameEditing.bind(this);
        this.updateSymbolNameInputVal = this.updateSymbolNameInputVal.bind(this);
        this.handlePotentialHotKeyPress = this.handlePotentialHotKeyPress.bind(this);
        this.renameCurrentSymbol = this.renameCurrentSymbol.bind(this);
        this.state = {
            editingSymbolName: false,
            symbolNameInputVal: ''
        }
    }

    createSymbolUsageListGroupItem(usageIndex, usageObject){
        return <ListGroupItem
            title="View symbol usage"
            key={usageIndex}
            style={{"border": "0px"}}
            onClick={this.handleNonterminalRuleClickThrough.bind(this, usageObject.symbol, usageIndex)}>{usageObject['symbol']} <Glyphicon glyph="circle-arrow-right" style={{"top": "1px"}}/> {usageObject['expansion']}</ListGroupItem>
    }

    handleNonterminalRuleClickThrough(tag, index) {
        this.props.updateCurrentSymbolName(tag)
        this.props.updateCurrentRule(index)
        this.props.updateGeneratedContentPackageTags([])
        this.props.updateGeneratedContentPackageText("")
    }

    toggleSymbolTopLevelStatus() {
        if (this.props.currentSymbolName != "") {
            var object = {
                "nonterminal": this.props.currentSymbolName,
                "status": !this.props.nonterminal.deep
            }
            ajax({
                url: $SCRIPT_ROOT + '/api/nonterminal/set_top_level_status',
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

    toggleSymbolPinnedStatus() {
        if (this.props.currentSymbolName != "") {
            var object = {
                "nonterminal": this.props.currentSymbolName,
                "status": !this.props.nonterminal.pinned
            }
            ajax({
                url: $SCRIPT_ROOT + '/api/nonterminal/set_pinned_status',
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

    handlePotentialHotKeyPress(e) {
        // Stop rule editing upon Enter keypress
        if (e.key === 'Enter' && this.state.editingSymbolName) {
            e.preventDefault();
            this.stopSymbolNameEditing();
        }
        else {
            // Check for a hot-key match (ctrl/command + ...)
            if (e.ctrlKey || e.metaKey) {
                // Toggle top-level status of this symbol
                if (e.shiftKey && e.key === '8') {
                    // Make sure a rule is not taking up the workspace
                    if (this.props.symbolIsInWorkspace(this.props.currentSymbolName)) {
                        e.preventDefault();
                        this.toggleSymbolTopLevelStatus();
                    }
                }
                // Toggle pinned status of this symbol
                if (e.key === 'p') {
                    // Make sure a rule is not taking up the workspace
                    if (this.props.symbolIsInWorkspace(this.props.currentSymbolName)) {
                        e.preventDefault();
                        this.toggleSymbolPinnedStatus();
                    }
                }
            }
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
        document.addEventListener("keydown", this.handlePotentialHotKeyPress, false);
    }

    render() {
        var expand
        var rules
        var markup
        var glyph_nt
        if (this.props.nonterminal) {
            var toggleTopLevelStatusTooltip = AUTHOR_IS_USING_A_MAC ? "Toggle top-level status (⌘*)" : "Toggle top-level status (Ctrl+*)";
            if (this.props.nonterminal && this.props.nonterminal.deep) {
                glyph_nt = <Glyphicon glyph="star"/>
            }
            else {
                glyph_nt = <Glyphicon glyph="star-empty"/>
            }
            if (this.props.nonterminal && this.props.nonterminal.pinned) {
                var togglePinnedStatusTooltip = AUTHOR_IS_USING_A_MAC ? "Unpin symbol (⌘P)" : "Unpin symbol (Ctrl+P)";
            }
            else {
                var togglePinnedStatusTooltip = AUTHOR_IS_USING_A_MAC ? "Pin symbol (⌘P)" : "Pin symbol (Ctrl+P)";
            }
            var usages = [];
            for (let i = 0; i < this.props.usages.length; i++) {
                usages.push(this.createSymbolUsageListGroupItem(i, this.props.usages[i]));
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
                        <span title="Current symbol (click to edit name)" className="symbol-board-header" style={{"backgroundColor": this.props.nonterminal.complete ? "#57F7E0" : "#FF9891"}} onClick={this.startSymbolNameEditing}>{this.props.currentSymbolName}</span>
                    }
                    <br />
                    <Button bsStyle={this.props.nonterminal.deep ? "success" : "default" } onClick={this.toggleSymbolTopLevelStatus} title={toggleTopLevelStatusTooltip}>{glyph_nt}</Button>
                    <Button bsStyle={this.props.nonterminal.pinned ? "success" : "default" } onClick={this.toggleSymbolPinnedStatus} title={togglePinnedStatusTooltip}><Glyphicon glyph="pushpin"/></Button>
                    <Button id="playButton" onClick={this.handleExpand} title={AUTHOR_IS_USING_A_MAC ? "Test symbol rewriting (⌘↩)" : "Test symbol rewriting (Ctrl+Enter)"} bsStyle={this.props.playButtonIsJuicing ? 'success' : 'default'}><Glyphicon glyph="play"/></Button>
                    <Button onClick={this.startSymbolNameEditing} title="Rename symbol"><Glyphicon glyph="pencil"/></Button>
                    <Button onClick={this.handleNonterminalDelete} title="Delete symbol"><Glyphicon glyph="trash"/></Button>
                    </h1>
                </div>

                <div style={{"width": "70%", "margin": "0 auto"}}>
                    <Panel>
                        <ListGroup style={{"maxHeight": "20vh", "overflowY": "auto"}}>
                            {usages}
                        </ListGroup>
                    </Panel>
                </div>

            </div>
        )

    }
}

module.exports = NonterminalBoard;
