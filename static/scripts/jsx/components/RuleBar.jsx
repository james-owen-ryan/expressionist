var React = require('react')
var Button = require('react-bootstrap').Button
var ButtonGroup = require('react-bootstrap').ButtonGroup
var Modal = require('react-bootstrap').Modal
var ajax = require('jquery').ajax
var Glyphicon = require('react-bootstrap').Glyphicon


const AUTHOR_IS_USING_A_MAC = navigator.platform.toUpperCase().indexOf('MAC') >= 0;


class RuleBar extends React.Component {

    constructor(props) {
        super(props);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.submitRuleDefinitionOnEnter = this.submitRuleDefinitionOnEnter.bind(this);
        this.handleRuleClick = this.handleRuleClick.bind(this);
        this.handleSymbolReferenceClick = this.handleSymbolReferenceClick.bind(this);
        this.handleStateElementReferenceClick = this.handleStateElementReferenceClick.bind(this);
        this.updateRuleHeadInputVal = this.updateRuleHeadInputVal.bind(this);
        this.updateRuleExpansionInputVal = this.updateRuleExpansionInputVal.bind(this);
        this.updateApplicationRate = this.updateApplicationRate.bind(this);
        this.addRule = this.addRule.bind(this);
        this.editRule = this.editRule.bind(this);
        this.juiceRuleDefinitionSubmitButton = this.juiceRuleDefinitionSubmitButton.bind(this);
        this.registerRuleBodyInputFocus = this.registerRuleBodyInputFocus.bind(this);
        this.deregisterRuleBodyInputFocus = this.deregisterRuleBodyInputFocus.bind(this);
        this.formatList = this.formatList.bind(this);
        this.updateRuleDefinitionSymbolFilterQuery = this.updateRuleDefinitionSymbolFilterQuery.bind(this);
        this.toggleConnectNewRuleHeadToCurrentSymbol = this.toggleConnectNewRuleHeadToCurrentSymbol.bind(this);
        this.displayConnectBackCheckbox = this.displayConnectBackCheckbox.bind(this);
        this.pullNewRuleInWorkspaceAndRefocusOnRuleBodyInput = this.pullNewRuleInWorkspaceAndRefocusOnRuleBodyInput.bind(this);
        this.switchToRuleView = this.switchToRuleView.bind(this);
        this.switchToPreconditionsView = this.switchToPreconditionsView.bind(this);
        this.switchToEffectsView = this.switchToEffectsView.bind(this);
        this.handlePotentialTabbingHotKeyPress = this.handlePotentialTabbingHotKeyPress.bind(this);
        this.updateRulePreconditionsInputVal = this.updateRulePreconditionsInputVal.bind(this);
        this.updateRuleEffectsInputVal = this.updateRuleEffectsInputVal.bind(this);
        this.updateRuleDefinitionStateElementFilterQuery = this.updateRuleDefinitionStateElementFilterQuery.bind(this);
        this.refocusOnRuleBodyInput = this.refocusOnRuleBodyInput.bind(this);
        this.state = {
            ruleHeadInputVal: '',
            ruleExpansionInputVal: '',
            ruleApplicationRate: 1,
            ruleBodyInputIsActive: false,
            ruleDefinitionSymbolFilterQuery: '',
            connectNewRuleHeadToCurrentSymbol: false,
            showRuleView: true,
            showPreconditionsView: false,
            showEffectsView: false,
            rulePreconditionsInputVal: '',
            ruleEffectsInputVal: '',
            ruleDefinitionStateElementFilterQuery: ''
        }
    }

    openModal() {
        this.props.toggleWhetherRuleDefinitionModalIsOpen();
    }

    closeModal() {
        this.switchToRuleView();
        this.props.toggleWhetherRuleDefinitionModalIsOpen();
    }

    refocusOnRuleBodyInput() {
        document.getElementById("ruleExpansionInput").focus();
    }

    switchToRuleView() {
        this.setState({
            showRuleView: true,
            showPreconditionsView: false,
            showEffectsView: false
        })
    }

    switchToPreconditionsView() {
        this.setState({
            showRuleView: false,
            showPreconditionsView: true,
            showEffectsView: false
        })
    }

    switchToEffectsView() {
        this.setState({
            showRuleView: false,
            showPreconditionsView: false,
            showEffectsView: true
        })
    }

    handlePotentialTabbingHotKeyPress(e) {
        if (e.key === 'Tab' && this.props.showRuleDefinitionModal) {
            e.preventDefault();
            if (AUTHOR_IS_USING_A_MAC ? e.altKey : e.metaKey) {
                if (this.state.showRuleView) {
                    if (e.shiftKey) {
                        this.switchToEffectsView();
                    }
                    else {
                        this.switchToPreconditionsView();
                    }
                }
                else if (this.state.showPreconditionsView) {
                    if (e.shiftKey) {
                        this.switchToRuleView();
                    }
                    else {
                        this.switchToEffectsView();
                    }
                }
                else if (this.state.showEffectsView) {
                    if (e.shiftKey) {
                        this.switchToPreconditionsView();
                    }
                    else {
                        this.switchToRuleView();
                    }
                }
            }
            else if (this.state.showRuleView) {
                var fieldWithFocus = document.activeElement.id;
                if (fieldWithFocus == "ruleHeadInput") {
                    if (e.shiftKey) {
                        this.props.moveCursorToPositionOrRange("ruleApplicationRateInput", 0, String(this.state.ruleApplicationRate).length);
                    }
                    else {
                        this.props.moveCursorToPositionOrRange("ruleExpansionInput", this.state.ruleExpansionInputVal.length, this.state.ruleExpansionInputVal.length);
                    }
                }
                else if (fieldWithFocus == "ruleExpansionInput") {
                    if (e.shiftKey) {
                        this.props.moveCursorToPositionOrRange("ruleHeadInput", 0, this.state.ruleHeadInputVal.length);
                    }
                    else {
                        this.props.moveCursorToPositionOrRange("ruleApplicationRateInput", 0, String(this.state.ruleApplicationRate).length);
                    }
                }
                else if (fieldWithFocus == "ruleApplicationRateInput") {
                    if (e.shiftKey) {
                        this.props.moveCursorToPositionOrRange("ruleExpansionInput", this.state.ruleExpansionInputVal.length, this.state.ruleExpansionInputVal.length);
                    }
                    else {
                        this.props.moveCursorToPositionOrRange("ruleHeadInput", 0, this.state.ruleHeadInputVal.length);
                    }
                }
                else {
                    if (e.shiftKey) {
                        this.props.moveCursorToPositionOrRange("ruleApplicationRateInput", 0, String(this.state.ruleApplicationRate).length);
                    }
                    else {
                        this.props.moveCursorToPositionOrRange("ruleHeadInput", 0, this.state.ruleHeadInputVal.length);
                    }
                }
            }
        }
    }

    updateRuleDefinitionStateElementFilterQuery(e) {
        this.setState({ruleDefinitionStateElementFilterQuery: e.target.value})
    }

    updateRulePreconditionsInputVal(e) {
        this.setState({rulePreconditionsInputVal: e.target.value})
    }

    updateRuleEffectsInputVal(e) {
        this.setState({ruleEffectsInputVal: e.target.value})
    }

    updateRuleDefinitionSymbolFilterQuery(e) {
        this.setState({ruleDefinitionSymbolFilterQuery: e.target.value})
    }

    updateRuleHeadInputVal(e) {
        if (e.target.value.indexOf('\n') === -1) {
            this.setState({ruleHeadInputVal: e.target.value})
        }
    }

    updateRuleExpansionInputVal(e) {
        if (e.target.value.indexOf('\n') === -1) {
            var inputValue = e.target.value;
            var positionToMoveCursorTo = null;
            // Facilitate symbol referencing in the style of IDE autocompletion
            if (document.getElementById("ruleExpansionInput").selectionStart === document.getElementById("ruleExpansionInput").selectionEnd) {
                var cursorPosition = document.getElementById("ruleExpansionInput").selectionStart;
                if (inputValue.slice(cursorPosition-1, cursorPosition+2) === '[]]') {
                    if (inputValue[cursorPosition-2] !== '[') {
                        inputValue = inputValue.slice(0, cursorPosition-1).concat(inputValue.slice(cursorPosition+2));
                        positionToMoveCursorTo = cursorPosition - 1;
                    }
                }
                else if (inputValue.slice(cursorPosition-2, cursorPosition) === '[[') {
                    // Make sure the author isn't in the process of deleting a symbol reference (i.e., first check if
                    // they just deleted a right square bracket)
                    if (this.state.ruleExpansionInputVal[cursorPosition] !== ']') {
                        // Also make sure aren't just adding in an accidentally deleted bracket from an ongoing
                        // symbol reference that they are still in the process of forming
                        if (!(
                                inputValue.slice(cursorPosition).indexOf(']') !== -1 &&
                                (inputValue.slice(cursorPosition).indexOf('[' === -1) || inputValue.slice(cursorPosition).indexOf(']') < inputValue.slice(cursorPosition).indexOf('['))
                            )) {
                            inputValue = inputValue.slice(0, cursorPosition).concat(']]').concat(inputValue.slice(cursorPosition));
                            positionToMoveCursorTo = cursorPosition;
                        }
                    }
                }
            }
            if (positionToMoveCursorTo) {
                this.setState({ruleExpansionInputVal: inputValue}, this.props.moveCursorToPositionOrRange.bind(this, "ruleExpansionInput", positionToMoveCursorTo, positionToMoveCursorTo));
            }
            else {
                this.setState({ruleExpansionInputVal: inputValue});
            }
        }
    }

    updateApplicationRate(e) {
        if (!isNaN(e.target.value)){
            this.setState({ruleApplicationRate: e.target.value})
        }
        else {
            this.setState({ruleApplicationRate: 1})
        }
    }

    toggleConnectNewRuleHeadToCurrentSymbol() {
        this.setState({connectNewRuleHeadToCurrentSymbol: !this.state.connectNewRuleHeadToCurrentSymbol})
    }

    submitRuleDefinitionOnEnter(e) {
        if (this.props.showRuleDefinitionModal && this.state.showRuleView) {
            if (e.key === 'Enter' && !(e.ctrlKey || e.metaKey)) {
                document.getElementById("submitRuleButton").click();
            }
        }
    }

    toExpressionistSyntax(nonterminalName) {
        return "[[" + nonterminalName + "]]"
    }

    handleRuleClick(index) {
        this.props.updateCurrentRule(index);
    }

    registerRuleBodyInputFocus() {
        this.setState({ruleBodyInputIsActive: true})
    }

    deregisterRuleBodyInputFocus() {
        this.setState({ruleBodyInputIsActive: false})
    }

    handleSymbolReferenceClick(nonterminalName) {
        if (this.state.ruleBodyInputIsActive) {
            // Insert a reference to the clicked nonterminal at the current cursor position in the rule body
            var referenceToClickedNonterminal = this.toExpressionistSyntax(nonterminalName);
            var cursorPosition = document.getElementById("ruleExpansionInput").selectionStart;
            var ruleBodySegmentToLeftOfCursor = this.state.ruleExpansionInputVal.slice(0, cursorPosition);
            var ruleBodySegmentToRightOfCursor = this.state.ruleExpansionInputVal.slice(cursorPosition);
            var ruleBodyWithReferenceInserted = ruleBodySegmentToLeftOfCursor.concat(referenceToClickedNonterminal).concat(ruleBodySegmentToRightOfCursor);
            var positionToMoveCursorTo = cursorPosition + referenceToClickedNonterminal.length;
            this.setState({ruleExpansionInputVal: ruleBodyWithReferenceInserted}, this.props.moveCursorToPositionOrRange.bind(this, "ruleExpansionInput", positionToMoveCursorTo, positionToMoveCursorTo));
        }
        else {
            // Change the rule head to the clicked nonterminal and automatically select it with the cursor
            this.setState({ruleHeadInputVal: nonterminalName}, this.props.moveCursorToPositionOrRange.bind(this, "ruleHeadInput", 0, nonterminalName.length));
        }
    }

    handleStateElementReferenceClick(stateElement) {
        if (this.state.showPreconditionsView) {
            // Insert a reference to the clicked state element at the current cursor position in the text area
            var cursorPosition = document.getElementById("rulePreconditionsInput").selectionStart;
            var preconditionsSegmentToLeftOfCursor = this.state.rulePreconditionsInputVal.slice(0, cursorPosition);
            var preconditionsSegmentToRightOfCursor = this.state.rulePreconditionsInputVal.slice(cursorPosition);
            var preconditionsSegmentWithReferenceInserted = preconditionsSegmentToLeftOfCursor.concat(stateElement).concat(preconditionsSegmentToRightOfCursor);
            var positionToMoveCursorTo = cursorPosition + stateElement.length;
            this.setState({rulePreconditionsInputVal: preconditionsSegmentWithReferenceInserted}, this.props.moveCursorToPositionOrRange.bind(this, "rulePreconditionsInput", positionToMoveCursorTo, positionToMoveCursorTo));
        }
        else {
            // Insert a reference to the clicked state element at the current cursor position in the text area
            var cursorPosition = document.getElementById("ruleEffectsInput").selectionStart;
            var effectsSegmentToLeftOfCursor = this.state.ruleEffectsInputVal.slice(0, cursorPosition);
            var effectsSegmentToRightOfCursor = this.state.ruleEffectsInputVal.slice(cursorPosition);
            var effectsSegmentWithReferenceInserted = effectsSegmentToLeftOfCursor.concat(stateElement).concat(effectsSegmentToRightOfCursor);
            var positionToMoveCursorTo = cursorPosition + stateElement.length;
            this.setState({ruleEffectsInputVal: effectsSegmentWithReferenceInserted}, this.props.moveCursorToPositionOrRange.bind(this, "ruleEffectsInput", positionToMoveCursorTo, positionToMoveCursorTo));
        }
    }

    pullNewRuleInWorkspaceAndRefocusOnRuleBodyInput() {
        this.props.updateCurrentRule(this.props.rules.length-1);
        this.refocusOnRuleBodyInput();
    }

    addRule() {
        // Send the new rule definition to the server
        var ruleHeadName = this.state.ruleHeadInputVal;
        var appRate = this.state.ruleApplicationRate;
        var expansion = this.state.ruleExpansionInputVal;
        var preconditions = this.state.rulePreconditionsInputVal;
        var effects = this.state.ruleEffectsInputVal;
        // Generate a juicy response (button lights yellow and fades back to gray)
        document.getElementById('submitRuleButton').style.backgroundColor = 'rgb(87, 247, 224)';
        document.getElementById('submitRuleButton').innerHTML = 'Added!'
        var juicingIntervalFunction = setInterval(this.juiceRuleDefinitionSubmitButton, 1);
        // Reset the application rate, but we'll keep the expansion (in case the author wishes
        // to define a bunch of similar variants quickly)
        this.setState({ruleApplicationRate: 1})
        var object = {
            "rule head name": ruleHeadName,
            "rule body": expansion,
            "application rate": appRate,
            "preconditions": preconditions,
            "effects": effects
        }
        ajax({
            url: $SCRIPT_ROOT + '/api/rule/add',
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(object),
            success: () => {
                if (ruleHeadName === this.props.currentSymbolName) {
                    // If the author has just created a new rule for the current symbol, navigate the
                    // view to that new rule
                    this.props.updateFromServer(this.pullNewRuleInWorkspaceAndRefocusOnRuleBodyInput);
                }
                else {
                    this.props.updateFromServer(this.refocusOnRuleBodyInput);
                }
                this.props.updateGeneratedContentPackageTags([]);
                this.props.updateGeneratedContentPackageText('');
            },
            cache: false
        })
        if (this.state.connectNewRuleHeadToCurrentSymbol) {
            var ruleHeadOfConnectingRule = this.props.currentSymbolName;
            var ruleBodyOfConnectingRule = "[[" + ruleHeadName + "]]";
            var object = {
                "rule head name": ruleHeadOfConnectingRule,
                "rule body": ruleBodyOfConnectingRule,
                "application rate": 1,
                "preconditions": "",
                "effects": ""
            }
            ajax({
                url: $SCRIPT_ROOT + '/api/rule/add',
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(object),
                success: () => {
                    this.props.updateFromServer(this.refocusOnRuleBodyInput);
                },
                cache: false
            })
        }
        setTimeout(function() {
            clearInterval(juicingIntervalFunction);
            document.getElementById('submitRuleButton').innerHTML = 'Create Rule';
            document.getElementById('submitRuleButton').style.backgroundColor = 'rgb(242, 242, 242)';
        }, 1250);
    }

    editRule() {
        document.getElementById('submitRuleButton').style.backgroundColor = 'rgb(87, 247, 224)';
        document.getElementById('submitRuleButton').innerHTML = 'Updated!'
        var originalRuleHeadName = this.props.currentSymbolName;
        var originalRuleId = this.props.idOfRuleToEdit;
        var ruleHeadName = this.state.ruleHeadInputVal;
        var appRate = this.state.ruleApplicationRate;
        var expansion = this.state.ruleExpansionInputVal;
        var preconditions = this.state.rulePreconditionsInputVal;
        var effects = this.state.ruleEffectsInputVal;
        var object = {
            "original rule head name": originalRuleHeadName,
            "rule id": originalRuleId,
            "rule head name": ruleHeadName,
            "rule body": expansion,
            "application rate": appRate,
            "preconditions": preconditions,
            "effects": effects
        }
        ajax({
            url: $SCRIPT_ROOT + '/api/rule/edit',
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(object),
            success: () => {
                this.props.updateGeneratedContentPackageTags([]);
                this.props.updateGeneratedContentPackageText('');
                this.props.updateFromServer()
                this.closeModal()
            },
            cache: false
        })
        if (this.state.connectNewRuleHeadToCurrentSymbol) {
            var ruleHeadOfConnectingRule = this.props.currentSymbolName;
            var ruleBodyOfConnectingRule = "[[" + this.state.ruleHeadInputVal + "]]";
            var object = {
                "rule head name": ruleHeadOfConnectingRule,
                "rule body": ruleBodyOfConnectingRule,
                "application rate": 1,
                "preconditions": "",
                "effects": ""
            }
            ajax({
                url: $SCRIPT_ROOT + '/api/rule/add',
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(object),
                success: () => {
                    this.props.updateGeneratedContentPackageTags([]);
                    this.props.updateGeneratedContentPackageText('');
                    this.props.updateFromServer();
                },
                cache: false
            })
        }
    }

    juiceRuleDefinitionSubmitButton() {
        // This function gradually fades the rule-definition submit button ("Create Rule" or "Update Rule")
        // from our palette green, rgb(87, 247, 224), to our palette gray, rgb(242, 242, 242)
        var currentButtonRgbValues = document.getElementById("submitRuleButton").style.backgroundColor;
        var extractedRgbComponents = currentButtonRgbValues.match(/\d+/g);
        var r = extractedRgbComponents[0];
        var g = extractedRgbComponents[1];
        var b = extractedRgbComponents[2];
        if (r < 242){
            r++;
        }
        if (g > 242){
            g--;
        }
        if (b < 242){
            b++;
        }
        document.getElementById("submitRuleButton").style.backgroundColor = "rgb("+r+","+g+","+b+")";
    }

    // Returns a sorted array of nonterminal names
    formatList(symbolNames) {  // 'nonterminals' is an array of nonterminal names
        var symbolNamesExcludingNewlyDefinedOnes = [];
        for (var i = 0; i < symbolNames.length; i++){
            var symbolName = symbolNames[i];
            if (symbolName.indexOf('$symbol') === -1){
                symbolNamesExcludingNewlyDefinedOnes.push(symbolName);
            }
        }
        return symbolNamesExcludingNewlyDefinedOnes.sort(function(a, b){
            return a.toLowerCase() == b.toLowerCase() ? 0 : +(a.toLowerCase() > b.toLowerCase()) || -1;
        });
    }

    displayConnectBackCheckbox() {
        if (this.state.ruleHeadInputVal === '') {
            // No rule head
            return false
        }
        if (this.state.ruleHeadInputVal === this.props.currentSymbolName) {
            // Rule head is the current symbol
            return false
        }
        if (this.props.currentSymbolName === '') {
            // No current symbol
            return false
        }
        if (this.props.ruleAlreadyExists(this.props.currentSymbolName, '[[' + this.state.ruleHeadInputVal + ']]', null)) {
            // A rule of the form 'currentSymbol --> [[newRuleHead]]' already exists
            return false
        }
        return true
    }

    componentDidMount(){
        document.addEventListener("keydown", this.submitRuleDefinitionOnEnter, false);
        document.addEventListener("keydown", this.handlePotentialTabbingHotKeyPress, false);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.idOfRuleToEdit !== null) {
            this.setState({
                ruleHeadInputVal: nextProps.currentSymbolName,
                ruleExpansionInputVal: nextProps.rules[nextProps.idOfRuleToEdit].expansion.join(''),
                ruleApplicationRate: nextProps.rules[nextProps.idOfRuleToEdit].app_rate,
                rulePreconditionsInputVal: nextProps.rules[nextProps.idOfRuleToEdit].preconditionsStr,
                ruleEffectsInputVal: nextProps.rules[nextProps.idOfRuleToEdit].effectsStr,
                connectNewRuleHeadToCurrentSymbol: false
            });
        }
        else if (nextProps.idOfRuleToDuplicate !== null) {
            this.setState({
                ruleHeadInputVal: nextProps.currentSymbolName,
                ruleExpansionInputVal: nextProps.rules[nextProps.idOfRuleToDuplicate].expansion.join(''),
                ruleApplicationRate: nextProps.rules[nextProps.idOfRuleToDuplicate].app_rate,
                rulePreconditionsInputVal: nextProps.rules[nextProps.idOfRuleToDuplicate].preconditionsStr,
                ruleEffectsInputVal: nextProps.rules[nextProps.idOfRuleToDuplicate].effectsStr,
                connectNewRuleHeadToCurrentSymbol: false
            });
        }
        else {
            var keepRuleHeadInputVal = (this.props.showRuleDefinitionModal && !this.state.connectNewRuleHeadToCurrentSymbol);
            this.setState({
                ruleHeadInputVal: keepRuleHeadInputVal ? this.state.ruleHeadInputVal : nextProps.currentSymbolName,
                ruleExpansionInputVal: '',
                ruleApplicationRate: 1,
                rulePreconditionsInputVal: '',
                ruleEffectsInputVal: '',
                connectNewRuleHeadToCurrentSymbol: false
            });
        }
    }

    render() {
        var ruleButtons = [];
        this.props.rules.forEach(function (rule, i) {
            var ruleNameExcerpt = rule.expansion.join('').substring(0, 10);
            var buttonIsForTheCurrentRule = i === this.props.currentRule;
            var buttonBackgroundColor = buttonIsForTheCurrentRule ? "#ffe97f" : "#f2f2f2";
            var buttonExtraClassName = '';
            if (rule.preconditionsStr && rule.effectsStr) {
                if (buttonIsForTheCurrentRule) {
                    buttonExtraClassName = 'rule-button-when-rule-has-preconditions-and-effects-and-is-the-current-rule';
                }
                else {
                    buttonExtraClassName = 'rule-button-when-rule-has-preconditions-and-effects';
                }
            }
            else if (rule.preconditionsStr) {
                if (buttonIsForTheCurrentRule) {
                    buttonExtraClassName = 'rule-button-when-rule-has-preconditions-and-no-effects-and-is-the-current-rule';
                }
                else {
                    buttonExtraClassName = 'rule-button-when-rule-has-preconditions-and-no-effects';
                }
            }
            else if (rule.effectsStr) {
                if (buttonIsForTheCurrentRule) {
                    buttonExtraClassName = 'rule-button-when-rule-has-effects-and-no-preconditions-and-is-the-current-rule';
                }
                else {
                    buttonExtraClassName = 'rule-button-when-rule-has-effects-and-no-preconditions';
                }
            }
            else if (buttonIsForTheCurrentRule) {
                buttonExtraClassName = 'rule-button-when-rule-has-no-preconditions-and-no-effects-but-is-the-current-rule';
            }
            ruleButtons.push(
                <Button onClick={this.handleRuleClick.bind(this, i)} title={AUTHOR_IS_USING_A_MAC ? "View production rule (toggle: ⇥, ⇧⇥)" : "View production rule (toggle: Tab, Shift+Tab)"} key={rule.expansion.join('')+this.props.currentSymbolName} className={buttonExtraClassName} style={{height: "32px"}}>
                    {ruleNameExcerpt}
                </Button>
            );
        }, this);
        if (this.state.showRuleView) {
            var ruleModalSearchBar = (
                <input
                    id='ruleDefinitionNonterminalListSearch'
                    title="Hint: try '$text:[text from symbol rewriting]', e.g., '$text:typoo'"
                    type='text'
                    onChange={this.updateRuleDefinitionSymbolFilterQuery}
                    value={this.state.ruleDefinitionSymbolFilterQuery}
                    style={{'width': '100%', 'height': '43px', 'fontSize': '18px', 'padding': '0 12px', 'visibility': Object.keys(this.props.nonterminals).some(function (symbolName) {return symbolName.indexOf("$symbol") === -1}) ? 'visible' : 'hidden'}}
                    placeholder='Filter list...'
                    // This hack is necessary to keep the cursor at the end of the query upon auto-focus
                    onFocus={function(e) {
                        var val = e.target.value;
                        e.target.value = '';
                        e.target.value = val;
                    }}
                />
            );
            var ruleModalSearchResults = (
                <div id='nonterminalsListModal' style={{'overflowY': 'scroll', 'marginBottom': '15px', 'height': '200px'}}>
                    {
                        this.formatList(this.props.getListOfMatchingSymbolNames(this.state.ruleDefinitionSymbolFilterQuery)).map( (symbolName) => {
                            var color = this.props.nonterminals[symbolName].complete ? "success" : "danger"
                            return (
                                <button className={'list-group-item list-group-item-xs nonterminal list-group-item-'.concat(color)} style={{'margin':'0', 'border':'0px'}} title={this.state.ruleBodyInputIsActive ? "Insert symbol reference into rule body (hint: when editing rule head, clicking here changes the head to the selected symbol)" : "Change rule head to symbol (hint: when editing rule body, clicking here inserts the selected symbol into the body)"} onClick={this.handleSymbolReferenceClick.bind(this, symbolName)} key={symbolName}>
                                    {this.props.nonterminals[symbolName].deep ? <Glyphicon glyph="star"/> : ""}{this.props.nonterminals[symbolName].deep ? " " : ""}{symbolName}
                                </button>
                            )
                        })
                    }
                </div>
            );
            var ruleModalContent = (
                <div style={{textAlign: 'center', height: '303px'}}>
                    <textarea id='ruleHeadInput' type='text' title="This is the rule head: the symbol that is rewritten when this rule is executed." value={this.state.ruleHeadInputVal} onChange={this.updateRuleHeadInputVal} onFocus={this.deregisterRuleBodyInputFocus} style={{'width': '90%', 'border': '0px solid #d7d7d7', 'height': '43px', 'marginTop': '10px', 'marginBottom': '15px', 'fontSize': '18px', 'padding': '8px 12px', backgroundColor: '#f2f2f2'}} autoFocus={this.state.ruleHeadInputVal === ""}/>
                    <p title='The arrow in a production rule cues that the rule head (top) will be rewritten as the rule body (bottom).'><Glyphicon glyph="circle-arrow-down" style={{"fontSize": "25px", "top": "5px"}}/></p>
                    <textarea id='ruleExpansionInput' type='text' title="This is the rule body: what the rule head will be rewritten as when this rule is executed." value={this.state.ruleExpansionInputVal} onChange={this.updateRuleExpansionInputVal} onFocus={this.registerRuleBodyInputFocus} style={{'width': '90%', 'border': '0px solid #d7d7d7', 'height': '100px', 'marginTop': '10px', 'marginBottom': '15px', 'fontSize': '18px', 'padding': '0 12px', backgroundColor: '#f2f2f2'}} autoFocus={this.state.ruleHeadInputVal !== ""}/>
                    <br/>
                    <input id='ruleApplicationRateInput' title="This is the application rate: a number that specifies how frequently this rule will be used relative to any sibling rules (a higher number increases the frequency)." type='text' value={this.state.ruleApplicationRate} onChange={this.updateApplicationRate} onFocus={this.deregisterRuleBodyInputFocus} style={{'width': '50px', 'border': '0px solid #d7d7d7', 'height': '43px', 'marginBottom': '25px', 'fontSize': '18px', 'padding': '0 12px', 'textAlign': 'center'}}/>
                    <br/>
                    {
                        (this.displayConnectBackCheckbox())
                        ?
                        <label title={"If checked, the following production rule will also be created: '" + this.props.currentSymbolName + " -> [[" + this.state.ruleHeadInputVal + "]]'. This can be used as a way of attaching tags to a production rule, which requires it to be associated with a dedicated symbol."} style={{fontWeight: "normal", position: "absolute", right: "0px", padding: "20px 31px 21px 0px"}}><input title={"If checked, the following production rule will also be created: '" + this.props.currentSymbolName + " -> [[" + this.state.ruleHeadInputVal + "]]'. This can be used as a way of attaching tags to a production rule, which requires it to be associated with a dedicated symbol."} name="isGoing" type="checkbox" checked={this.state.connectNewRuleHeadToCurrentSymbol} onChange={this.toggleConnectNewRuleHeadToCurrentSymbol}/> Connect to current symbol</label>
                        :
                        ""
                    }
                </div>
            );
        }
        else if (this.state.showPreconditionsView || this.state.showEffectsView) {
            var ruleModalSearchBar = (
                <input
                    id='ruleDefinitionStateElementsListSearch'
                    title="Type to filter list"
                    type='text'
                    onChange={this.updateRuleDefinitionStateElementFilterQuery}
                    value={this.state.ruleDefinitionStateElementFilterQuery}
                    style={{width: '100%', height: '43px', fontSize: '18px', padding: '0 12px', visibility: this.props.stateElements.length ? 'visible' : 'hidden'}}
                    placeholder='Filter list...'
                    // This hack is necessary to keep the cursor at the end of the query upon auto-focus
                    onFocus={function(e) {
                        var val = e.target.value;
                        e.target.value = '';
                        e.target.value = val;
                    }}
                />
            );
            var ruleModalSearchResults = (
                <div id='ruleDefinitionStateElementsList' style={{'overflowY': 'scroll', 'marginBottom': '15px', 'height': '200px'}}>
                    {
                        this.props.getListOfMatchingStateElements(this.state.ruleDefinitionStateElementFilterQuery).map( (stateElement) => {
                            return (
                                <button className='list-group-item list-group-item-xs nonterminal list-group-item-primary' style={{margin:'0', border:'0px'}} title="Insert state reference" onClick={this.handleStateElementReferenceClick.bind(this, stateElement)} key={stateElement}>
                                    {stateElement}
                                </button>
                            )
                        })
                    }
                </div>
            );
            var ruleModalContent = (
                this.state.showPreconditionsView
                ?
                <div style={{textAlign: 'center', height: '303px'}}>
                    <p title="A production rule's preconditions specify what must hold with regard to Productionist's state prior to the rule being executed."><Glyphicon glyph="object-align-left" style={{fontSize: "25px", top: "5px"}}/></p>
                    <textarea id='rulePreconditionsInput' type='text' title="Type in the rule's preconditions here, making sure to enclose each precondition in curly braces. Any characters between the curly braces delimiting the preconditions, including newlines and other whitespace, will be ignored; as such, comments can be interspersed freely. Here's an example to demonstrate the format: '{story.protagonist.has_been_introduced} {not story.villain.has_been_introduced} {story.tension >= 5} {story.protagonist != story.villain}'." value={this.state.rulePreconditionsInputVal} onChange={this.updateRulePreconditionsInputVal} style={{width: '90%', height: "228px", border: '0px solid #d7d7d7', marginTop: '10px', marginBottom: '15px', fontSize: '18px', padding: '0 12px', backgroundColor: '#f2f2f2'}} autoFocus="true"/>
                </div>
                :
                <div style={{textAlign: 'center', height: '303px'}}>
                     <p title="A production rule's effects specify updates that will be made to Productionist's state upon the rule being successfully executed."><Glyphicon glyph="object-align-right" style={{fontSize: "25px", top: "5px"}}/></p>
                    <textarea id='ruleEffectsInput' type='text' title="Type in the rule's effects here, making sure to enclose each effect in curly braces. Any characters between the curly braces delimiting the effects, including newlines and other whitespace, will be ignored; as such, comments can be interspersed freely. Note that effects will be executed in the order in which they are defined here. Here's an example to demonstrate the format: '{story.protagonist.bestFriend as story.sideCharacter} {'Bartholomew Hume' as story.sideCharacter.name} {'Dr.' as story.sideCharacter.title} {5 as story.tension} {story.protagonist as story.villain}'." value={this.state.ruleEffectsInputVal} onChange={this.updateRuleEffectsInputVal} style={{width: '90%', height: "228px", border: '0px solid #d7d7d7', marginTop: '10px', marginBottom: '15px', fontSize: '18px', padding: '0 12px', backgroundColor: '#f2f2f2'}} autoFocus="true"/>
                </div>
            );
        }
        var ruleDefinitionAddButtonIsDisabled = this.props.ruleAlreadyExists(this.state.ruleHeadInputVal, this.state.ruleExpansionInputVal, this.state.ruleApplicationRate, this.state.rulePreconditionsInputVal, this.state.ruleEffectsInputVal);
        if (this.props.idOfRuleToEdit !== null) {
            var ruleDefinitionModalButtonText = 'Update Rule';
            var ruleDefinitionModalButtonHoverText = 'Update rule';
            var ruleDefinitionModalButtonCallback = this.editRule;
        }
        else {
            var ruleDefinitionModalButtonText = 'Create Rule';
            var ruleDefinitionModalButtonHoverText = 'Create rule';
            var ruleDefinitionModalButtonCallback = this.addRule;
        }
        if (ruleDefinitionAddButtonIsDisabled) {
            ruleDefinitionModalButtonHoverText += " (disabled: rule already exists)"
        }
        else if (this.state.ruleHeadInputVal === '') {
            ruleDefinitionAddButtonIsDisabled = true;
            ruleDefinitionModalButtonHoverText += " (disabled: rule head is missing)"
        }
        else if (this.state.ruleApplicationRate === '') {
            ruleDefinitionAddButtonIsDisabled = true;
            ruleDefinitionModalButtonHoverText += " (disabled: application rate is missing)"
        }
        // If the rule is being edited to have a new rule head that is itself a new nonterminal symbol, display a checkbox that affords wrapping
        // the rule as a new symbol (corresponding to the new rule head head); this is a common authoring move that one carries out when she
        // wishes to apply tags to a production rule, which can only be done by creating a new symbol corresponding to that rule
        return (
            <div>
                <div className="btn-test">
                    <ButtonGroup>
                        <Button id="addRuleButton" onClick={this.openModal} title={AUTHOR_IS_USING_A_MAC ? "Define new production rule (⌘D)" : "Define new production rule (Ctrl+D)"} key="addnew"><Glyphicon glyph="plus"/></Button>
                        {ruleButtons}
                    </ButtonGroup>
                </div>
                <div>
                    <Modal show={this.props.showRuleDefinitionModal} onHide={this.closeModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Rule Definition</Modal.Title>
                        </Modal.Header>
                        {ruleModalSearchBar}
                        {ruleModalSearchResults}
                        {ruleModalContent}
                        <div style={{'textAlign': 'center'}}>
                            <Button id="submitRuleButton" title={ruleDefinitionModalButtonHoverText} disabled={ruleDefinitionAddButtonIsDisabled} bsStyle="primary" bsSize="large" style={{marginBottom: '25px', visibility: this.state.showRuleView ? 'visible' : 'hidden'}} onClick={ruleDefinitionModalButtonCallback}>{ruleDefinitionModalButtonText}</Button>
                            <ButtonGroup style={{position: 'absolute', left: '30px', marginBottom: '25px'}} >
                                <Button className="grp_button" id="ruleViewButton" title={AUTHOR_IS_USING_A_MAC ? "Switch to rule view (toggle: ⌥⇥, ⌥⇧⇥)" : "Switch to rule view (toggle: Ctrl+Tab, Ctrl+Shift+Tab)"} bsStyle="primary" bsSize="large" onClick={this.switchToRuleView} style={this.state.showRuleView ? {backgroundColor: "#ffe97f"} : {}}><Glyphicon glyph="object-align-vertical"/></Button>
                                <Button className="grp_button" id="preconditionViewButton" title={AUTHOR_IS_USING_A_MAC ? "Switch to preconditions view (toggle: ⌥⇥, ⌥⇧⇥)" : "Switch to preconditions view (toggle: Ctrl+Tab, Ctrl+Shift+Tab)"} bsStyle="primary" bsSize="large" onClick={this.switchToPreconditionsView} style={this.state.showPreconditionsView ? {backgroundColor: "#ffe97f"} : {}}><Glyphicon glyph="object-align-left"/></Button>
                                <Button className="grp_button" id="effectViewButton" title={AUTHOR_IS_USING_A_MAC ? "Switch to effects view (toggle: ⌥⇥, ⌥⇧⇥)" : "Switch to effects view (toggle: Ctrl+Tab, Ctrl+Shift+Tab)"} bsStyle="primary" bsSize="large" onClick={this.switchToEffectsView} style={this.state.showEffectsView ? {backgroundColor: "#ffe97f"} : {}}><Glyphicon glyph="object-align-right"/></Button>
                            </ButtonGroup>
                        </div>
                    </Modal>
                </div>
            </div>
        );
    }
}

module.exports = RuleBar;
