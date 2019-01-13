var React = require('react')
var Button = require('react-bootstrap').Button
var Glyphicon = require('react-bootstrap').Glyphicon
var ajax = require('jquery').ajax

class RuleBoard extends React.Component {

    constructor(props) {
        super(props);
        this.handleExecuteRule = this.handleExecuteRule.bind(this);
        this.handleRuleClickThrough = this.handleRuleClickThrough.bind(this);
        this.onRuleDelete = this.onRuleDelete.bind(this);
        this.handleAppModify = this.handleAppModify.bind(this);
        this.prepareForRuleDefinitionEditModal = this.prepareForRuleDefinitionEditModal.bind(this);
        this.startQuickRuleBodyEditing = this.startQuickRuleBodyEditing.bind(this);
        this.updateRuleBodyInputVal = this.updateRuleBodyInputVal.bind(this);
        this.stopQuickRuleBodyEditingOnEnter = this.stopQuickRuleBodyEditingOnEnter.bind(this);
        this.stopQuickRuleBodyEditing = this.stopQuickRuleBodyEditing.bind(this);
        this.updateRuleBody = this.updateRuleBody.bind(this);
        this.callbackToTurnOffQuickRuleEditing = this.callbackToTurnOffQuickRuleEditing.bind(this);
        this.state = {
            editingRuleBody: false,
            ruleBodyInputVal: ''
        }
    }

    handleExecuteRule() {
        ajax({
            url: $SCRIPT_ROOT + '/api/rule/expand',
            type: 'POST',
            contentType: "application/json",
            data: JSON.stringify({"nonterminal": this.props.currentSymbolName, "index": this.props.currentRule}),
            dataType: 'json',
            cache: false,
            success: (data) => {
                this.props.updateGeneratedContentPackageText(data.derivation);
                this.props.updateGeneratedContentPackageTags(data.markup);
            },
            error: (xhr, status, err) => {
                console.error(this.props.url, status, err.toString());
            }
        });
    }

    handleRuleClickThrough(tag){
        this.props.updateCurrentSymbolName(tag);
        this.props.updateCurrentRule(-1);
        this.props.updateGeneratedContentPackageText([]);
        this.props.updateGeneratedContentPackageText('');
    }

    onRuleDelete() {
        var object = {
            "rule": this.props.currentRule,
            "nonterminal": this.props.currentSymbolName
        }
        ajax({
            url: $SCRIPT_ROOT + '/api/rule/delete',
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(object),
            success: () => {
                this.props.updateCurrentRule(this.props.currentRule-1)
                this.props.updateFromServer()
            },
            cache: false
        })
    }

    handleAppModify() {
        var index = this.props.currentRule;
        var applicationRate = window.prompt("Enter a new application rate.");
        if (!isNaN(applicationRate)) {
            var object = {"rule": index, "nonterminal": this.props.currentSymbolName, "applicationRate": applicationRate}
            ajax({
                url: $SCRIPT_ROOT + '/api/rule/set_app',
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(object),
                success: () => this.props.updateFromServer(),
                cache: false
            })
        }
    }

    prepareForRuleDefinitionEditModal() {
        this.props.openRuleDefinitionModal(this.props.currentRule);
    }

    startQuickRuleBodyEditing() {
        this.setState({
            editingRuleBody: true,
            ruleBodyInputVal: this.props.expansion.join("")
        });
    }

    updateRuleBodyInputVal(e) {
        this.setState({ruleBodyInputVal: e.target.value});
    }

    stopQuickRuleBodyEditingOnEnter(e) {
        if (e.key === 'Enter' && this.state.editingRuleBody) {
            e.preventDefault();
            this.stopQuickRuleBodyEditing();
        }
    }

    stopQuickRuleBodyEditing() {
        if (this.state.ruleBodyInputVal === this.props.expansion.join("")) {
            // It's fine to stick with the same rule body after all, but there's no need to actually
            // send the request to update the rule body in the grammar, so just turn editing off
            this.setState({editingRuleBody: false});
        }
        else if (!this.props.ruleAlreadyExists(this.props.currentSymbolName, this.state.ruleBodyInputVal, null)) {
            // Unless the body is the same as another existing rule, this is a valid update,
            // so send the request
            this.updateRuleBody();
        }
    }

    callbackToTurnOffQuickRuleEditing() {
        this.setState({editingRuleBody: false});
    }

    updateRuleBody() {
        var ruleId = this.props.currentRule;
        var ruleHeadName = this.props.currentSymbolName;
        var applicationRate = this.props.applicationRate;
        var ruleBody = this.state.ruleBodyInputVal;
        var object = {
            "rule id": ruleId,
            "rule body": ruleBody,
            "application rate": applicationRate,
            "rule head name": ruleHeadName,
            "original rule head name": ruleHeadName
        }
        ajax({
            url: $SCRIPT_ROOT + '/api/rule/edit',
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(object),
            success: () => {
                this.props.updateFromServer(this.callbackToTurnOffQuickRuleEditing);
            },
            cache: false
        })
    }
    
    componentDidMount() {
        document.addEventListener("keydown", this.stopQuickRuleBodyEditingOnEnter, false);
    }

    render() {
        var stylizedRuleBody = [];
        var length = this.props.expansion.length;
        var symbolReference;
        for (var i = 0; i < length; i++) {
            symbolReference = this.props.expansion[i];
            if (symbolReference.indexOf('[[') != -1) {
                // Reference to a nonterminal symbol
                var symbolName = symbolReference.slice(2,-2);
                stylizedRuleBody.push(<span className={this.props.nonterminals[symbolName].rules.length === 0 ? "incomplete-symbol-reference-in-rule-body" : "symbol-reference-in-rule-body"} title="View symbol" onClick={this.handleRuleClickThrough.bind(this, symbolName)}>{symbolReference}</span>)
            }
            else {
                // Terminal symbol
                stylizedRuleBody.push(<span title="Click to edit rule body" onClick={this.startQuickRuleBodyEditing}>{symbolReference}</span>)
            }
        }
        // Add a small chunk of whitespace that the author may click on to do a quick edit on the rule body
        stylizedRuleBody.push(<span title="Click to edit rule body" onClick={this.startQuickRuleBodyEditing}>&nbsp;&nbsp;&nbsp;&nbsp;</span>)

        return (
            <div>
                <div style={{"width": "70%", "margin": "0 auto"}}>
                    <h2>
                        <span className="symbol-reference-in-rule-head" title="View rule head" onClick={this.handleRuleClickThrough.bind(this, this.props.currentSymbolName)}>{this.props.currentSymbolName}</span>
                        <br></br>
                        <Button id="playButton" bsStyle="default" title="Test rule execution (hot key: 'command+Enter' or 'ctrl+Enter')" onClick={this.handleExecuteRule}><Glyphicon glyph="play"/></Button>
                        <Button id="editRuleButton" bsStyle="default" title="Edit rule (hot key: 'command+shift+d' or 'ctrl+shift+d')" onClick={this.prepareForRuleDefinitionEditModal}><Glyphicon glyph="pencil"/></Button>
                        <Button bsStyle="danger" title="Delete rule" onClick={this.onRuleDelete}><Glyphicon glyph="trash"/></Button>
                        <Glyphicon title='The arrow in a production rule cues that the rule head (top) will be rewritten as the rule body (bottom).' glyph="circle-arrow-down" style={{"fontSize": "25px", "left": "10px", "top": "5px"}}/>
                    </h2>
                </div>
                {
                    this.state.editingRuleBody
                    ?
                    <textarea type='text' title="Press Enter or click outside this area to submit your changes." value={this.state.ruleBodyInputVal} onChange={this.updateRuleBodyInputVal} onBlur={this.stopQuickRuleBodyEditing} style={{position: "relative", left: "15%", width: '70%', border: '0px', height: '30vh', fontSize: '18px', padding: '8px 12px', backgroundColor: '#f2f2f2'}} autoFocus="true"/>
                    :
                    <div style={{"width": "70%", "margin": "0 auto", "height": "35vh", "overflowY": "auto"}}>
                    <h3 title="Rule body">{stylizedRuleBody}</h3>
                </div>
                }
            </div>
        )
    }
}

module.exports = RuleBoard;
