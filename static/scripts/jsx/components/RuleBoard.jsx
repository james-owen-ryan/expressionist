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
    }

    handleExpandRule() {
        ajax({
            url: $SCRIPT_ROOT + '/api/rule/expand',
            type: 'POST',
            contentType: "application/json",
            data: JSON.stringify({"nonterminal": this.props.name, "index": this.props.currentRule}),
            dataType: 'json',
            async: true,
            cache: false,
            success: function (data) {
                this.props.updateExpansionFeedback(data.derivation);
                this.props.updateMarkupFeedback(data.markup);
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    }

    handleRuleClickThrough(tag){
        this.props.updateCurrentNonterminal(tag);
        this.props.updateCurrentRule(-1);
        this.props.updateMarkupFeedback([]);
        this.props.updateExpansionFeedback('');
        this.props.updateHistory(tag, -1);
    }

    onRuleDelete(index) {
        var object = {
            "rule": this.props.name,
            "nonterminal": this.props.name
        }
        ajax({
            url: $SCRIPT_ROOT + '/api/rule/delete',
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(object),
            async: false,
            cache: false
        })
        this.props.updateCurrentRule(this.props.currentRule-1)
        this.props.updateFromServer()
        this.props.updateHistory(this.props.name, -1)
    }


    handleAppModify() {
        var index = this.props.currentRule;
        var app_rate = window.prompt("Please enter new application rate");
        if (!isNaN(app_rate)) {
            var object = {"rule": index, "nonterminal": this.props.name, "app_rate": app_rate}
            ajax({
                url: $SCRIPT_ROOT + '/api/rule/set_app',
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(object),
                async: false,
                cache: false
            })
            this.props.updateFromServer()
        }
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
                <div style={{"width": "50%", "margin": "0 auto"}}>
                    <h2 onClick={this.handleRuleClickThrough.bind(this, this.props.name)}><b>{this.props.name}</b></h2>
                </div>

                <div>
                    <h3>{this.props.name} -> {expansion_arr}</h3><Button bsStyle="danger" title="Delete Rule"
                                                                                onClick={this.onDeleteRule}><Glyphicon
                    glyph="warning-sign"/>Delete</Button>
                </div>

                <h2>{this.props.app_rate}<Button bsStyle="default" title="Modify Application Rate"
                                                 onClick={this.handleAppModify}><Glyphicon glyph="console"/></Button>
                
                <Button bsStyle="default" title="Expand this rule"
                                                 onClick={this.handleExpandRule}><Glyphicon glyph="resize-full"/></Button>
                </h2>

            </div>
        )
    }
}

module.exports = RuleBoard;
