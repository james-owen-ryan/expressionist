var React = require('react')
var Button = require('react-bootstrap').Button
var ButtonGroup = require('react-bootstrap').ButtonGroup
var Modal = require('react-bootstrap').Modal
var ajax = require('jquery').ajax
var Glyphicon = require('react-bootstrap').Glyphicon

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
        this.state = {
            showModal: false,
            ruleHeadInputVal: '',
            ruleExpansionInputVal: '',
            ruleApplicationRate: 1,
            ruleBodyInputIsActive: false
        }
    }

    openModal() {
        this.setState({showModal: true});
    }

    closeModal() {
        this.setState({
            showModal: false,
            ruleExpansionInputVal: '',
            ruleApplicationRate: 1
        });
        this.props.closeRuleDefinitionModal();
    }

    submitRuleDefinitionOnEnter(e) {
        if (this.state.showModal || this.props.ruleDefinitionModalIsOpen) {
            if (e.key === 'Enter') {
                document.getElementById("submitRuleButton").click();
            }
        }
    }

    toExpressionistSyntax(nonterminalName) {
        return "[[" + nonterminalName + "]]"
    }

    handleRuleClick(index) {
        this.props.updateCurrentRule(index)
        this.props.updateHistory(this.props.name, index)
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
                    this.props.updateCurrentNonterminal(this.props.name);
                    this.props.updateCurrentRule(-1);
                    this.props.updateMarkupFeedback([]);
                    this.props.updateExpansionFeedback('');
                    this.props.updateHistory(this.props.name, -1);
                    this.props.updateFromServer()
                },
                cache: false
            })
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
                "original rule head name": this.props.name
            }
            ajax({
                url: $SCRIPT_ROOT + '/api/rule/edit',
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(object),
                success: () => {
                    this.props.updateCurrentNonterminal(this.props.name);
                    this.props.updateCurrentRule(-1);
                    this.props.updateMarkupFeedback([]);
                    this.props.updateExpansionFeedback('');
                    this.props.updateHistory(this.props.name, -1);
                    this.props.updateFromServer()
                    this.closeModal()
                },
                cache: false
            })
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

    componentDidMount(){
        document.addEventListener("keydown", this.submitRuleDefinitionOnEnter, false);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ruleHeadInputVal: this.props.name})
        if (nextProps.idOfRuleToEdit !== null) {
            this.setState({
                ruleExpansionInputVal: nextProps.rules[nextProps.idOfRuleToEdit].expansion.join(''),
                ruleApplicationRate: nextProps.rules[nextProps.idOfRuleToEdit].app_rate
            });
        }
    }

    render() {
        var rules = [];
        this.props.rules.forEach(function (rule, i) {
            var shortened = rule.expansion.join('').substring(0, 10);
            rules.push(<Button onClick={this.handleRuleClick.bind(this, i)}
                               title="View production rule"
                               key={rule.expansion.join('') + this.props.name}>{shortened}</Button>);
        }, this);
        var openRuleModalButtonIsDisabled = true;
        var allSymbolNames = Object.keys(this.props.nonterminals);
        for (var i = 0; i < allSymbolNames.length; i++){
            if (allSymbolNames[i].indexOf('$symbol') === -1) {
                openRuleModalButtonIsDisabled = false;
                break;
            }
        }
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
        else if (this.state.ruleExpansionInputVal === '') {
            ruleDefinitionAddButtonIsDisabled = true;
            ruleDefinitionModalButtonHoverText += " (disabled: rule body is empty)"
        }
        else if (this.state.ruleApplicationRate === '') {
            ruleDefinitionAddButtonIsDisabled = true;
            ruleDefinitionModalButtonHoverText += " (disabled: application rate is missing)"
        }
        return (
            <div>
                <div className="btn-test">
                        <ButtonGroup>
                            <Button disabled={openRuleModalButtonIsDisabled} onClick={this.openModal} title="Add new production rule" key="addnew"><Glyphicon glyph="plus"/></Button>
                            {rules}
                        </ButtonGroup>
                </div>
                <div>
                    <Modal show={this.state.showModal || this.props.ruleDefinitionModalIsOpen} onHide={this.closeModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Rule Definition</Modal.Title>
                        </Modal.Header>
                        <div id='nonterminalsListModal' style={{'overflowY': 'scroll', 'marginBottom': '15px', 'borderBottomStyle': 'solid', 'height': '200px'}}>
                            {   Object.keys(this.props.nonterminals).map((name) => {
                                    var color = this.props.nonterminals[name].complete ? "success" : "danger"
                                    return (
                                        <button className={'list-group-item list-group-item-xs nonterminal list-group-item-'.concat(color)}
                                        style={{'margin':'0', 'border':'0px'}}
                                        title={this.state.ruleBodyInputIsActive ? "Add symbol reference" : "Change rule head"}
                                        onClick={this.handleSymbolReferenceClick.bind(this, name)} key={name}>{name}
                                        </button>
                                    )
                                })
                            }
                        </div>
                        <div style={{'textAlign': 'center'}}>
                            <p title="This is the symbol that will be rewritten by executing this rule." style={{'fontWeight': '300', 'fontSize': '16px'}}>Rule head</p>
                            <textarea id='ruleHeadInput' type='text' title="This is the symbol that will be rewritten by executing this rule." value={this.state.ruleHeadInputVal} onChange={this.updateRuleHeadInputVal} onFocus={this.deregisterRuleBodyInputFocus} style={{'width': '90%', 'border': '0px solid #d7d7d7', 'height': '43px', 'marginTop': '10px', 'marginBottom': '15px', 'fontSize': '18px', 'padding': '8px 12px', backgroundColor: '#f2f2f2'}}/>
                            <p title="This is what the rule head will be rewritten as (rule body) when this rule is executed." style={{'fontWeight': '300', 'fontSize': '16px'}}>Rule body</p>
                            <textarea id='ruleExpansionInput' type='text' title="This is what the symbol (rule head) will be rewritten as (rule body) when this rule is executed." value={this.state.ruleExpansionInputVal} onChange={this.updateRuleExpansionInputVal} onFocus={this.registerRuleBodyInputFocus} style={{'width': '90%', 'border': '0px solid #d7d7d7', 'height': '100px', 'marginTop': '10px', 'marginBottom': '15px', 'fontSize': '18px', 'padding': '0 12px', backgroundColor: '#f2f2f2'}} autoFocus="true"/>
                            <p title="This number specifies how often this rule will be randomly selected relative to any sibling rules (a higher number increases the chance)." style={{'fontWeight': '300', 'fontSize': '16px'}}>Application rate</p>
                            <input title="This number specifies how often this rule will be randomly selected relative to any sibling rules (a higher number increases the chance)." id='appRateModal' type='text' value={this.state.ruleApplicationRate} onChange={this.updateApplicationRate} onFocus={this.deregisterRuleBodyInputFocus} style={{'width': '50px', 'border': '0px solid #d7d7d7', 'height': '43px', 'marginBottom': '25px', 'fontSize': '18px', 'padding': '0 12px', 'textAlign': 'center'}}/>
                            <br/>
                            <Button id="submitRuleButton" title={ruleDefinitionModalButtonHoverText} disabled={ruleDefinitionAddButtonIsDisabled} bsStyle="primary" bsSize="large" style={{'marginBottom': '25px'}} onClick={ruleDefinitionModalButtonCallback}>{ruleDefinitionModalButtonText}</Button>
                        </div>
                    </Modal>
                </div>
            </div>
        );
    }
}

module.exports = RuleBar;
