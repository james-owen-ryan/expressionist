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


var navigationHistory = [];  // Array of [symbolName, ruleId] entries
var currentIndexInNavigationHistory = -1;
var grammarHistory = [];  // Array of [grammarState (JSON), currentSymbolName, currentRuleId] entries
var currentIndexInGrammarHistory = -1;
var unsavedChanges = false;


class Interface extends React.Component {

    constructor(props) {
        super(props);
        this.updateFromServer = this.updateFromServer.bind(this);
        this.updateCurrentSymbolName = this.updateCurrentSymbolName.bind(this);
        this.updateCurrentRule = this.updateCurrentRule.bind(this);
        this.updateGeneratedContentPackageTags = this.updateGeneratedContentPackageTags.bind(this);
        this.updateGeneratedContentPackageText = this.updateGeneratedContentPackageText.bind(this);
        this.updateGrammarHistory = this.updateGrammarHistory.bind(this);
        this.resetGrammarHistoryAndNavigationHistory = this.resetGrammarHistoryAndNavigationHistory.bind(this);
        this.undo = this.undo.bind(this);
        this.redo = this.redo.bind(this);
        this.updateNavigationHistory = this.updateNavigationHistory.bind(this);
        this.goBack = this.goBack.bind(this);
        this.goForward = this.goForward.bind(this);
        this.getGeneratedContentPackage = this.getGeneratedContentPackage.bind(this);
        this.newGrammar = this.newGrammar.bind(this);
        this.loadGrammar = this.loadGrammar.bind(this);
        this.saveGrammar = this.saveGrammar.bind(this);
        this.exportGrammar = this.exportGrammar.bind(this);
        this.openLoadModal = this.openLoadModal.bind(this);
        this.openSaveModal = this.openSaveModal.bind(this);
        this.openExportModal = this.openExportModal.bind(this);
        this.openTestModal = this.openTestModal.bind(this);
        this.closeLoadModal = this.closeLoadModal.bind(this);
        this.closeSaveModal = this.closeSaveModal.bind(this);
        this.closeExportModal = this.closeExportModal.bind(this);
        this.closeTestModal = this.closeTestModal.bind(this);
        this.openRuleDefinitionModal = this.openRuleDefinitionModal.bind(this);
        this.closeRuleDefinitionModal = this.closeRuleDefinitionModal.bind(this);
        this.toggleWhetherRuleDefinitionModalIsOpen = this.toggleWhetherRuleDefinitionModalIsOpen.bind(this);
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
        this.symbolNameAlreadyExists = this.symbolNameAlreadyExists.bind(this);
        this.ruleAlreadyExists = this.ruleAlreadyExists.bind(this);
        this.getListOfMatchingSymbolNames = this.getListOfMatchingSymbolNames.bind(this);
        this.getListOfMatchingStateElements = this.getListOfMatchingStateElements.bind(this);
        this.attemptToBuildProductionist = this.attemptToBuildProductionist.bind(this);
        this.buildProductionist = this.buildProductionist.bind(this);
        this.letInterfaceKnowTextFieldEditingHasStarted = this.letInterfaceKnowTextFieldEditingHasStarted.bind(this);
        this.letInterfaceKnowTextFieldEditingHasStopped = this.letInterfaceKnowTextFieldEditingHasStopped.bind(this);
        this.letInterFaceKnowTagDefinitionModalIsOpen = this.letInterFaceKnowTagDefinitionModalIsOpen.bind(this);
        this.letInterFaceKnowTagDefinitionModalIsClosed = this.letInterFaceKnowTagDefinitionModalIsClosed.bind(this);
        this.state = {
            currentGrammarName: 'new',
            bundleName: '',
            nonterminals: [],
            tagsets: [],
            generatedContentPackageText: "",
            generatedContentPackageTags: [],
            currentSymbol: "",
            currentRule: -1,
            idOfRuleToEdit: null,
            idOfRuleToDuplicate: null,
            symbolFilterQuery: "",
            exportButtonDisabled: true,
            buildButtonDisabled: true,
            testButtonDisabled: true,
            loadButtonSpinnerOn: false,
            exportButtonSpinnerOn: false,
            buildButtonSpinnerOn: false,
            logoButtonIsJuicing: false,
            newButtonIsJuicing: false,
            loadButtonIsJuicing: false,
            saveButtonIsJuicing: false,
            exportButtonIsJuicing: false,
            buildButtonIsJuicing: false,
            playButtonIsJuicing: false,
            showLoadModal: false,
            showSaveModal: false,
            showExportModal: false,
            showTestModal: false,
            showRuleDefinitionModal: false,
            tagDefinitionModalIsOpen: false,
            textFieldEditingIsOccurring: false,
            stateElements: []
        }
    }

    newGrammar() {
        if (unsavedChanges) {
            var prompt = window.confirm("Are you sure you'd like to start a new grammar? You have unsaved changes that will be lost.");
            if (prompt == false){
                return false;
            }
        }
        ajax({
            url: $SCRIPT_ROOT + '/api/grammar/new',
            type: 'GET',
            cache: false,
            success: (status) => {
                this.setState({
                    newButtonIsJuicing: true,
                    currentSymbol: '',
                    currentRule: -1,
                    generatedContentPackageText: '',
                    generatedContentPackageTags: [],
                    currentGrammarName: "",
                    symbolFilterQuery: ''
                });
                this.updateFromServer();
                this.disableTestButton();
                this.disableBuildButton();
                this.resetGrammarHistoryAndNavigationHistory();
                unsavedChanges = false;
            }
        });
        var that = this;
        setTimeout(function() {
            that.setState({newButtonIsJuicing: false});
        }, 1000);
    }

    loadGrammar(filename) {
        if (unsavedChanges) {
            var prompt = window.confirm("Are you sure you'd like to load a different grammar? You have unsaved changes that will be lost.");
            if (prompt == false){
                return false;
            }
        }
        this.closeLoadModal();
        this.turnLoadButtonSpinnerOn();
        ajax({
            url: $SCRIPT_ROOT + '/api/grammar/from_file',
            type: "POST",
            contentType: "json",
            data: filename,
            success: () => {
                this.setState({
                    currentSymbol: '',
                    currentRule: -1,
                    generatedContentPackageText: '',
                    generatedContentPackageTags: [],
                    symbolFilterQuery: ''
                });
                this.updateFromServer(this.turnLoadButtonSpinnerOff);
                this.disableTestButton();
                this.disableBuildButton();
                this.setCurrentGrammarName(filename);
                this.resetGrammarHistoryAndNavigationHistory();
            },
            cache: false
        })
    }

    saveGrammar() {
        ajax({
            url: $SCRIPT_ROOT + '/api/grammar/save',
            type: "POST",
            contentType: "text/plain",
            data: this.getCurrentGrammarName(),
            async: true,
            cache: false,
            success: (status) => {
                // Generate a juicy response (button lights green and TURNS back to gray)
                this.setState({saveButtonIsJuicing: true});
                unsavedChanges = false;
            }
        })
        var that = this;
        setTimeout(function() {
            that.setState({saveButtonIsJuicing: false});
        }, 1000);
    }

    exportGrammar() {
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
                this.enableBuildButton();
                // Generate a juicy response (button lights green and turns back to gray)
                this.setState({exportButtonIsJuicing: true});
                var that = this;
                setTimeout(function() {
                    that.setState({exportButtonIsJuicing: false});
                }, 1000);
            }
        })
    }

    letInterfaceKnowTextFieldEditingHasStarted() {
        // Certain hot keys are disabled while a text field is being edited, namely those for grammar
        // navigation and undo/redo, since the browser already has established text-editing functions
        // for those key combinations
        this.setState({textFieldEditingIsOccurring: true});
    }

    letInterfaceKnowTextFieldEditingHasStopped() {
        this.setState({textFieldEditingIsOccurring: false});
    }

    letInterFaceKnowTagDefinitionModalIsOpen() {
        this.setState({tagDefinitionModalIsOpen: true});
    }

    letInterFaceKnowTagDefinitionModalIsClosed() {
        this.setState({tagDefinitionModalIsOpen: false});
    }

    openLoadModal() {
        this.setState({showLoadModal: true});
    }

    openSaveModal() {
        this.setState({showSaveModal: true});
    }

    openExportModal(){
        this.setState({showExportModal: true});
    }

    openTestModal() {
        this.setState({showTestModal: true});
    }

    closeLoadModal() {
        this.setState({showLoadModal: false});
    }

    closeSaveModal() {
        this.setState({showSaveModal: false});
    }

    closeExportModal(){
        this.setState({showExportModal: false});
    }

    closeTestModal() {
        this.setState({showTestModal: false});
    }

    openRuleDefinitionModal(idOfRuleToEdit, idOfRuleToDuplicate) {
        this.setState({
            showRuleDefinitionModal: true,
            idOfRuleToEdit: idOfRuleToEdit,
            idOfRuleToDuplicate: idOfRuleToDuplicate
        });
    }

    closeRuleDefinitionModal() {
        this.setState({showRuleDefinitionModal: false});
        this.setState({idOfRuleToEdit: null});
    }

    toggleWhetherRuleDefinitionModalIsOpen() {
        if (this.state.showRuleDefinitionModal) {
            this.closeRuleDefinitionModal();
        }
        else {
            this.openRuleDefinitionModal(null, null);
        }
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
        this.setState({
            loadButtonSpinnerOn: false,
            loadButtonIsJuicing: true
        });
        var that = this;
        setTimeout(function() {
            that.setState({loadButtonIsJuicing: false});
        }, 1000);
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

    getGeneratedContentPackage(object) {
        var symbol = object['symbol'];
        var index = object['index'];
        var generatedContentPackage = {
            "symbol": symbol,
            "index": index,
            "expansion": this.state.nonterminals[symbol].rules[index].expansion.join("")
        }
        return generatedContentPackage
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
        // Check for rule tabbing (note: tabbing on other views is handled in the respective components)
        var atLeastOneModalIsOpen = (this.state.showSaveModal || this.state.showLoadModal || this.state.showExportModal || this.state.showTestModal || this.state.showRuleDefinitionModal || this.state.tagDefinitionModalIsOpen);
        if (e.key === 'Tab' && !atLeastOneModalIsOpen) {
            e.preventDefault();
            if (this.state.currentSymbol !== "" && this.state.nonterminals[this.state.currentSymbol].rules.length > 0) {
                var newCurrentRule = this.state.currentRule;
                if (e.shiftKey) {
                    // Tab left
                    newCurrentRule -= 1;
                }
                else {
                    // Tab right
                    newCurrentRule += 1
                }
                if (newCurrentRule < 0) {
                    // Tabbed left past first rule; wrap back to right end
                    newCurrentRule = this.state.nonterminals[this.state.currentSymbol].rules.length - 1;
                }
                else if (newCurrentRule > this.state.nonterminals[this.state.currentSymbol].rules.length - 1) {
                    // Tabbed right past last rule; wrap back to left end
                    newCurrentRule = 0;
                }
                this.setState({currentRule: newCurrentRule})
            }
        }
        else {
            // Check for a hot-key match (ctrl/command + ...)
            var quickNewHotKeyMatch = false;  // g
            var quickLoadHotKeyMatch = false;  // o
            var quickSaveHotKeyMatch = false;  // s
            var quickExportHotKeyMatch = false;  // e
            var quickBuildHotKeyMatch = false;  // b
            var quickTestHotKeyMatch = false;  // .
            var quickRuleDefineHotKeyMatch = false; // d
            var quickRuleEditHotKeyMatch = false;  // shift+d
            var quickRuleCopyHotKeyMatch = false; // shift+c
            var quickTestRewriteHotKeyMatch = false;  // enter
            var viewRuleHeadHotKeyMatch = false; // up arrow
            var goBackHotKeyMatch = false; // left arrow
            var goForwardHotKeyMatch = false; // right arrow
            var undoHotKeyMatch = false;  // z
            var redoHotKeyMatch = false;  // shift+z (or y)
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'Enter') {
                    if (!this.state.showRuleDefinitionModal) {
                        e.preventDefault();
                        quickTestRewriteHotKeyMatch = true;
                    }
                }
                else if (e.key === 'ArrowUp') {
                    // Disable this if a modal is open or a text field is being edited
                    if (!atLeastOneModalIsOpen && !this.state.textFieldEditingIsOccurring && document.activeElement.type !== 'text') {
                        e.preventDefault();
                        viewRuleHeadHotKeyMatch = true;
                    }
                }
                else if (e.key === 'ArrowLeft') {
                    // Disable this if a modal is open or a text field is being edited
                    if (!atLeastOneModalIsOpen && !this.state.textFieldEditingIsOccurring && document.activeElement.type !== 'text') {
                        e.preventDefault();
                        goBackHotKeyMatch = true;
                    }
                }
                else if (e.key === 'ArrowRight') {
                    // Disable this if a modal is open or a text field is being edited
                    if (!atLeastOneModalIsOpen && !this.state.textFieldEditingIsOccurring && document.activeElement.type !== 'text') {
                        e.preventDefault();
                        goForwardHotKeyMatch = true;
                    }
                }
                else if (e.key === '.') {
                    e.preventDefault();
                    quickTestHotKeyMatch = true;
                }
                // For some bizarre reason, these must be caught this way to not break browser undo/redo functionality
                else if (e.key === 'z') {
                    // Disable this if a modal is open or a text field is being edited
                    if (!atLeastOneModalIsOpen && !this.state.textFieldEditingIsOccurring && document.activeElement.type !== 'text') {
                        e.preventDefault
                        if (e.shiftKey) {
                            redoHotKeyMatch = true;
                        }
                        else {
                            undoHotKeyMatch = true;
                        }
                    }
                }
                else if (e.key === 'y') {
                    // Disable this if a modal is open or a text field is being edited
                    if (!atLeastOneModalIsOpen && !this.state.textFieldEditingIsOccurring && document.activeElement.type !== 'text') {
                        redoHotKeyMatch = true;
                    }
                }
                else {
                    switch (String.fromCharCode(e.which).toLowerCase()) {
                        case 'g':
                            e.preventDefault();
                            quickNewHotKeyMatch = true;
                            break;
                        case 'o':
                            e.preventDefault();
                            quickLoadHotKeyMatch = true;
                            break;
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
                        case 'd':
                            e.preventDefault();
                            if (e.shiftKey) {
                                quickRuleEditHotKeyMatch = true;
                            }
                            else {
                                quickRuleDefineHotKeyMatch = true;
                            }
                            break;
                        case 'c':
                            if (e.shiftKey) {
                                e.preventDefault();
                                quickRuleCopyHotKeyMatch = true;
                            }
                            break;
                        case 'r':
                            e.preventDefault();  // Disable page reloading, which breaks history keeping
                   }
                }
            }
            // View rule head: jump from current rule to the that is its rule head ("go up", if you will)
            if (viewRuleHeadHotKeyMatch) {
                this.setState({currentRule: -1});
            }
            // Go back: return to the previous symbol or rule
            else if (goBackHotKeyMatch) {
                this.goBack();
            }
            // Go forward: return to the next symbol or rule (after having gone back already)
            else if (goForwardHotKeyMatch) {
                this.goForward();
            }
            // Quick new: simulate clicking of the 'New' button
            else if (quickNewHotKeyMatch) {
                document.getElementById("headerBarNewButton").click();
            }
            // Quick load: simulate clicking of the 'Load' button
            else if (quickLoadHotKeyMatch && !this.state.loadButtonSpinnerOn) {
                if (this.state.showLoadModal) {
                    this.closeLoadModal();
                }
                else {
                    this.openLoadModal();
                }
            }
            // Quick rule define: simulate clicking of the '+' button for creating a new rule
            else if (quickRuleDefineHotKeyMatch) {
                if (this.state.showRuleDefinitionModal) {
                    this.closeRuleDefinitionModal();
                }
                else {
                    this.openRuleDefinitionModal(null, null);
                }
            }
            // Quick rule edit: simulate clicking of the button for editing a new rule
            else if (quickRuleEditHotKeyMatch && document.getElementById("editRuleButton")) {
                if (this.state.showRuleDefinitionModal) {
                    this.closeRuleDefinitionModal();
                }
                else {
                    document.getElementById("editRuleButton").click();
                }
            }
            // Quick rule copy: simulate clicking of the button for copying a rule definition
            else if (quickRuleCopyHotKeyMatch && document.getElementById("copyRuleButton")) {
                if (this.state.showRuleDefinitionModal) {
                    this.closeRuleDefinitionModal();
                }
                else {
                    document.getElementById("copyRuleButton").click();
                }
            }
            // Quick rewrite test: simulate clicking of the 'play' button for testing symbol rewriting or rule execution
            else if (quickTestRewriteHotKeyMatch) {
                this.setState({playButtonIsJuicing: true});
                if (this.state.showTestModal) {
                    document.getElementById("testModalPlayButton").click();
                }
                else if (document.getElementById("playButton")) {
                    document.getElementById("playButton").click();
                }
                var that = this;
                setTimeout(function() {
                    that.setState({playButtonIsJuicing: false});
                }, 50);
            }
            // Quick test: simulate clicking of the 'Test' button
            else if (quickTestHotKeyMatch && !this.state.testButtonDisabled) {
                if (this.state.showTestModal) {
                    this.closeTestModal();
                }
                else {
                    document.getElementById("headerBarTestButton").click();
                }
            }
            // Quick save: do a quick save by overwriting the current grammar file
            else if (quickSaveHotKeyMatch) {
                // Generate a juicy response (button lights green and TURNS back to gray)
                this.setState({saveButtonIsJuicing: true});
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
                    that.setState({saveButtonIsJuicing: false});
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
                        this.setState({exportButtonIsJuicing: true});
                        this.enableBuildButton();
                        var that = this;
                        setTimeout(function() {
                            that.setState({exportButtonIsJuicing: false});
                        }, 1000);
                    }
                })
            }
            // Quick build: build a Productionist
            else if (quickBuildHotKeyMatch && !this.state.buildButtonSpinnerOn && !this.state.buildButtonDisabled) {
                this.attemptToBuildProductionist();
            }
            // Undo
            else if (undoHotKeyMatch) {
                this.undo();
            }
            // Redo
            else if (redoHotKeyMatch) {
                this.redo();
            }
        }
    }

    // Returns an array of nonterminal names that match the symbolFilterQuery.
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
        // Lastly, handle conventional filter queries, which simply match against the symbol
        // names (in a case-insensitive manner)
        return allSymbolNames.filter( (symbolName) => {
            // A given symbol is a match if the filter query is a substring of its name
            var isMatch = symbolName.toLowerCase().indexOf(symbolFilterQuery.toLowerCase());
            if (isMatch != -1) {
                return true;
            }
            return false;
        })
    }

    getListOfMatchingStateElements(stateElementFilterQuery) {
        var allStateElements = this.state.stateElements;
        // If there's no filter query, all state elements match
        if (stateElementFilterQuery == ''){
            return allStateElements
        }
        // Otherwise, match against the state elements that have been used so far (in a
        // case-insensitive manner)
        return allStateElements.filter( (stateElement) => {
            // A given state element is a match if the filter query is a substring of it
            var isMatch = stateElement.toLowerCase().indexOf(stateElementFilterQuery.toLowerCase());
            if (isMatch != -1) {
                return true;
            }
            return false;
        })
    }

    ruleAlreadyExists(ruleHeadName, ruleBody, applicationRate, preconditionsStr, effectsStr) {
        // Return whether a rule with the given attributes has already been defined
        if (!(ruleHeadName in this.state.nonterminals)) {
            return false
        }
        for (var i = 0; i < this.state.nonterminals[ruleHeadName].rules.length; i++) {
            var rule = this.state.nonterminals[ruleHeadName].rules[i];
            if (ruleBody === rule.expansion.join('')) {
                if (this.state.idOfRuleToEdit !== null) {
                    // Only consider the application rate if the current rule is being edited in
                    // the rule-definition modal, in which case changing the application rate is
                    // a valid way to change the rule; in all other cases, a different application
                    // rate would mean that the rule in question matches an existing rule in all but
                    // its application rate, and in Expressionist that is a case of duplicate rules,
                    // which we don't allow (the way to make a rule more likely is to modulate its
                    // application rate, not to duplicate it as in Tracery)
                    if (applicationRate != rule.app_rate) {
                        return false;
                    }
                    // Additionally, changing the rule being edited's preconditions or effects
                    // is a viable modification
                    if (preconditionsStr != rule.preconditionsStr || effectsStr != rule.effectsStr) {
                        return false;
                    }
                }
                return true
            }
        }
        return false
    }

    symbolNameAlreadyExists(symbolName) {
        return (symbolName in this.state.nonterminals)
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
                this.setState({bundleName: contentBundleName, buildButtonIsJuicing: true});
                this.enableTestButton();
                var that = this;
                setTimeout(function() {
                    that.setState({buildButtonIsJuicing: false});
                }, 1000);
            }
        })
    }

    updateFromServer(additionalFunctionToExecuteUponSuccess) {
        ajax({
            url: $SCRIPT_ROOT + '/api/default',
            dataType: 'json',
            cache: false,
            success: (data) => {
                this.setState({
                    nonterminals: data['nonterminals'],
                    tagsets: data['markups']
                });
                this.updateGrammarHistory(data);
                this.determineIfExportButtonIsDisabled(data['nonterminals']);
                if (additionalFunctionToExecuteUponSuccess !== undefined) {
                    additionalFunctionToExecuteUponSuccess();
                }
            },
            error: (xhr, status, err) => {
                console.error(this.props.url, status, err.toString())
            }
        });
    }

    updateCurrentSymbolName(newSymbolName) {
        this.setState({currentSymbol: newSymbolName});
    }

    updateCurrentRule(newCurrentRule) {
        this.setState({currentRule: newCurrentRule});
    }

    updateGeneratedContentPackageTags(newGeneratedContentPackageTags) {
        this.setState({generatedContentPackageTags: newGeneratedContentPackageTags});
    }

    updateGeneratedContentPackageText(newGeneratedContentPackageText) {
        this.setState({generatedContentPackageText: newGeneratedContentPackageText});
    }

    resetGrammarHistoryAndNavigationHistory() {
        navigationHistory = [];
        currentIndexInNavigationHistory = -1;
        grammarHistory = [];
        currentIndexInGrammarHistory = -1;
        unsavedChanges = false;
    }

    updateGrammarHistory(grammarState) {
        if (grammarHistory.length > 0) {
            // Make sure this grammar state differs from the one in the current index
            var stateAtTheCurrentIndex = grammarHistory[currentIndexInGrammarHistory][0];
            var object = {
                "grammarState1": stateAtTheCurrentIndex,
                "grammarState2": grammarState
            }
            ajax({
                url: $SCRIPT_ROOT + '/api/grammar/check_equivalence',
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(object),
                success: (data) => {
                    var grammarsAreEquivalent = data['verdict'];
                    if (!grammarsAreEquivalent) {
                        grammarHistory = grammarHistory.slice(0, currentIndexInGrammarHistory+1);
                        var newEntry = [grammarState, this.state.currentSymbol, this.state.currentRule];
                        grammarHistory.push(newEntry);
                        currentIndexInGrammarHistory += 1;
                        unsavedChanges = true;
                    }
                },
                cache: false
            })
        }
        else {
            var firstEntry = [grammarState, this.state.currentSymbol, this.state.currentRule];
            grammarHistory = [firstEntry];
            currentIndexInGrammarHistory = 0;
        }
    }

    undo() {
        if (currentIndexInGrammarHistory > 0) {
            var newGrammarHistoryIndex = currentIndexInGrammarHistory - 1;
            var previousGrammarState = grammarHistory[newGrammarHistoryIndex][0];
            var previousGrammarStateSymbolName = grammarHistory[newGrammarHistoryIndex][1];
            var previousGrammarStateRuleId = grammarHistory[newGrammarHistoryIndex][2];
            currentIndexInGrammarHistory = newGrammarHistoryIndex;
            ajax({
                url: $SCRIPT_ROOT + '/api/grammar/load',
                type: "POST",
                contentType: "json",
                data: JSON.stringify(previousGrammarState),
                success: () => {
                    this.setState({
                        nonterminals: previousGrammarState['nonterminals'],
                        tagsets: previousGrammarState['markups'],
                        currentSymbol: previousGrammarStateSymbolName,
                        currentRule: previousGrammarStateRuleId,
                        generatedContentPackageText: "",
                        generatedContentPackageTags: [],
                        logoButtonIsJuicing: true
                    });
                    unsavedChanges = true;
                    // Reset navigation history (they don't entangle coherently)
                    navigationHistory = [];
                    currentIndexInNavigationHistory = -1;
                },
                cache: false
            })
            var that = this;
            setTimeout(function() {
                that.setState({logoButtonIsJuicing: false});
            }, 150);
        }
    }

    redo() {
        if (currentIndexInGrammarHistory < grammarHistory.length - 1) {
            var newGrammarHistoryIndex = currentIndexInGrammarHistory + 1;
            var nextGrammarState = grammarHistory[newGrammarHistoryIndex][0];
            var nextGrammarStateSymbolName = grammarHistory[newGrammarHistoryIndex][1];
            var nextGrammarStateRuleId = grammarHistory[newGrammarHistoryIndex][2];
            currentIndexInGrammarHistory = newGrammarHistoryIndex;
            ajax({
                url: $SCRIPT_ROOT + '/api/grammar/load',
                type: "POST",
                contentType: "json",
                data: JSON.stringify(nextGrammarState),
                success: () => {
                    this.setState({
                        nonterminals: nextGrammarState['nonterminals'],
                        tagsets: nextGrammarState['markups'],
                        currentSymbol: nextGrammarStateSymbolName,
                        currentRule: nextGrammarStateRuleId,
                        generatedContentPackageText: "",
                        generatedContentPackageTags: [],
                        logoButtonIsJuicing: true
                    });
                    unsavedChanges = true;
                    // Reset navigation history (they don't entangle coherently)
                    navigationHistory = [];
                    currentIndexInNavigationHistory = -1;
                },
                cache: false
            })
            var that = this;
            setTimeout(function() {
                that.setState({logoButtonIsJuicing: false});
            }, 150);
        }
    }

    updateNavigationHistory(symbolName, ruleId) {
        if (symbolName !== "") {
            var cleanRuleId = ruleId !== undefined ? ruleId : -1;
            var newEntry = [symbolName, cleanRuleId];
            if (navigationHistory.length > 0) {
                // Make sure this isn't already the entry at the current index
                var entryAtTheCurrentIndex = navigationHistory[currentIndexInNavigationHistory];
                if ((newEntry[0] !== entryAtTheCurrentIndex[0]) || (newEntry[1] !== entryAtTheCurrentIndex[1])) {
                    navigationHistory = navigationHistory.slice(0, currentIndexInNavigationHistory+1);
                    navigationHistory.push(newEntry);
                    currentIndexInNavigationHistory += 1;
                }
            }
            else {
                navigationHistory = [newEntry];
                currentIndexInNavigationHistory = 0;
            }
        }
    }

    goBack() {
        if (currentIndexInNavigationHistory > 0) {
            var newNavigationIndex = currentIndexInNavigationHistory - 1;
            var previousEntryInNavigationHistory = navigationHistory[newNavigationIndex];
            currentIndexInNavigationHistory = newNavigationIndex;
            this.setState({
                currentSymbol: previousEntryInNavigationHistory[0],
                currentRule: previousEntryInNavigationHistory[1],
                generatedContentPackageText: "",
                generatedContentPackageTags: [],
                logoButtonIsJuicing: true
            })
            var that = this;
            setTimeout(function() {
                that.setState({logoButtonIsJuicing: false});
            }, 150);
        }
    }

    goForward() {
        if (currentIndexInNavigationHistory < navigationHistory.length - 1) {
            var newNavigationIndex = currentIndexInNavigationHistory + 1;
            var nextEntryInNavigationHistory = navigationHistory[newNavigationIndex];
            currentIndexInNavigationHistory = newNavigationIndex;
            this.setState({
                currentSymbol: nextEntryInNavigationHistory[0],
                currentRule: nextEntryInNavigationHistory[1],
                generatedContentPackageText: "",
                generatedContentPackageTags: [],
                logoButtonIsJuicing: true
            })
            var that = this;
            setTimeout(function() {
                that.setState({logoButtonIsJuicing: false});
            }, 150);
        }
    }

    componentDidMount() {
        this.updateFromServer();  // This will reload the grammar in the case of a page refresh
        window.addEventListener('popstate', function (event) {
            event.preventDefault();
        });
        document.addEventListener("keydown", this.handlePotentialHotKeyPress, false);
    }

    render() {
        this.updateNavigationHistory(this.state.currentSymbol, this.state.currentRule);
        var definedRules = [];
        var board;
        var referents;
        if (this.state.currentSymbol in this.state.nonterminals) {
            var current = this.state.nonterminals[this.state.currentSymbol]
            definedRules = this.state.nonterminals[this.state.currentSymbol].rules
            // Check which board we need to render
            if (this.state.currentRule === -1 || current.rules[this.state.currentRule] === null ) {
                var referents = []
                if ("referents" in current)  {
                    var referents = current["referents"];
                    referents = referents.map(this.getGeneratedContentPackage.bind(this))
                }
                board = <NonterminalBoard   updateGeneratedContentPackageTags={this.updateGeneratedContentPackageTags}
                                            updateGeneratedContentPackageText={this.updateGeneratedContentPackageText}
                                            currentRule={this.state.currentRule}
                                            updateFromServer={this.updateFromServer}
                                            updateCurrentSymbolName={this.updateCurrentSymbolName}
                                            updateCurrentRule={this.updateCurrentRule}
                                            referents={referents}
                                            currentSymbolName={this.state.currentSymbol}
                                            nonterminal={this.state.nonterminals[this.state.currentSymbol]}
                                            symbolNameAlreadyExists={this.symbolNameAlreadyExists}
                                            playButtonIsJuicing={this.state.playButtonIsJuicing}
                                            letInterfaceKnowTextFieldEditingHasStarted={this.letInterfaceKnowTextFieldEditingHasStarted}
                                            letInterfaceKnowTextFieldEditingHasStopped={this.letInterfaceKnowTextFieldEditingHasStopped}/>
            }
            else {
                board = <RuleBoard  currentSymbolName={this.state.currentSymbol}
                                    currentRule={this.state.currentRule}
                                    nonterminals={this.state.nonterminals}
                                    updateFromServer={this.updateFromServer}
                                    updateCurrentSymbolName={this.updateCurrentSymbolName}
                                    updateCurrentRule={this.updateCurrentRule}
                                    updateGeneratedContentPackageTags={this.updateGeneratedContentPackageTags}
                                    updateGeneratedContentPackageText={this.updateGeneratedContentPackageText}
                                    expansion={definedRules[this.state.currentRule].expansion}
                                    applicationRate={definedRules[this.state.currentRule].app_rate}
                                    preconditionsStr={definedRules[this.state.currentRule].preconditionsStr}
                                    effectsStr={definedRules[this.state.currentRule].effectsStr}
                                    openRuleDefinitionModal={this.openRuleDefinitionModal}
                                    ruleAlreadyExists={this.ruleAlreadyExists}
                                    playButtonIsJuicing={this.state.playButtonIsJuicing}
                                    letInterfaceKnowTextFieldEditingHasStarted={this.letInterfaceKnowTextFieldEditingHasStarted}
                                    letInterfaceKnowTextFieldEditingHasStopped={this.letInterfaceKnowTextFieldEditingHasStopped}/>
            }
        }

        return (
            <div style={{position: "fixed", top: 0, right: 0, "height": "100%", "width": "100%"}}>
                <div
                    style={{ "height": "70%", "width": "75%", position: "absolute", top: 0, left: 0}}>
                    <HeaderBar  updateCurrentSymbolName={this.updateCurrentSymbolName}
                                updateCurrentRule={this.updateCurrentRule}
                                updateGeneratedContentPackageTags={this.updateGeneratedContentPackageTags}
                                updateGeneratedContentPackageText={this.updateGeneratedContentPackageText}
                                getCurrentGrammarName={this.getCurrentGrammarName}
                                setCurrentGrammarName={this.setCurrentGrammarName}
                                bundleName={this.state.bundleName}
                                newGrammar={this.newGrammar}
                                loadGrammar={this.loadGrammar}
                                saveGrammar={this.saveGrammar}
                                exportGrammar={this.exportGrammar}
                                openLoadModal={this.openLoadModal}
                                closeLoadModal={this.closeLoadModal}
                                openSaveModal={this.openSaveModal}
                                closeSaveModal={this.closeSaveModal}
                                openExportModal={this.openExportModal}
                                closeExportModal={this.closeExportModal}
                                openTestModal={this.openTestModal}
                                closeTestModal={this.closeTestModal}
                                showLoadModal={this.state.showLoadModal}
                                showSaveModal={this.state.showSaveModal}
                                showExportModal={this.state.showExportModal}
                                showTestModal={this.state.showTestModal}
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
                                logoButtonIsJuicing={this.state.logoButtonIsJuicing}
                                newButtonIsJuicing={this.state.newButtonIsJuicing}
                                loadButtonIsJuicing={this.state.loadButtonIsJuicing}
                                saveButtonIsJuicing={this.state.saveButtonIsJuicing}
                                exportButtonIsJuicing={this.state.exportButtonIsJuicing}
                                buildButtonIsJuicing={this.state.buildButtonIsJuicing}
                                playButtonIsJuicing={this.state.playButtonIsJuicing}
                                attemptToBuildProductionist={this.attemptToBuildProductionist}
                                goBack={this.goBack}
                                goForward={this.goForward}
                                undo={this.undo}
                                redo={this.redo}/>
                    <div className="muwrap">
                        <div className="show-y-wrapper">
                            <MarkupBar  className="markup-bar"
                                        updateFromServer={this.updateFromServer}
                                        nonterminals={this.state.nonterminals}
                                        tagsets={this.state.tagsets}
                                        updateSymbolFilterQuery={this.updateSymbolFilterQuery}
                                        currentSymbolName={this.state.currentSymbol}
                                        currentRule={this.state.currentRule}
                                        letInterFaceKnowTagDefinitionModalIsOpen={this.letInterFaceKnowTagDefinitionModalIsOpen}
                                        letInterFaceKnowTagDefinitionModalIsClosed={this.letInterFaceKnowTagDefinitionModalIsClosed}/>
                        </div>
                    </div>
                    {board}
                    <div className="muwrap" style={{"position": "absolute", "bottom": 0}}>
                        <RuleBar    rules={definedRules}
                                    updateFromServer={this.updateFromServer}
                                    nonterminals={this.state.nonterminals}
                                    currentSymbolName={this.state.currentSymbol}
                                    updateCurrentSymbolName={this.updateCurrentSymbolName}
                                    updateCurrentRule={this.updateCurrentRule}
                                    updateGeneratedContentPackageTags={this.updateGeneratedContentPackageTags}
                                    updateGeneratedContentPackageText={this.updateGeneratedContentPackageText}
                                    toggleWhetherRuleDefinitionModalIsOpen={this.toggleWhetherRuleDefinitionModalIsOpen}
                                    showRuleDefinitionModal={this.state.showRuleDefinitionModal}
                                    idOfRuleToEdit={this.state.idOfRuleToEdit}
                                    idOfRuleToDuplicate={this.state.idOfRuleToDuplicate}
                                    ruleAlreadyExists={this.ruleAlreadyExists}
                                    currentRule={this.state.currentRule}
                                    getListOfMatchingSymbolNames={this.getListOfMatchingSymbolNames}
                                    getListOfMatchingStateElements={this.getListOfMatchingStateElements}
                                    stateElements={this.state.stateElements}/>
                    </div>
                </div>

                <div
                    style={{"overflow": "auto", "width": "25%", "height":"100%", position: "absolute", top: 0, right: 0, "border": "10px solid #f2f2f2", "borderTop": "4px solid rgb(242, 242, 242)"}}>
                    <NonterminalList    nonterminals={this.state.nonterminals}
                                        updateFromServer={this.updateFromServer}
                                        updateCurrentSymbolName={this.updateCurrentSymbolName}
                                        updateCurrentRule={this.updateCurrentRule}
                                        updateGeneratedContentPackageTags={this.updateGeneratedContentPackageTags}
                                        updateGeneratedContentPackageText={this.updateGeneratedContentPackageText}
                                        updateSymbolFilterQuery={this.updateSymbolFilterQuery}
                                        symbolFilterQuery={this.state.symbolFilterQuery}
                                        currentNonterminalName={this.state.currentSymbol}
                                        getListOfMatchingSymbolNames={this.getListOfMatchingSymbolNames}
                                        symbolNameAlreadyExists={this.symbolNameAlreadyExists}>
                    </NonterminalList>
                </div>
                <div style={{"width": "75%", "height": "30%", position: "absolute", bottom: 0, left:0}}>
                    <FeedbackBar text={this.state.generatedContentPackageText} tags={this.state.generatedContentPackageTags}/>
                </div>
            </div>
        );
    }
}

module.exports = Interface;
