var React = require('react')
var Button = require('react-bootstrap').Button
var Glyphicon = require('react-bootstrap').Glyphicon
var ajax = require('jquery').ajax

class RuleBoard extends React.Component {

    constructor(props) {
        super(props);
        this.handleExpandRule = this.handleExpandRule.bind(this);
        this.handleRuleClickThrough = this.handleRuleClickThrough.bind(this);
        this.onRuleDelete = this.onRuleDelete.bind(this);
        this.handleAppModify = this.handleAppModify.bind(this);
        this.prepareForRuleDefinitionEdit = this.prepareForRuleDefinitionEdit.bind(this);
    }

    handleExpandRule() {
        ajax({
            url: $SCRIPT_ROOT + '/api/rule/expand',
            type: 'POST',
            contentType: "application/json",
            data: JSON.stringify({"nonterminal": this.props.name, "index": this.props.currentRule}),
            dataType: 'json',
            cache: false,
            success: (data) => {
                this.props.updateExpansionFeedback(data.derivation);
                this.props.updateMarkupFeedback(data.markup);
            },
            error: (xhr, status, err) => {
                console.error(this.props.url, status, err.toString());
            }
        });
    }

    handleRuleClickThrough(tag){
        this.props.updateCurrentNonterminal(tag);
        this.props.updateCurrentRule(-1);
        this.props.updateMarkupFeedback([]);
        this.props.updateExpansionFeedback('');
        this.props.updateHistory(tag, -1);
    }

    onRuleDelete() {
        var object = {
            "rule": this.props.currentRule,
            "nonterminal": this.props.name
        }
        ajax({
            url: $SCRIPT_ROOT + '/api/rule/delete',
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(object),
            success: () => {
                this.props.updateCurrentRule(this.props.currentRule-1)
                this.props.updateFromServer()
                this.props.updateHistory(this.props.name, -1)
            },
            cache: false
        })
    }

    handleAppModify() {
        var index = this.props.currentRule;
        var app_rate = window.prompt("Enter a new application rate.");
        if (!isNaN(app_rate)) {
            var object = {"rule": index, "nonterminal": this.props.name, "app_rate": app_rate}
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
        this.props.openRuleDefinitionModal(this.props.currentRule)
    }

    render() {
        var expansion_arr = [];
        var length = this.props.expansion.length;
        var symbol;
        for(var i = 0; i < length; i++) {
            symbol = this.props.expansion[i]
            if (symbol.indexOf('[[') != -1) {
                var tag = symbol.slice(2,-2);
                expansion_arr.push(<span style={{"cursor": "pointer"}} onClick={this.handleRuleClickThrough.bind(this, symbol.slice(2,-2))}>
                <b>{symbol}</b></span>)
            }
            else
            {
                expansion_arr.push(<span>{symbol}</span>)
            }
        }

        return (
            <div>
                <div style={{"width": "70%", "margin": "0 auto", "height": "70%"}}>
                    <h2>
                        <span style={{"cursor": "pointer"}} onClick={this.handleRuleClickThrough.bind(this, this.props.name)}><b>{this.props.name}</b></span> <Glyphicon glyph="circle-arrow-right" style={{"fontSize": "20px"}}/>
                        <br></br>
                        <Button bsStyle="default" title="Test" onClick={this.handleExpandRule}><Glyphicon glyph="play"/></Button>
                        <Button bsStyle="default" title="Edit" onClick={this.prepareForRuleDefinitionEdit}><Glyphicon glyph="pencil"/></Button>
                        <Button bsStyle="danger" title="Delete" onClick={this.onRuleDelete}><Glyphicon glyph="trash"/></Button>
                    </h2>
                </div>
                <div style={{"width": "70%", "margin": "0 auto", "height": "85%", "overflowY": "auto"}}>
                    <h3>{expansion_arr}</h3>
                </div>
            </div>
        )
    }
}

module.exports = RuleBoard;
