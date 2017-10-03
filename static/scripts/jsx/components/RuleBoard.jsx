{/* This will be responsible for rendering the main data interface board when it is displaying a rule*/
}

var React = require('react')
var Button = require('react-bootstrap').Button
var Glyphicon = require('react-bootstrap').Glyphicon

var RuleBoard = React.createClass({
    PropTypes: {
        name: React.PropTypes.string,
          //expansion: React.PropTypes,
        app_rate: React.PropTypes.number,
        onChangeRule: React.PropTypes.func,
        onDeleteRule: React.PropTypes.func,
        onRuleClickThrough: React.PropTypes.func,
    },

    render: function () {

        //console.log(this.props.expansion);
        var expansion_arr = [];
        var length = this.props.expansion.length;
        var symbol;
        for(var i = 0; i < length; i++)
        {
            //console.log(this.props.expansion[i])
            symbol = this.props.expansion[i]
            if (symbol.indexOf('[[') != -1) {
                var tag = symbol.slice(2,-2);
                expansion_arr.push(<span style={{"cursor": "pointer"}} onClick={this.props.onRuleClickThrough.bind(null, symbol.slice(2,-2))}>
                <b>{symbol}</b></span>)
            }
            else
            {
                expansion_arr.push(<span>{symbol}</span>)
            }


        }
        //console.log(expansion_arr)

        return (
            <div>
                <div style={{"width": "50%", "margin": "0 auto"}}>
                    <h2 onClick={this.props.onRuleClickThrough.bind(null, this.props.name)}><b>{this.props.name}</b></h2>
                </div>

                <div>
                    <h3>{this.props.name} -> {expansion_arr}</h3><Button bsStyle="danger" title="Delete Rule"
                                                                                onClick={this.props.onDeleteRule}><Glyphicon
                    glyph="warning-sign"/>Delete</Button>
                </div>

                <h2>{this.props.app_rate}<Button bsStyle="default" title="Modify Application Rate"
                                                 onClick={this.props.onAppChange}><Glyphicon glyph="console"/></Button>
                
                <Button bsStyle="default" title="Expand this rule"
                                                 onClick={this.props.onRuleExpand}><Glyphicon glyph="resize-full"/></Button>
                </h2>

            </div>
        )

    }
});

module.exports = RuleBoard
