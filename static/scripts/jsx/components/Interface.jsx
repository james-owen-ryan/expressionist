var React = require('react')
var NonterminalList = require('./NonterminalList.jsx')
var MarkupBar = require('./MarkupBar.jsx')
var findIndex = require('lodash/array/findIndex')
var ajax = require('jquery').ajax
var RuleBar = require('./RuleBar.jsx')
var NonterminalBoard = require('./NonterminalBoard.jsx')
var RuleBoard = require('./RuleBoard.jsx')
var FeedbackBar = require('./FeedbackBar.jsx')
var HeaderBar = require('./HeaderBar.jsx')
var Modal = require('react-bootstrap').Modal
var Button = require('react-bootstrap').Button
import { Router, browserHistory } from 'react-router'

class Interface extends React.Component {

    constructor(props) {
        super(props);
        this.updateFromServer = this.updateFromServer.bind(this);
        this.updateHistory = this.updateHistory.bind(this);
        this.updateCurrentNonterminal = this.updateCurrentNonterminal.bind(this);
        this.updateCurrentRule = this.updateCurrentRule.bind(this);
        this.updateMarkupFeedback = this.updateMarkupFeedback.bind(this);
        this.updateExpansionFeedback = this.updateExpansionFeedback.bind(this);
        this.getexpansion = this.getexpansion.bind(this);
        var a
        ajax({
            url: $SCRIPT_ROOT + '/api/default',
            dataType: 'json',
            async: false,
            cache: false,
            success: function (data) {
                a = data
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
        var b = a['nonterminals']
        var c = a['markups']
        var d = a['system_vars']
        this.state = {
            nonterminals: b,
            markups: c,
            system_vars: d,
            expansion_feedback: "",
            markup_feedback: [],
            current_nonterminal: "",
            current_rule: -1,
        }
    }

    componentDidMount() {
        window.onpopstate = this.onBackButtonEvent;
        if( this.props.params.nonterminalid != null)
        {
            this.setState({current_nonterminal: this.props.params.nonterminalid})
            if( this.props.params.ruleid != null)
            {
                this.setState({current_rule: this.props.params.ruleid})
            }
        }
    }

    onBackButtonEvent(e){
        e.preventDefault();
        //this.goBack()
        var nonterminal = this.props.params.nonterminalid
        var rule = this.props.params.ruleid
        if (!(this.state.current_nonterminal == nonterminal && this.state.current_rule == rule)){
            this.setState({markup_feedback: []})
            this.setState({expansion_feedback: ""})
        }
        this.setState({current_nonterminal: nonterminal})
        this.setState({current_rule: rule})
    }

    updateFromServer() {
        var a
        ajax({
            url: $SCRIPT_ROOT + '/api/default',
            dataType: 'json',
            async: false,
            cache: false,
            success: function (data) {
                a = data
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
        var b = a['nonterminals']
        var c = a['markups']
        var d = a['system_vars']
        this.setState({nonterminals: b})
        this.setState({markups: c})
        this.setState({system_vars: d})
    }

    updateHistory(nonterminal, rule){
        if( nonterminal != '') {
            browserHistory.push('/'+nonterminal+'/'+String(rule))
        } else {
            browserHistory.push('/')
        }
    }

    updateCurrentNonterminal(newTagOrNonterminal){
        this.setState({current_nonterminal: newTagOrNonterminal});
    }

    updateCurrentRule(newCurrentRule){
        this.setState({current_rule: newCurrentRule});
    }

    updateMarkupFeedback(newMarkupFeedback){
        this.setState({markup_feedback: newMarkupFeedback});
    }

    updateExpansionFeedback(newExpansionFeedback){
        this.setState({expansion_feedback: newExpansionFeedback});
    }

    getexpansion(object) {
        var symbol = object['symbol']
        var index = object['index']
        return {"symbol": symbol, "index": index, "expansion": this.state.nonterminals[symbol].rules[index].expansion.join("")}
    }

    render() {
        var def_rules = []
        var board
        var referents
        if (this.state.current_nonterminal in this.state.nonterminals) {
            var current = this.state.nonterminals[this.state.current_nonterminal]
            def_rules = this.state.nonterminals[this.state.current_nonterminal].rules
            //check which board we need to render
            if (this.state.current_rule == -1 || current.rules[this.state.current_rule] == null ) {
                var referents = []
                if ("referents" in current)
                {
                    var referents = current["referents"]
                    referents = referents.map(this.getexpansion.bind(this))
                }

                board = <NonterminalBoard   updateMarkupFeedback={this.updateMarkupFeedback}
                                            updateExpansionFeedback={this.updateExpansionFeedback}
                                            updateHistory={this.updateHistory}
                                            currentRule={this.state.current_rule}
                                            updateFromServer={this.updateFromServer}
                                            updateCurrentNonterminal={this.updateCurrentNonterminal}
                                            updateCurrentRule={this.updateCurrentRule}
                                            referents={referents}
                                            name={this.state.current_nonterminal}
                                            nonterminal={this.state.nonterminals[this.state.current_nonterminal]}/>
            }
            else {
                board = <RuleBoard  name={this.state.current_nonterminal}
                                    currentRule={this.state.current_rule}
                                    updateCurrentNonterminal={this.updateCurrentNonterminal}
                                    updateCurrentRule={this.updateCurrentRule}
                                    updateMarkupFeedback={this.updateMarkupFeedback}
                                    updateExpansionFeedback={this.updateExpansionFeedback}
                                    updateHistory={this.updateHistory}
                                    expansion={def_rules[this.state.current_rule].expansion}
                                    app_rate={def_rules[this.state.current_rule].app_rate}/>
            }
        }

        return (
            <div style={{position: "fixed", top: 0, right: 0, "height": "100%", "width": "100%"}}>
                <div
                    style={{ "height": "75%", "width": "75%", position: "absolute", top: 0, left: 0}}>
                    <HeaderBar  updateCurrentNonterminal={this.updateCurrentNonterminal}
                                updateCurrentRule={this.updateCurrentRule}
                                updateMarkupFeedback={this.updateMarkupFeedback}
                                updateExpansionFeedback={this.updateExpansionFeedback}
                                updateHistory={this.updateHistory}
                                update={this.updateFromServer}
                                systemVars={this.state.system_vars}/>
                    <div className="muwrap">
                        <div className="show-y-wrapper">
                            <MarkupBar  className="markup-bar"
                                        currentNonterminal={this.state.current_nonterminal}
                                        updateFromServer={this.updateFromServer}
                                        nonterminals={this.state.nonterminals}
                                        total={this.state.markups}/>
                        </div>
                    </div>
                    {board}
                </div>

                <div
                    style={{"overflow": "auto", "width": "25%", "height":"100%", position: "absolute", top: 0, right: 0, "border": "10px solid #f2f2f2"}}>
                    <NonterminalList    nonterminals={this.state.nonterminals}
                                        updateFromServer={this.updateFromServer}
                                        updateCurrentNonterminal={this.updateCurrentNonterminal}
                                        updateHistory={this.updateHistory}
                                        updateCurrentRule={this.updateCurrentRule}
                                        updateMarkupFeedback={this.updateMarkupFeedback}
                                        updateExpansionFeedback={this.updateExpansionFeedback}>
                    </NonterminalList>
                </div>

                <div style={{"width": "75%", "height": "40%", position: "absolute", bottom: 0, left:0}}>
                    <div className="muwrap">
                        <RuleBar    rules={def_rules} 
                                    nonterminals={this.state.nonterminals}
                                    name={this.state.current_nonterminal}
                                    updateCurrentNonterminal={this.updateCurrentNonterminal}
                                    updateCurrentRule={this.updateCurrentRule}
                                    updateMarkupFeedback={this.updateMarkupFeedback}
                                    updateExpansionFeedback={this.updateExpansionFeedback}
                                    updateHistory={this.updateHistory}/>
                    </div>
                    <FeedbackBar derivation={this.state.expansion_feedback} markup={this.state.markup_feedback}/>
                </div>
            </div>
        );
    }
}

module.exports = Interface;
