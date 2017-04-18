{/* This is responsible for rendering the Rule Bar, which is attached directly to the Main interface*/
}
var React = require('react')
var Button = require('react-bootstrap').Button
var ButtonGroup = require('react-bootstrap').ButtonGroup

var RuleBar = React.createClass({
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
            <div className="btn-test">
                <ButtonGroup>
                    <Button onClick={this.props.onRuleAdd} title="Add new Rule" key="addnew">Add a Rule!</Button>
                    {rules}
                </ButtonGroup>
            </div>
        );
    }
});

module.exports = RuleBar
