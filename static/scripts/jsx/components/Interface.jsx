{/*This is the top level component which will attach to document.body*/
}

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

var Interface = React.createClass({

    mixins: [Router.Navigation],

    //load data from server, use default grammar
    getInitialState: function () {
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
        return {
            nonterminals: b,
            markups: c,
            system_vars: d,
            expansion_feedback: "",
            markup_feedback: [],
            current_nonterminal: "",
            current_rule: -1,
        }
    },
    componentDidMount(){


        window.onpopstate = this.onBackButtonEvent;
        if( this.props.params.nonterminalid != null)
        {
            this.setState({current_nonterminal: this.props.params.nonterminalid})
            if( this.props.params.ruleid != null)
            {
                this.setState({current_rule: this.props.params.ruleid})
            }
        }
        console.log(this.state.current_nonterminal)
        console.log(this.state.current_rule)
    },
    componentWillReceiveProps(){ this.updateFromServer() },

    //update state from server
    updateFromServer: function () {
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

    },

    addNonterminalUpdate: function(nonterminal){
        this.updateFromServer();
        this.setState({current_nonterminal: nonterminal});
        this.updateHistory(nonterminal, -1)
    },

    //this handles the context switching (what nonterminal are we on)
    clickNonterminalUpdate: function (position) {
        if (this.state.nonterminals[position]) {
            this.setState({current_nonterminal: position})
            this.setState({current_rule: -1})
            this.setState({markup_feedback: []})
            this.setState({expansion_feedback: ""})
            this.updateHistory(position, -1)
        }
    },

    onBackButtonEvent: function(e){
        e.preventDefault();
        console.log(e)
        //this.goBack()
        console.log("wat")
        console.log(browserHistory)
        console.log(this.props.params)
        var nonterminal = this.props.params.nonterminalid
        var rule = this.props.params.ruleid
        if (!(this.state.current_nonterminal == nonterminal && this.state.current_rule == rule)){
            this.setState({markup_feedback: []})
            this.setState({expansion_feedback: ""})
        }
        this.setState({current_nonterminal: nonterminal})
        this.setState({current_rule: rule})
    },


    updateHistory: function(nonterminal, rule)
    {

        console.log(nonterminal)
        console.log(rule)
        if( nonterminal != '')
        {
            console.log('mew0')
            browserHistory.push('/'+nonterminal+'/'+String(rule))
        }
        else
        {
            browserHistory.push('/')
        }
    },

    handleRuleClickThrough: function(tag) {
        console.log(tag)
        this.setState({current_nonterminal: tag})
        this.setState({current_rule: -1})
        this.setState({markup_feedback: []})
        this.setState({expansion_feedback: ""})
        this.updateHistory(tag, -1)
    },

    handleNonterminalRuleClickThrough: function(tag, index) {
        this.setState({current_nonterminal: tag})
        this.setState({current_rule: index})
        this.setState({markup_feedback: []})
        this.setState({expansion_feedback: ""})
        this.updateHistory(tag, index)
    },
    
    ruleAddUpdate: function (nonterminal) {
        this.setState({current_nonterminal: nonterminal})
        this.setState({current_rule: -1})
        this.setState({markup_feedback: []})
        this.setState({expansion_feedback: ""})
        this.updateHistory(nonterminal, -1)
    },

    //these handle clicking markup to add it to a nonterminal
    handleMarkupClick: function (set, tag) {
        console.log("you are clicking " + set + ":" + tag)
        if (this.state.current_nonterminal != "") {
            var object = {
                "nonterminal": this.state.current_nonterminal,
                "markupSet": set,
                "tag": tag
            }
            console.log(object)
            ajax({
                url: $SCRIPT_ROOT + '/api/markup/toggle',
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(object),
                async: false,
                cache: false
            })
            this.updateFromServer()
        }
    },

    resetGrammar: function () {

        ajax({
            url: $SCRIPT_ROOT + '/api/grammar/new',
            type: 'GET',
            async: false,
            cache: false
        });
        this.state.current_nonterminal = ""
        this.state.current_rule = -1
        this.updateFromServer()
        this.setState({markup_feedback: []})
        this.setState({expansion_feedback: ""})
        this.updateHistory("'", -1)
    },

    handleExpand: function () {
        ajax({
            url: $SCRIPT_ROOT + '/api/nonterminal/expand',
            type: 'POST',
            contentType: "application/json",
            data: JSON.stringify({"nonterminal": this.state.current_nonterminal}),
            dataType: 'json',
            async: true,
            cache: false,
            success: function (data) {
                this.setState({expansion_feedback: data.derivation})
                this.setState({markup_feedback: data.markup})
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },

    handleExpandRule: function () {
        ajax({
            url: $SCRIPT_ROOT + '/api/rule/expand',
            type: 'POST',
            contentType: "application/json",
            data: JSON.stringify({"nonterminal": this.state.current_nonterminal,"index": this.state.current_rule}),
            dataType: 'json',
            async: true,
            cache: false,
            success: function (data) {
                this.setState({expansion_feedback: data.derivation})
                this.setState({markup_feedback: data.markup})
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },

    handleSetDeep: function (nonterminal) {
        if (this.state.current_nonterminal != "") {
            var object = {
                "nonterminal": this.state.current_nonterminal,
            }
            console.log(object)
            ajax({
                url: $SCRIPT_ROOT + '/api/nonterminal/deep',
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(object),
                async: false,
                cache: false
            })
            this.updateFromServer()
        }
    },

    handleNonterminalRename: function (nonterminal) {
            var newsymbol = window.prompt("Please enter new Symbol Name")
        if (this.state.current_nonterminal != "" && newsymbol != "") {
            var object = {
                "old": this.state.current_nonterminal,
                "new": newsymbol
            }
            ajax({
                url: $SCRIPT_ROOT + '/api/nonterminal/rename',
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(object),
                async: false,
                cache: false
            })
            this.updateFromServer()
            this.setState({current_nonterminal: newsymbol})
            this.updateHistory(newsymbol, this.state.current_rule)
        }
    },
    handleNonterminalDelete: function () {
        
            var confirmresponse = window.prompt("This will delete The nonterminal and\
 all rules which reference it, Be warned! If you wish to continue, please type\
YES, in all caps")
        if (this.state.current_nonterminal != "" && confirmresponse == "YES") {
            var object = {
                "nonterminal": this.state.current_nonterminal 
            }
            ajax({
                url: $SCRIPT_ROOT + '/api/nonterminal/delete',
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(object),
                async: false,
                cache: false
            })
            this.setState({current_nonterminal: ""})
            this.setState({current_rule: -1})
            this.updateFromServer()
            this.updateHistory("", -1)
        }
    },


    handleMarkupSetAdd: function () {
        console.log("You are adding a MarkupSet!")
        var markupTag = window.prompt("Please enter MarkupSet")
        if (markupTag != "") {
            var object = {"markupSet": markupTag}
            console.log(object)
            ajax({
                url: $SCRIPT_ROOT + '/api/markup/addtagset',
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(object),
                async: false,
                cache: false
            })
            this.updateFromServer()
        }
    },

    handleMarkupAdd: function (set) {
        console.log("You are adding a single markup to set " + set)
        var markupTag = window.prompt("Please enter Markup Tag")
        if (markupTag != "") {
            //ensure tag does not exist in tagset
            if (this.state.markups[set].indexOf(markupTag) === -1) {
                var object = {
                    "markupSet": set,
                    "tag": markupTag
                }
                console.log(object)
                ajax({
                    url: $SCRIPT_ROOT + '/api/markup/addtag',
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(object),
                    async: true,
                    cache: false
                })
                this.updateFromServer()
            }
        }
    },
    handleMarkupRename: function (set) {
        var oldTag = window.prompt("Please Enter the name of the original Markup")
        var markupTag = window.prompt("Please enter New Markup Tag")
        if ( markupTag != "" && oldTag != "" )
        {
            var object = {
                "markupset": set,
                "oldtag": oldTag,
                "newtag": markupTag
            }
            console.log(object)
            ajax({
                url: $SCRIPT_ROOT +'/api/markup/renametag',
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(object),
                async: true,
                cache: false
            })
            this.updateFromServer()
        }
    },

    handleMarkupSetRename: function (set) {
        var newset = window.prompt("Please enter New Markup Set Name")
        console.log(newset)
        if (newset != "") {
            //ensure tag does not exist in tagset
                var object = {
                    "oldset": set,
                    "newset": newset 
                            }
                console.log(object)
                ajax({
                    url: $SCRIPT_ROOT + '/api/markup/renameset',
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(object),
                    async: false,
                    cache: false
                })
                this.updateFromServer()
            }
        
    },
    handleRuleClick: function (index) {
        this.setState({current_rule: index})
        this.updateHistory(this.state.current_nonterminal, index)
    },

    onRuleDelete: function (index) {
        var object = {
            "rule": this.state.current_rule,
            "nonterminal": this.state.current_nonterminal
        }
        console.log(object)
        ajax({
            url: $SCRIPT_ROOT + '/api/rule/delete',
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(object),
            async: false,
            cache: false
        })
        //forceUpdate()
        this.state.current_rule -= 1
        this.updateFromServer()
        this.updateHistory(this.state.current_nonterminal, -1)
    },

    handleAppModify: function () {
        var index = this.state.current_rule
        console.log("modifying application rate")
        var app_rate = window.prompt("Please enter new application rate")
        if (!isNaN(app_rate)) {
            var object = {"rule": index, "nonterminal": this.state.current_nonterminal, "app_rate": app_rate}
            console.log(object)
            ajax({
                url: $SCRIPT_ROOT + '/api/rule/set_app',
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(object),
                async: false,
                cache: false
            })
            this.updateFromServer()
        }
    },

    saveGrammar: function () {

        var filename = window.prompt("Enter a filename for your grammar.")
        if (filename != "") {
            ajax({
                url: $SCRIPT_ROOT + '/api/grammar/save',
                type: "POST",
                contentType: "text/plain",
                data: filename,
                async: true,
                cache: false,
                success: function(status){
                    window.alert(status);
                }
            })
        }
    },

    exportGrammar: function () {
        var filename = window.prompt("Enter a filename for your content bundle.")
        if (filename != "") {
            ajax({
                url: $SCRIPT_ROOT + '/api/grammar/export',
                type: "POST",
                contentType: "text/plain",
                data: filename,
                async: true,
                cache: false,
                success: function(status){
                    window.alert(status);
                }
            })
        }
    },

    getexpansion: function(object) {
        var symbol = object['symbol']
        var index = object['index']

        //console.log(symbol)
        //console.log(index)
        return {"symbol": symbol, "index": index, "expansion": this.state.nonterminals[symbol].rules[index].expansion.join("")}
    },

    render: function () {
        var present_markups = []
        var def_rules = []
        var board
        var referents
        if (this.state.current_nonterminal in this.state.nonterminals) {
            var current = this.state.nonterminals[this.state.current_nonterminal]
            present_markups = this.state.nonterminals[this.state.current_nonterminal].markup
            def_rules = this.state.nonterminals[this.state.current_nonterminal].rules
            //check which board we need to render
            if (this.state.current_rule == -1 || current.rules[this.state.current_rule] == null ) {
                //console.log(current)
                var referents = []
                if ("referents" in current)
                {
                    var referents = current["referents"]
                    referents = referents.map(this.getexpansion)
                    //console.log(referents)
                }

                board = <NonterminalBoard rename={this.handleNonterminalRename}
                                          expand={this.handleExpand} setDeep={this.handleSetDeep}
                                          onRuleClickThrough={this.handleNonterminalRuleClickThrough}
                                          referents={referents}
                                          delete_nt={this.handleNonterminalDelete}
                                          name={this.state.current_nonterminal}
                                          nonterminal={this.state.nonterminals[this.state.current_nonterminal]}/>
            }
            else {
                board = <RuleBoard name={this.state.current_nonterminal}
                                   onAppChange={this.handleAppModify}
                                   onRuleClickThrough={this.handleRuleClickThrough}
                                   expansion={def_rules[this.state.current_rule].expansion}
                                   onRuleExpand={this.handleExpandRule}
                                   app_rate={def_rules[this.state.current_rule].app_rate}
                                   onDeleteRule={this.onRuleDelete} onChangeRule={this.onRuleChange}/>
            }
        }

        return (
            <div style={{position: "fixed", top: 0, right: 0, "height": "100%", "width": "100%"}}>
                <div
                    style={{ "height": "75%", "width": "75%", position: "absolute", top: 0, left: 0}}>
                    <HeaderBar reset={this.resetGrammar} update={this.updateFromServer}
                               exportGrammar={this.exportGrammar} saveGrammar={this.saveGrammar}
                               systemVars={this.state.system_vars} markups={this.state.markups}/>
                    <div className="muwrap">
                        <div className="show-y-wrapper">
                            <MarkupBar className="markup-bar" onClickMarkup={this.handleMarkupClick}
                                       onAddMarkup={this.handleMarkupAdd}
                                       onAddMarkupSet={this.handleMarkupSetAdd}
                                       present={present_markups}
                                       onRenameMarkup= {this.handleMarkupRename}
                                       onRenameMarkupSet={this.handleMarkupSetRename}
                                       total={this.state.markups}/>
                        </div>
                    </div>
                    {board}
                </div>

                <div
                    style={{"overflow": "auto", "width": "25%", "height":"100%", position: "absolute", top: 0, right: 0}}>
                    <NonterminalList    nonterminals={this.state.nonterminals} 
                                        addNonterminalUpdate={this.addNonterminalUpdate}
                                        clickNonterminalUpdate={this.clickNonterminalUpdate}>
                    </NonterminalList>
                </div>

                <div style={{"width": "75%", "height": "25%", position: "absolute", bottom: 0, left:0}}>
                    <div className="muwrap">
                        <RuleBar rules={def_rules} onRuleClick={this.handleRuleClick} nonterminals={this.state.nonterminals}
                                 name={this.state.current_nonterminal} ruleAddUpdate={this.ruleAddUpdate}/>
                    </div>
                    <FeedbackBar derivation={this.state.expansion_feedback} markup={this.state.markup_feedback}/>
                </div>
            </div>
        );
    }
});

module.exports = Interface

