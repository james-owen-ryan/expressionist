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
        this.callbackToSwitchViewToNewlyDefinedView = this.callbackToSwitchViewToNewlyDefinedView.bind(this);
        this.state = {
            ruleHeadInputVal: '',
            ruleExpansionInputVal: '',
            ruleApplicationRate: 1,
            ruleBodyInputIsActive: false,
            ruleDefinitionSymbolFilterQuery: '',
            connectNewRuleHeadToCurrentSymbol: false
        }
    }

    openModal() {
        this.props.toggleWhetherRuleDefinitionModalIsOpen();
    }

    closeModal() {
        this.props.toggleWhetherRuleDefinitionModalIsOpen();
    }

    updateRuleDefinitionSymbolFilterQuery(e) {
        this.setState({ruleDefinitionSymbolFilterQuery: e.target.value})
    }

    toggleConnectNewRuleHeadToCurrentSymbol() {
        this.setState({connectNewRuleHeadToCurrentSymbol: !this.state.connectNewRuleHeadToCurrentSymbol})
    }

    submitRuleDefinitionOnEnter(e) {
        if (this.props.showRuleDefinitionModal) {
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
            this.setState({ruleExpansionInputVal: ruleBodyWithReferenceInserted});
            // TODO THIS DOESN'T APPEAR TO BE WORKING
            document.getElementById("ruleExpansionInput").focus();
            document.getElementById("ruleExpansionInput").setSelectionRange(cursorPosition+referenceToClickedNonterminal.length, cursorPosition+referenceToClickedNonterminal.length)
        }
        else {
            // Change the rule head to the clicked nonterminal
            this.setState({ruleHeadInputVal: nonterminalName});
            document.getElementById("ruleHeadInput").focus();
            document.getElementById("ruleHeadInput").setSelectionRange(0, nonterminalName.length);
        }
    }

    updateRuleHeadInputVal(e) {
        if (e.target.value.indexOf('\n') === -1) {
            this.setState({ruleHeadInputVal: e.target.value})
        }
    }

    updateRuleExpansionInputVal(e) {
        if (e.target.value.indexOf('\n') === -1) {
            this.setState({ruleExpansionInputVal: e.target.value})
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

    callbackToSwitchViewToNewlyDefinedView() {
        this.props.updateCurrentRule(this.props.rules.length-1);
    }

    addRule() {
        // Send the new rule definition to the server
        var ruleHeadName = this.state.ruleHeadInputVal;
        var appRate = this.state.ruleApplicationRate;
        var expansion = this.state.ruleExpansionInputVal;
        if (expansion != '') {
            // Generate a juicy response (button lights yellow and fades back to gray)
            document.getElementById('submitRuleButton').style.backgroundColor = 'rgb(87, 247, 224)';
            document.getElementById('submitRuleButton').innerHTML = 'Added!'
            var juicingIntervalFunction = setInterval(this.juiceRuleDefinitionSubmitButton, 1);
            // Reset the application rate, but we'll keep the expansion (in case the author wishes
            // to define a bunch of similar variants quickly)
            this.setState({
                ruleApplicationRate: 1
            })
            var object = {
                "rule body": expansion,
                "application rate": appRate,
                "rule head name": ruleHeadName
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
                        this.props.updateFromServer(this.callbackToSwitchViewToNewlyDefinedView);
                    }
                    else {
                        this.props.updateFromServer();
                    }
                    this.props.updateGeneratedContentPackageTags([]);
                    this.props.updateGeneratedContentPackageText('');
                },
                cache: false
            })
            if (this.state.connectNewRuleHeadToCurrentSymbol) {
                var object = {
                    "rule body": "[[" + ruleHeadName + "]]",
                    "application rate": 1,
                    "rule head name": this.props.currentSymbolName
                }
                ajax({
                    url: $SCRIPT_ROOT + '/api/rule/add',
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(object),
                    success: () => {
                        this.props.updateFromServer();
                    },
                    cache: false
                })
            }
            setTimeout(function() {
                clearInterval(juicingIntervalFunction);
                document.getElementById('submitRuleButton').innerHTML = 'Add Rule';
                document.getElementById('submitRuleButton').style.backgroundColor = 'rgb(242, 242, 242)';
            }, 1250);
        }
    }

    editRule() {
        document.getElementById('submitRuleButton').style.backgroundColor = 'rgb(87, 247, 224)';
        document.getElementById('submitRuleButton').innerHTML = 'Updated!'
        var ruleHeadName = this.state.ruleHeadInputVal;
        var appRate = this.state.ruleApplicationRate;
        var expansion = this.state.ruleExpansionInputVal;
        if (expansion != '') {
            var object = {
                "rule id": this.props.idOfRuleToEdit,
                "rule body": expansion,
                "application rate": appRate,
                "rule head name": ruleHeadName,
                "original rule head name": this.props.currentSymbolName
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
                var object = {
                    "rule body": "[[" + this.state.ruleHeadInputVal + "]]",
                    "application rate": 1,
                    "rule head name": this.props.currentSymbolName
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
    }

    juiceRuleDefinitionSubmitButton() {
        // This function gradually fades the rule-definition submit button ("Add Rule" or "Update Rule")
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
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.idOfRuleToEdit !== null) {
            this.setState({
                ruleHeadInputVal: nextProps.currentSymbolName,
                ruleExpansionInputVal: nextProps.rules[nextProps.idOfRuleToEdit].expansion.join(''),
                ruleApplicationRate: nextProps.rules[nextProps.idOfRuleToEdit].app_rate,
                connectNewRuleHeadToCurrentSymbol: false
            });
        }
        else {
            this.setState({
                ruleHeadInputVal: nextProps.currentSymbolName,
                ruleExpansionInputVal: '',
                ruleApplicationRate: 1,
                connectNewRuleHeadToCurrentSymbol: false
            });
        }
    }

    render() {
        var rules = [];
        this.props.rules.forEach(function (rule, i) {
            var shortened = rule.expansion.join('').substring(0, 10);
            rules.push(<Button onClick={this.handleRuleClick.bind(this, i)} title={AUTHOR_IS_USING_A_MAC ? "View production rule (toggle: ⇥, ⇧⇥)" : "View production rule (toggle: Tab, Shift+Tab)"} key={rule.expansion.join('')+this.props.currentSymbolName} style={i === this.props.currentRule ? {"backgroundColor": "#ffe97f"} : {}}>{shortened}</Button>);
        }, this);
        var ruleDefinitionAddButtonIsDisabled = this.props.ruleAlreadyExists(this.state.ruleHeadInputVal, this.state.ruleExpansionInputVal, this.state.ruleApplicationRate);
        if (this.props.idOfRuleToEdit !== null) {
            var ruleDefinitionModalButtonText = 'Update Rule';
            var ruleDefinitionModalButtonHoverText = 'Update rule';
            var ruleDefinitionModalButtonCallback = this.editRule;
        }
        else {
            var ruleDefinitionModalButtonText = 'Add Rule';
            var ruleDefinitionModalButtonHoverText = 'Add rule';
            var ruleDefinitionModalButtonCallback = this.addRule;
        }
        if (ruleDefinitionAddButtonIsDisabled) {
            ruleDefinitionModalButtonHoverText += " (disabled: rule already exists)"
        }
        else if (this.state.ruleHeadInputVal === '') {
            ruleDefinitionAddButtonIsDisabled = true;
            ruleDefinitionModalButtonHoverText += " (disabled: rule head is missing)"
        }
        else if (this.state.ruleExpansionInputVal === '') {
            ruleDefinitionAddButtonIsDisabled = true;
            ruleDefinitionModalButtonHoverText += " (disabled: rule body is empty)"
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
                            {rules}
                        </ButtonGroup>
                </div>
                <div>
                    <Modal show={this.props.showRuleDefinitionModal} onHide={this.closeModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Rule Definition</Modal.Title>
                        </Modal.Header>
                        {Object.keys(this.props.nonterminals).some(function (name) {return name.indexOf("$symbol") === -1})
                            ?
                            <input  id='ruleDefinitionNonterminalListSearch'
                                title="Hint: try '$text:[text from symbol rewriting]', e.g., '$text:typoo'"
                                type='text'
                                onChange={this.updateRuleDefinitionSymbolFilterQuery}
                                value={this.state.ruleDefinitionSymbolFilterQuery}
                                style={{'width': '100%', 'height': '43px', 'fontSize': '18px', 'padding': '0 12px'}}
                                placeholder='Filter list...'
                                // This hack is necessary to keep the cursor at the end of the query upon auto-focus
                                onFocus={function(e) {
                                    var val = e.target.value;
                                    e.target.value = '';
                                    e.target.value = val;
                            }}/>
                            :
                            ""
                        }
                        <div id='nonterminalsListModal' style={{'overflowY': 'scroll', 'marginBottom': '15px', 'height': '200px'}}>
                            {   this.formatList(this.props.getListOfMatchingSymbolNames(this.state.ruleDefinitionSymbolFilterQuery)).map((name) => {
                                    var color = this.props.nonterminals[name].complete ? "success" : "danger"
                                    return (
                                        <button className={'list-group-item list-group-item-xs nonterminal list-group-item-'.concat(color)}
                                        style={{'margin':'0', 'border':'0px'}}
                                        title={this.state.ruleBodyInputIsActive ? "Insert symbol reference into rule body (hint: when editing rule head, clicking here changes the head to the selected symbol)" : "Change rule head to symbol (hint: when editing rule body, clicking here inserts the selected symbol into the body)"}
                                        onClick={this.handleSymbolReferenceClick.bind(this, name)} key={name}>{this.props.nonterminals[name].deep ? <Glyphicon glyph="star"/> : ""}{this.props.nonterminals[name].deep ? " " : ""}{name}
                                        </button>
                                    )
                                })
                            }
                        </div>
                        <div style={{'textAlign': 'center'}}>
                            <textarea id='ruleHeadInput' type='text' title="This is the rule head: the symbol that is rewritten when this rule is executed." value={this.state.ruleHeadInputVal} onChange={this.updateRuleHeadInputVal} onFocus={this.deregisterRuleBodyInputFocus} style={{'width': '90%', 'border': '0px solid #d7d7d7', 'height': '43px', 'marginTop': '10px', 'marginBottom': '15px', 'fontSize': '18px', 'padding': '8px 12px', backgroundColor: '#f2f2f2'}} autoFocus={this.state.ruleHeadInputVal === ""}/>
                            <p title='The arrow in a production rule cues that the rule head (top) will be rewritten as the rule body (bottom).'><Glyphicon glyph="circle-arrow-down" style={{"fontSize": "25px", "top": "5px"}}/></p>
                            <textarea id='ruleExpansionInput' type='text' title="This is the rule body: what the rule head will be rewritten as when this rule is executed." value={this.state.ruleExpansionInputVal} onChange={this.updateRuleExpansionInputVal} onFocus={this.registerRuleBodyInputFocus} style={{'width': '90%', 'border': '0px solid #d7d7d7', 'height': '100px', 'marginTop': '10px', 'marginBottom': '15px', 'fontSize': '18px', 'padding': '0 12px', backgroundColor: '#f2f2f2'}} autoFocus={this.state.ruleHeadInputVal !== ""}/>
                            <br/>
                            <input title="This is the application rate: a number that specifies how frequently this rule will be used relative to any sibling rules (a higher number increases the frequency)." id='appRateModal' type='text' value={this.state.ruleApplicationRate} onChange={this.updateApplicationRate} onFocus={this.deregisterRuleBodyInputFocus} style={{'width': '50px', 'border': '0px solid #d7d7d7', 'height': '43px', 'marginBottom': '25px', 'fontSize': '18px', 'padding': '0 12px', 'textAlign': 'center'}}/>
                            <br/>
                            {(this.displayConnectBackCheckbox())
                                ?
                                <label title={"If checked, the following production rule will also be created: '" + this.props.currentSymbolName + " -> [[" + this.state.ruleHeadInputVal + "]]'. This can be used as a way of attaching tags to a production rule, which requires it to be associated with a dedicated symbol."} style={{"fontWeight": "normal", "position": "absolute", "left": "0px", "padding": "20px 0px 21px 31px"}}><input title={"If checked, the following production rule will also be created: '" + this.props.currentSymbolName + " -> [[" + this.state.ruleHeadInputVal + "]]'. This can be used as a way of attaching tags to a production rule, which requires it to be associated with a dedicated symbol."} name="isGoing" type="checkbox" checked={this.state.connectNewRuleHeadToCurrentSymbol} onChange={this.toggleConnectNewRuleHeadToCurrentSymbol}/> Connect to current symbol</label>
                                :
                                ""
                            }
                            <Button id="submitRuleButton" title={ruleDefinitionModalButtonHoverText} disabled={ruleDefinitionAddButtonIsDisabled} bsStyle="primary" bsSize="large" style={{'marginBottom': '25px'}} onClick={ruleDefinitionModalButtonCallback}>{ruleDefinitionModalButtonText}</Button>
                        </div>
                    </Modal>
                </div>
            </div>
        );
    }
}

module.exports = RuleBar;
