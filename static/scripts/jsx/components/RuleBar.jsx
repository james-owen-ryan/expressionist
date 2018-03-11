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
        this.handleRuleClick = this.handleRuleClick.bind(this);
        this.addToRuleExpansion = this.addToRuleExpansion.bind(this);
        this.updateRuleExpansionInputVal = this.updateRuleExpansionInputVal.bind(this);
        this.updateApplicationRate = this.updateApplicationRate.bind(this);
        this.addRule = this.addRule.bind(this);
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
        this.setState({showModal: false});
    }

    toExpressionistSyntax(nonterminalName) { return "[[" + nonterminalName + "]]" }

    handleRuleClick(index) {
        this.props.updateCurrentRule(index)
        this.props.updateHistory(this.props.name, index)
    }

    addToRuleExpansion(nonterminalName) {
        var exp = this.toExpressionistSyntax(nonterminalName);
        var res = this.state.ruleExpansionInputVal.concat(exp);
        this.setState({ruleExpansionInputVal: res})
    }

    updateRuleExpansionInputVal(e) { this.setState({ruleExpansionInputVal: e.target.value}) }

    updateApplicationRate(e) { 
        if (!isNaN(e.target.value)){
            this.setState({ruleApplicationRate: e.target.value}) 
        }else{
            this.setState({ruleApplicationRate: 1})
        }
    }

    addRule() {
        var appRate = this.state.ruleApplicationRate
        var expansion = this.state.ruleExpansionInputVal

        if (expansion != '') {
            var object = {
                "rule": expansion,
                "app_rate": appRate,
                "nonterminal": this.props.name //current_nonterminal
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
                    this.updateRuleExpansionInputVal({'target': {'value': ''}})
                    this.setState({showModal: false})
                    this.props.updateFromServer()
                },
                cache: false
            })
        }
    }

    render() {
        var rules = []
        this.props.rules.forEach(function (rule, i) {
            var shortened = rule.expansion.join('').substring(0, 10);
            rules.push(<Button onClick={this.handleRuleClick.bind(this, i)}
                               title={rule.expansion.join('')}
                               key={rule.expansion.join('') + this.props.name}>{shortened}</Button>);
        }, this)
        return (
            <div>
                <div className="btn-test">
                    <ButtonGroup>
                        <Button onClick={this.openModal} key="addnew"><Glyphicon
              glyph="plus"/></Button>
                        {rules}
                    </ButtonGroup>
                </div>
                <Modal show={this.state.showModal} onHide={this.closeModal}>
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
                        <textarea id='ruleExpansionInput' type='text' value={this.state.ruleExpansionInputVal} onChange={this.updateRuleExpansionInputVal} style={{'width': '90%', 'border': '0px solid #d7d7d7', 'height': '43px', 'marginTop': '10px', 'marginBottom': '15px', 'fontSize': '18px', 'padding': '0 12px', backgroundColor: '#f2f2f2'}}/>
                        <p style={{'fontWeight': '300', 'fontSize': '16px'}}>Application Rate</p>
                        <input id='appRateModal' type='text' onChange={this.updateApplicationRate} value={this.state.ruleApplicationRate}
                        style={{'width': '90%', 'border': '0px solid #d7d7d7', 'height': '43px', 'marginBottom': '25px', 'fontSize': '18px', 'padding': '0 12px'}}/>
                        <Button bsStyle="primary" bsSize="large" style={{'marginBottom': '25px'}} onClick={this.addRule}>Add Rule</Button>
                    </div>
                </Modal>
            </div>
        );
    }
}

module.exports = RuleBar;
