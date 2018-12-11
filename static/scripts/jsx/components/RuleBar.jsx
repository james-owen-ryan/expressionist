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
        this.addToRuleExpansion = this.addToRuleExpansion.bind(this);
        this.updateRuleExpansionInputVal = this.updateRuleExpansionInputVal.bind(this);
        this.updateApplicationRate = this.updateApplicationRate.bind(this);
        this.addRule = this.addRule.bind(this);
        this.editRule = this.editRule.bind(this);
        this.juiceRuleDefinitionSubmitButton = this.juiceRuleDefinitionSubmitButton.bind(this);
        this.state = {
            showModal: false,
            ruleExpansionInputVal: '',
            ruleApplicationRate: 1
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

    addToRuleExpansion(nonterminalName) {
        var exp = this.toExpressionistSyntax(nonterminalName);
        var res = this.state.ruleExpansionInputVal.concat(exp);
        this.setState({ruleExpansionInputVal: res})
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
                "rule": expansion,
                "app_rate": appRate,
                "nonterminal": this.props.name  // current_nonterminal
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
        var appRate = this.state.ruleApplicationRate;
        var expansion = this.state.ruleExpansionInputVal;
        if (expansion != '') {
            var object = {
                "rule_id": this.props.idOfRuleToEdit,
                "rule": expansion,
                "app_rate": appRate,
                "nonterminal": this.props.name  // current_nonterminal
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
        // This function gradually fades the rule-definition submit button ("Add Rule" or "Edit Rule")
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
                               title={rule.expansion.join('')}
                               key={rule.expansion.join('') + this.props.name}>{shortened}</Button>);
        }, this);
        if (this.props.idOfRuleToEdit !== null) {
            var ruleDefinitionModalButtonText = 'Update Rule';
            var ruleDefinitionModalButtonCallback = this.editRule;
        }
        else {
            var ruleDefinitionModalButtonText = 'Add Rule';
            var ruleDefinitionModalButtonCallback = this.addRule;
        }
        return (
            <div>
                <div className="btn-test">
                        <ButtonGroup>
                            <Button onClick={this.openModal} key="addnew"><Glyphicon glyph="plus"/></Button>
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
                                        onClick={this.addToRuleExpansion.bind(this, name)} key={name}>{name}
                                        </button>
                                    )
                                })
                            }
                        </div>
                        <div style={{'textAlign': 'center'}}>
                            <p style={{'fontWeight': '300', 'fontSize': '16px'}}>Rewrite As</p>
                            <textarea id='ruleExpansionInput' type='text' value={this.state.ruleExpansionInputVal} onChange={this.updateRuleExpansionInputVal} style={{'width': '90%', 'border': '0px solid #d7d7d7', 'height': '100px', 'marginTop': '10px', 'marginBottom': '15px', 'fontSize': '18px', 'padding': '0 12px', backgroundColor: '#f2f2f2'}} autoFocus="true"/>
                            <p style={{'fontWeight': '300', 'fontSize': '16px'}}>Application Rate</p>
                            <input id='appRateModal' type='text' value={this.state.ruleApplicationRate} onChange={this.updateApplicationRate}
                            style={{'width': '90%', 'border': '0px solid #d7d7d7', 'height': '43px', 'marginBottom': '25px', 'fontSize': '18px', 'padding': '0 12px'}}/>
                            <Button id="submitRuleButton" bsStyle="primary" bsSize="large" style={{'marginBottom': '25px'}} onClick={ruleDefinitionModalButtonCallback}>{ruleDefinitionModalButtonText}</Button>
                        </div>
                    </Modal>
                </div>
            </div>
        );
    }
}

module.exports = RuleBar;
