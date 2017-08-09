{/* This is responsible for rendering the Rule Bar, which is attached directly to the Main interface*/
}
var React = require('react')
var Button = require('react-bootstrap').Button
var ButtonGroup = require('react-bootstrap').ButtonGroup
var Modal = require('react-bootstrap').Modal
var ajax = require('jquery').ajax

var RuleBar = React.createClass({
    getInitialState() {
        return {
            showModal: false,
            ruleExpansionInputVal: '',
            ruleApplicationRate: 1
        };
    },

    propTypes: {
        name: React.PropTypes.string,
        rules: React.PropTypes.arrayOf(React.PropTypes.shape({
                expansion: React.PropTypes.array,
                app_rate: React.PropTypes.number
            })
        ).isRequired,
        onRuleClick: React.PropTypes.func,
        onRuleAdd: React.PropTypes.func
    },

    previousRules() {
    },

    nextRules() {
    },

    closeModal() { this.setState({showModal: false}) },

    openModal() {
        this.setState({showModal: true})
    },

    toExpressionistSyntax(nonterminalName) { return "[[" + nonterminalName + "]]" },

    addToRuleExpansion(nonterminalName) {
        var exp = this.toExpressionistSyntax(nonterminalName);
        var res = this.state.ruleExpansionInputVal.concat(exp);
        this.setState({ruleExpansionInputVal: res})
    },

    updateRuleExpansionInputVal(e) { this.setState({ruleExpansionInputVal: e.target.value}) },

    updateApplicationRate(e) { 
        if (!isNaN(e.target.value)){
            this.setState({ruleApplicationRate: e.target.value}) 
        }else{
            this.setState({ruleApplicationRate: 1})
        }
    },

    addRule(){
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
                async: false,
                cache: false
            })
            this.props.ruleAddUpdate(this.props.name)
            this.updateRuleExpansionInputVal({'target': {'value': ''}})
            this.closeModal();
        }
    },

    render: function () {
        var rules = []
        this.props.rules.forEach(function (rule, i) {
            //console.log(rules)
            var shortened = rule.expansion.join('').substring(0, 10);
            rules.push(<Button onClick={this.props.onRuleClick.bind(null, i)}
                               title={rule.expansion.join('')}
                               key={rule.expansion.join('') + this.props.name}>{shortened}</Button>);
        }, this)
        return (
            <div>
                <div className="btn-test">
                    <ButtonGroup>
                        <Button onClick={this.openModal} key="addnew">Add a Rule!</Button>
                        {rules}
                    </ButtonGroup>
                </div>
                <Modal show={this.state.showModal} onHide={this.closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add A New Rule</Modal.Title>
                    </Modal.Header>
                    <div id='nonterminalsListModal' style={{'overflowY': 'scroll', 'marginBottom': '15px', 'borderBottomStyle': 'solid', 'height': '400px'}}>
                        {   Object.keys(this.props.nonterminals).map((name) => {
                                var color = this.props.nonterminals[name].complete ? "success" : "danger" 
                                return (
                                    <button className={'list-group-item list-group-item-xs nonterminal list-group-item-'.concat(color)} 
                                    style={{'margin':'0', 'border':'1px solid #ddd'}} 
                                    onClick={this.addToRuleExpansion.bind(this, name)} key={name}>{name}
                                    </button>
                                )
                            })
                        }
                    </div>
                    <div style={{'textAlign': 'center'}}>
                        <p style={{'fontWeight': '300', 'fontSize': '16px'}}>Rule Expansion</p> 
                        <input id='ruleExpansionInput' type='text'
                            value={this.state.ruleExpansionInputVal} onChange={this.updateRuleExpansionInputVal}
                            style={{'width': '90%', 'border': '1px solid #d7d7d7', 'height': '43px', 'marginTop': '10px', 'marginBottom': '15px', 'fontSize': '18px', 'padding': '0 12px'}}/>
                        <p style={{'fontWeight': '300', 'fontSize': '16px'}}>Application Rate</p>
                        <input id='appRateModal' type='text' onChange={this.updateApplicationRate} value={this.state.ruleApplicationRate}
                        style={{'width': '90%', 'border': '1px solid #d7d7d7', 'height': '43px', 'marginBottom': '25px', 'fontSize': '18px', 'padding': '0 12px'}}/>
                        <Button bsStyle="primary" bsSize="large" style={{'marginBottom': '25px'}} onClick={this.addRule}>Add Rule</Button>
                    </div>
                </Modal>
            </div>
        );
    }
});

module.exports = RuleBar
