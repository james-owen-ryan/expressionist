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
        this.openRuleDefinitionModal = this.openRuleDefinitionModal.bind(this);
        this.closeRuleDefinitionModal = this.closeRuleDefinitionModal.bind(this);
        this.updateSymbolFilterQuery = this.updateSymbolFilterQuery.bind(this);
        this.getCurrentGrammarName = this.getCurrentGrammarName.bind(this);
        this.setCurrentGrammarName = this.setCurrentGrammarName.bind(this);
        this.handlePotentialHotKeyPress = this.handlePotentialHotKeyPress.bind(this);
        this.determineIfExportButtonIsDisabled = this.determineIfExportButtonIsDisabled.bind(this);
        this.enableBuildButton = this.enableBuildButton.bind(this);
        this.disableBuildButton = this.disableBuildButton.bind(this);
        this.enableTestButton = this.enableTestButton.bind(this);
        this.disableTestButton = this.disableTestButton.bind(this);
        this.turnLoadButtonSpinnerOff = this.turnLoadButtonSpinnerOff.bind(this);
        this.turnLoadButtonSpinnerOn = this.turnLoadButtonSpinnerOn.bind(this);
        this.turnExportButtonSpinnerOff = this.turnExportButtonSpinnerOff.bind(this);
        this.turnExportButtonSpinnerOn = this.turnExportButtonSpinnerOn.bind(this);
        this.turnBuildButtonSpinnerOff = this.turnBuildButtonSpinnerOff.bind(this);
        this.turnBuildButtonSpinnerOn = this.turnBuildButtonSpinnerOn.bind(this);
        this.ruleAlreadyExists = this.ruleAlreadyExists.bind(this);
        this.getListOfMatchingSymbolNames = this.getListOfMatchingSymbolNames.bind(this);
        this.attemptToBuildProductionist = this.attemptToBuildProductionist.bind(this);
        this.buildProductionist = this.buildProductionist.bind(this);
        this.state = {
            currentGrammarName: 'new',
            bundleName: '',
            nonterminals: [],
            markups: [],
            system_vars: [],
            expansion_feedback: "",
            markup_feedback: [],
            current_nonterminal: "",
            current_rule: -1,
            ruleDefinitionModalIsOpen: false,
            idOfRuleToEdit: null,
            symbolFilterQuery: "",
            exportButtonDisabled: true,
            buildButtonDisabled: true,
            testButtonDisabled: true,
            loadButtonSpinnerOn: false,
            exportButtonSpinnerOn: false,
            buildButtonSpinnerOn: false,
            headerBarSaveButtonIsJuicing: false,
            headerBarExportButtonIsJuicing: false,
            headerBarBuildButtonIsJuicing: false,
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
        ajax({
            url: $SCRIPT_ROOT + '/api/default',
            dataType: 'json',
            cache: false,
            success: (data) => {
                this.setState({
                    nonterminals: data['nonterminals'],
                    markups: data['markups'],
                    system_vars: data['system_vars'],
                })
            },
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    }

    onBackButtonEvent(e) {
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

    updateFromServer(additionalFunctionToExecuteUponSuccess) {
        ajax({
            url: $SCRIPT_ROOT + '/api/default',
            dataType: 'json',
            cache: false,
            success: (data) => {
                this.setState({nonterminals: data['nonterminals']})
                this.setState({markups: data['markups']})
                this.setState({system_vars: data['system_vars']})
                this.determineIfExportButtonIsDisabled(data['nonterminals'])
                if (additionalFunctionToExecuteUponSuccess !== undefined) {
                    additionalFunctionToExecuteUponSuccess();
                }
            },
            error: (xhr, status, err) => {
                console.error(this.props.url, status, err.toString())
            }
        });
    }

    updateHistory(nonterminal, rule) {
        if( nonterminal != '') {
            browserHistory.push('/'+nonterminal+'/'+String(rule))
        } else {
            browserHistory.push('/')
        }
    }

    updateCurrentNonterminal(newTagOrNonterminal) {
        this.setState({current_nonterminal: newTagOrNonterminal});
    }

    updateCurrentRule(newCurrentRule) {
        this.setState({current_rule: newCurrentRule});
    }

    updateMarkupFeedback(newMarkupFeedback) {
        this.setState({markup_feedback: newMarkupFeedback});
    }

    updateExpansionFeedback(newExpansionFeedback) {
        this.setState({expansion_feedback: newExpansionFeedback});
    }

    determineIfExportButtonIsDisabled(nonterminals) {
        // Disable the 'Export' button only if there are no top-level, complete symbols
        // in the grammar
        var disableExportButton = true;
        for (var symbolName in nonterminals) {
            if (nonterminals[symbolName].deep && nonterminals[symbolName].rules.length > 0) {
                disableExportButton = false;
                break;
            }
        }
        this.setState({exportButtonDisabled: disableExportButton})
    }

    enableBuildButton() {
        this.setState({buildButtonDisabled: false});
    }

    disableBuildButton() {
        this.setState({buildButtonDisabled: true});
    }

    enableTestButton() {
        this.setState({testButtonDisabled: false});
    }

    disableTestButton() {
        this.setState({testButtonDisabled: true});
    }

    turnLoadButtonSpinnerOn() {
        this.setState({loadButtonSpinnerOn: true});
    }

    turnLoadButtonSpinnerOff() {
        this.setState({loadButtonSpinnerOn: false});
    }

    turnExportButtonSpinnerOn() {
        this.setState({exportButtonSpinnerOn: true});
    }

    turnExportButtonSpinnerOff() {
        this.setState({exportButtonSpinnerOn: false});
    }

    turnBuildButtonSpinnerOn() {
        this.setState({buildButtonSpinnerOn: true});
    }

    turnBuildButtonSpinnerOff() {
        this.setState({buildButtonSpinnerOn: false});
    }

    getexpansion(object) {
        var symbol = object['symbol']
        var index = object['index']
        return {"symbol": symbol, "index": index, "expansion": this.state.nonterminals[symbol].rules[index].expansion.join("")}
    }

    openRuleDefinitionModal(idOfRuleToEdit) {
        this.setState({ruleDefinitionModalIsOpen: true});
        this.setState({idOfRuleToEdit: idOfRuleToEdit});
    }

    closeRuleDefinitionModal() {
        this.setState({ruleDefinitionModalIsOpen: false});
        this.setState({idOfRuleToEdit: null});
    }

    updateSymbolFilterQuery(query) {
        this.setState({symbolFilterQuery: query});
    }

    getCurrentGrammarName() {
        return this.state.currentGrammarName;
    }

    setCurrentGrammarName(grammarName) {
        this.setState({currentGrammarName: grammarName.replace(".json", "")});
    }

    handlePotentialHotKeyPress(e) {
        // Check for a hot-key match (ctrl/command+{g,o,s,e,b,/,d})
        var quickNewHotKeyMatch = false;  // g
        var quickLoadHotKeyMatch = false;  // o
        var quickSaveHotKeyMatch = false;  // s
        var quickExportHotKeyMatch = false;  // e
        var quickBuildHotKeyMatch = false;  // b
        var quickTestHotKeyMatch = false;  // y
        var quickRuleDefineHotKeyMatch = false; // d
        if (e.ctrlKey || e.metaKey) {
            switch (String.fromCharCode(e.which).toLowerCase()) {
            case 'g':
                e.preventDefault();
                quickNewHotKeyMatch = true;
            case 'o':
                e.preventDefault();
                quickLoadHotKeyMatch = true;
            case 's':
                e.preventDefault();
                quickSaveHotKeyMatch = true;
                break;
            case 'e':
                e.preventDefault();
                quickExportHotKeyMatch = true;
                break;
            case 'b':
                e.preventDefault();
                quickBuildHotKeyMatch = true;
                break;
            case 'y':
                e.preventDefault();
                quickTestHotKeyMatch = true;
                break;
            case 'd':
                e.preventDefault();
                quickRuleDefineHotKeyMatch = true;
                break;
            }
        }
        // Quick new: simulate clicking of the 'New' button
        if (quickNewHotKeyMatch) {
            document.getElementById("headerBarNewButton").click();
        }
        // Quick load: simulate clicking of the 'Load' button
        else if (quickLoadHotKeyMatch && !this.state.loadButtonSpinnerOn) {
            document.getElementById("headerBarLoadButton").click();
        }
        // Quick rule define: simulate clicking of the '+' button for creating a new rule
        else if (quickRuleDefineHotKeyMatch) {
            document.getElementById("addRuleButton").click();
        }
        // Quick test: simulate clicking of the 'Test' button
        else if (quickTestHotKeyMatch && !this.state.testButtonDisabled) {
            document.getElementById("headerBarTestButton").click();
        }
        // Quick save: do a quick save by overwriting the current grammar file
        else if (quickSaveHotKeyMatch) {
            // Generate a juicy response (button lights green and fades back to gray)
            this.setState({headerBarSaveButtonIsJuicing: true});
            ajax({
                url: $SCRIPT_ROOT + '/api/grammar/save',
                type: "POST",
                contentType: "text/plain",
                data: this.getCurrentGrammarName(),
                async: true,
                cache: false,
                success: (status) => {}
            });
            var that = this;
            setTimeout(function() {
                that.setState({headerBarSaveButtonIsJuicing: false});
            }, 1000);
        }
        // Quick export: do a quick export by overwriting the current content-bundle files
        else if (quickExportHotKeyMatch && !this.state.exportButtonSpinnerOn && !this.state.exportButtonDisabled) {
            this.turnExportButtonSpinnerOn();
            ajax({
                url: $SCRIPT_ROOT + '/api/grammar/export',
                type: "POST",
                contentType: "text/plain",
                data: this.getCurrentGrammarName(),
                async: true,
                cache: false,
                success: (status) => {
                    this.turnExportButtonSpinnerOff();
                    this.setState({headerBarExportButtonIsJuicing: true});
                    this.enableBuildButton();
                    var that = this;
                    setTimeout(function() {
                        that.setState({headerBarExportButtonIsJuicing: false});
                    }, 1000);
                }
            })
        }
        // Quick build: build a Productionist
        else if (quickBuildHotKeyMatch && !this.state.buildButtonSpinnerOn && !this.state.buildButtonDisabled) {
            this.attemptToBuildProductionist();
        }
    }

    // returns an array of nonterminal names that match the symbolFilterQuery.
    getListOfMatchingSymbolNames(symbolFilterQuery) {
        var allSymbolNames = Object.keys(this.state.nonterminals);
        // If there's no filter query, all symbols match
        if (symbolFilterQuery == ''){
            return allSymbolNames
        }
        // If there's a filter query operating over tags, match all symbols having those tags; here's
        // an example of such a filter query: '$tags:Moves:greeting & Moves:farewell' (note: these
        // queries are treated in a case-sensitive manner because tags are case-sensitive)
        else if (symbolFilterQuery.slice(0, 6) == "$tags:") {
            var matches = [];
            var raw_tags = symbolFilterQuery.slice(6).split(' $& ');
            for (var i = 0; i < allSymbolNames.length; i++){
                var symbolName = allSymbolNames[i];
                var isMatch = true;
                for (var j = 0; j < raw_tags.length; j++){
                    if (!raw_tags[j].includes(':')) {
                        isMatch = false;
                    }
                    else {
                        var tagset = raw_tags[j].split(':')[0];
                        var tag = raw_tags[j].split(':')[1];
                        if (!(tagset in this.state.nonterminals[symbolName]["markup"])) {
                            isMatch = false;
                        }
                        else if (!(this.state.nonterminals[symbolName]["markup"][tagset].includes(tag))) {
                            isMatch = false;
                        }
                    }
                }
                if (isMatch){
                    matches.push(symbolName);
                }
            }
            return matches;
        }
        // If there's a filter query operating over symbol expansions, match all symbols that have
        // a production rule whose body includes a terminal symbol for which the filter-query component
        // is a substring
        else if (symbolFilterQuery.slice(0, 6) == "$text:") {
            if (symbolFilterQuery === "$text:") {return []}  // Otherwise every complete symbol matches
            var matches = [];
            var text = symbolFilterQuery.slice(6);
            for (var i = 0; i < allSymbolNames.length; i++){
                var symbolName = allSymbolNames[i];
                var isMatch = false;
                var productionRules = this.state.nonterminals[symbolName]["rules"];
                for (var j = 0; j < productionRules.length; j++){
                    var productionRule = productionRules[j];
                    for (var k = 0; k < productionRule["expansion"].length; k++){
                        var symbol = productionRule["expansion"][k];
                        if (symbol.slice(0, 2) != '[[' && symbol.toLowerCase().indexOf(text.toLowerCase()) != -1) {
                            isMatch = true;
                        }
                    }
                }
                if (isMatch){
                    matches.push(symbolName);
                }
            }
            return matches;
        }
        // Lastly, handle conventional filter queries, which simply match against the symbol names (in
        // a case-insensitive manner)
        return allSymbolNames.filter( (symbolName) => {
            // A given symbol is a match if the filter query is a substring of its name
            var isMatch = symbolName.toLowerCase().indexOf(symbolFilterQuery.toLowerCase());
            if (isMatch != -1){ return true; }
            return false;
        })
    }

    ruleAlreadyExists(ruleHeadName, ruleBody, applicationRate) {
        // Return whether a rule with the given attributes has already been defined
        if (!(ruleHeadName in this.state.nonterminals)) {
            return false
        }
        for (var i = 0; i < this.state.nonterminals[ruleHeadName].rules.length; i++) {
            var rule = this.state.nonterminals[ruleHeadName].rules[i];
            if (ruleBody === rule.expansion.join('')) {
                if (this.state.idOfRuleToEdit !== null) {
                    if (applicationRate != rule.app_rate) {
                        return false;
                    }
                }
                return true
            }
        }
        return false
    }

    attemptToBuildProductionist() {
        // First, make sure that there is an exported content bundle that shares the same name
        // with the current grammar (specifically, check for the corresponding .grammar and
        // .meanings files) -- if not, it's probably because the author changes the filenames
        // manually, in which case we should alert them of that and suggest that they re-export
        // to target the desired filenames
        ajax({
            url: $SCRIPT_ROOT + '/api/load_bundles',
            type: "GET",
            cache: false,
            success: (data) => {
                var grammarName = this.getCurrentGrammarName();
                var grammarFileEncountered = false;
                var meaningsFileEncountered = false;
                for (var i = 0; i < data.results.length; i++) {
                    var bundleFileFilename = data.results[i];
                    if (bundleFileFilename === grammarName + '.grammar') {
                        grammarFileEncountered = true;
                    }
                    else if (bundleFileFilename === grammarName + '.meanings') {
                        meaningsFileEncountered = true;
                    }
                }
                if (grammarFileEncountered && meaningsFileEncountered) {
                    this.buildProductionist(grammarName);
                }
                else {
                    alert("A Productionist module could not be built because an exported content bundle corresponding to this grammar could not be found. This means that the following expected files are not in the /exports directory: '" + grammarName + ".grammar' and '" + grammarName + ".meanings'. Perhaps one or both were deleted or renamed?")
                }
            }
        })
    }

    buildProductionist(contentBundleName) {
        this.turnBuildButtonSpinnerOn();
        ajax({
            url: $SCRIPT_ROOT + '/api/grammar/build',
            type: "POST",
            contentType: "text/plain",
            data: contentBundleName,
            cache: false,
            success: (data) => {
                this.turnBuildButtonSpinnerOff();
                this.setState({bundleName: contentBundleName, headerBarBuildButtonIsJuicing: true});
                this.enableTestButton();
                var that = this;
                setTimeout(function() {
                    that.setState({headerBarBuildButtonIsJuicing: false});
                }, 1000);
            }
        })
    }

    componentDidMount() {
        document.addEventListener("keydown", this.handlePotentialHotKeyPress, false);
    }

    render() {
        var def_rules = []
        var board
        var referents
        if (this.state.current_nonterminal in this.state.nonterminals) {
            var current = this.state.nonterminals[this.state.current_nonterminal]
            def_rules = this.state.nonterminals[this.state.current_nonterminal].rules
            // Check which board we need to render
            if (this.state.current_rule === -1 || current.rules[this.state.current_rule] === null ) {
                var referents = []
                if ("referents" in current)  {
                    var referents = current["referents"];
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
                                    nonterminals={this.state.nonterminals}
                                    updateFromServer={this.updateFromServer}
                                    updateCurrentNonterminal={this.updateCurrentNonterminal}
                                    updateCurrentRule={this.updateCurrentRule}
                                    updateMarkupFeedback={this.updateMarkupFeedback}
                                    updateExpansionFeedback={this.updateExpansionFeedback}
                                    updateHistory={this.updateHistory}
                                    expansion={def_rules[this.state.current_rule].expansion}
                                    app_rate={def_rules[this.state.current_rule].app_rate}
                                    openRuleDefinitionModal={this.openRuleDefinitionModal}/>
            }
        }

        return (
            <div style={{position: "fixed", top: 0, right: 0, "height": "100%", "width": "100%"}}>
                <div
                    style={{ "height": "70%", "width": "75%", position: "absolute", top: 0, left: 0}}>
                    <HeaderBar  updateCurrentNonterminal={this.updateCurrentNonterminal}
                                updateCurrentRule={this.updateCurrentRule}
                                updateMarkupFeedback={this.updateMarkupFeedback}
                                updateExpansionFeedback={this.updateExpansionFeedback}
                                updateHistory={this.updateHistory}
                                update={this.updateFromServer}
                                getCurrentGrammarName={this.getCurrentGrammarName}
                                setCurrentGrammarName={this.setCurrentGrammarName}
                                bundleName={this.state.bundleName}
                                systemVars={this.state.system_vars}
                                exportButtonDisabled={this.state.exportButtonDisabled}
                                buildButtonDisabled={this.state.buildButtonDisabled}
                                testButtonDisabled={this.state.testButtonDisabled}
                                enableTestButton={this.enableTestButton}
                                disableTestButton={this.disableTestButton}
                                enableBuildButton={this.enableBuildButton}
                                disableBuildButton={this.disableBuildButton}
                                loadButtonSpinnerOn={this.state.loadButtonSpinnerOn}
                                exportButtonSpinnerOn={this.state.exportButtonSpinnerOn}
                                buildButtonSpinnerOn={this.state.buildButtonSpinnerOn}
                                turnLoadButtonSpinnerOff={this.turnLoadButtonSpinnerOff}
                                turnLoadButtonSpinnerOn={this.turnLoadButtonSpinnerOn}
                                turnExportButtonSpinnerOff={this.turnExportButtonSpinnerOff}
                                turnExportButtonSpinnerOn={this.turnExportButtonSpinnerOn}
                                turnBuildButtonSpinnerOff={this.turnBuildButtonSpinnerOff}
                                turnBuildButtonSpinnerOn={this.turnBuildButtonSpinnerOn}
                                headerBarSaveButtonIsJuicing={this.state.headerBarSaveButtonIsJuicing}
                                headerBarExportButtonIsJuicing={this.state.headerBarExportButtonIsJuicing}
                                headerBarBuildButtonIsJuicing={this.state.headerBarBuildButtonIsJuicing}
                                attemptToBuildProductionist={this.attemptToBuildProductionist}/>
                    <div className="muwrap">
                        <div className="show-y-wrapper">
                            <MarkupBar  className="markup-bar"
                                        currentNonterminal={this.state.current_nonterminal}
                                        updateFromServer={this.updateFromServer}
                                        nonterminals={this.state.nonterminals}
                                        total={this.state.markups}
                                        updateSymbolFilterQuery={this.updateSymbolFilterQuery}
                                        currentNonterminalName={this.state.current_nonterminal}
                                        currentRule={this.state.current_rule}/>
                        </div>
                    </div>
                    {board}
                    <div className="muwrap" style={{"position": "absolute", "bottom": 0}}>
                        <RuleBar    rules={def_rules}
                                    updateFromServer={this.updateFromServer}
                                    nonterminals={this.state.nonterminals}
                                    name={this.state.current_nonterminal}
                                    updateCurrentNonterminal={this.updateCurrentNonterminal}
                                    updateCurrentRule={this.updateCurrentRule}
                                    updateMarkupFeedback={this.updateMarkupFeedback}
                                    updateExpansionFeedback={this.updateExpansionFeedback}
                                    updateHistory={this.updateHistory}
                                    closeRuleDefinitionModal={this.closeRuleDefinitionModal}
                                    ruleDefinitionModalIsOpen={this.state.ruleDefinitionModalIsOpen}
                                    idOfRuleToEdit={this.state.idOfRuleToEdit}
                                    ruleAlreadyExists={this.ruleAlreadyExists}
                                    currentRule={this.state.current_rule}
                                    getListOfMatchingSymbolNames={this.getListOfMatchingSymbolNames}/>
                    </div>
                </div>

                <div
                    style={{"overflow": "auto", "width": "25%", "height":"100%", position: "absolute", top: 0, right: 0, "border": "10px solid #f2f2f2", "borderTop": "4px solid rgb(242, 242, 242)"}}>
                    <NonterminalList    nonterminals={this.state.nonterminals}
                                        updateFromServer={this.updateFromServer}
                                        updateCurrentNonterminal={this.updateCurrentNonterminal}
                                        updateHistory={this.updateHistory}
                                        updateCurrentRule={this.updateCurrentRule}
                                        updateMarkupFeedback={this.updateMarkupFeedback}
                                        updateExpansionFeedback={this.updateExpansionFeedback}
                                        updateSymbolFilterQuery={this.updateSymbolFilterQuery}
                                        symbolFilterQuery={this.state.symbolFilterQuery}
                                        currentNonterminalName={this.state.current_nonterminal}
                                        getListOfMatchingSymbolNames={this.getListOfMatchingSymbolNames}>
                    </NonterminalList>
                </div>
                <div style={{"width": "75%", "height": "30%", position: "absolute", bottom: 0, left:0}}>
                    <FeedbackBar derivation={this.state.expansion_feedback} markup={this.state.markup_feedback}/>
                </div>
            </div>
        );
    }
}

module.exports = Interface;
