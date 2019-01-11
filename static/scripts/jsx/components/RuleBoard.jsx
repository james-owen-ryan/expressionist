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
        this.prepareForRuleDefinitionEdit = this.prepareForRuleDefinitionEdit.bind(this);
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
                this.props.updateGeneratedContentPackageText(data.markup);
            },
            error: (xhr, status, err) => {
                console.error(this.props.url, status, err.toString());
            }
        });
    }

    handleRuleClickThrough(tag){
        this.props.updateCurrentNonterminal(tag);
        this.props.updateCurrentRule(-1);
        this.props.updateGeneratedContentPackageText([]);
        this.props.updateGeneratedContentPackageText('');
        this.props.updateHistory(tag, -1);
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
                this.props.updateHistory(this.props.currentSymbolName, -1)
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

    prepareForRuleDefinitionEdit() {
        this.props.openRuleDefinitionModal(this.props.currentRule);
    }

    render() {
        var expansion_arr = [];
        var length = this.props.expansion.length;
        var symbolReference;
        for (var i = 0; i < length; i++) {
            symbolReference = this.props.expansion[i];
            if (symbolReference.indexOf('[[') != -1) {
                var symbolName = symbolReference.slice(2,-2);
                expansion_arr.push(<span className={this.props.nonterminals[symbolName].rules.length === 0 ? "incomplete-symbol-reference-in-rule-body" : "symbol-reference-in-rule-body"} title="View symbol" onClick={this.handleRuleClickThrough.bind(this, symbolName)}>{symbolReference}</span>)
            }
            else {
                expansion_arr.push(<span>{symbolReference}</span>)
            }
        }

        return (
            <div>
                <div style={{"width": "70%", "margin": "0 auto"}}>
                    <h2>
                        <span className="symbol-reference-in-rule-head" title="View rule head" onClick={this.handleRuleClickThrough.bind(this, this.props.currentSymbolName)}>{this.props.currentSymbolName}</span>
                        <br></br>
                        <Button id="playButton" bsStyle="default" title="Test rule execution (hot key: 'command+Enter' or 'ctrl+Enter')" onClick={this.handleExecuteRule}><Glyphicon glyph="play"/></Button>
                        <Button id="editRuleButton" bsStyle="default" title="Edit rule (hot key: 'command+shift+d' or 'ctrl+shift+d')" onClick={this.prepareForRuleDefinitionEdit}><Glyphicon glyph="pencil"/></Button>
                        <Button bsStyle="danger" title="Delete rule" onClick={this.onRuleDelete}><Glyphicon glyph="trash"/></Button>
                        <Glyphicon title='The arrow in a production rule cues that the rule head (top) will be rewritten as the rule body (bottom).' glyph="circle-arrow-down" style={{"fontSize": "25px", "left": "10px", "top": "5px"}}/>
                    </h2>
                </div>
                <div style={{"width": "70%", "margin": "0 auto", "height": "35vh", "overflowY": "auto"}}>
                    <h3 title="Rule body">{expansion_arr}</h3>
                </div>
            </div>
        )
    }
}

module.exports = RuleBoard;
