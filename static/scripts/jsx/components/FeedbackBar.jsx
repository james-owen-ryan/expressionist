{/* This is responsible for producing the feedback for any given Nonterminal or Rule expansion. Contains the text box for the expansion and for the Markup */
}
var React = require('react')
var FeedbackBar = React.createClass({

    propTypes: {
        derivation: React.PropTypes.string,
        markup: React.PropTypes.array
    },

    render: function () {
        var derivation_str = ""
        if (this.props.derivation) {
            derivation_str = this.props.derivation
        }
        var markups_str = ""
        if (this.props.markup) {
            this.props.markup.forEach(function (tags) {
                markups_str += tags + '<br>'
            })
        }
        return (
            <div id="feedback" style={{"height": "75%", "width": "100%"}}>

                <div id="Derivation"
                     style={{"border": "2px solid black", "float": "left", "height": "100%", "width": "60%", "overflow": "auto", "padding": "10px"}}>
                    {derivation_str}
                </div>

                <div id="Markup"
                     style={{"border": "2px solid black", "height": "100%", "float": "left", "width": "40%", "overflow": "auto", "padding": "10px"}}>
                    <p dangerouslySetInnerHTML={{__html: markups_str}}></p>
                </div>

            </div>

        );
    }
});

module.exports = FeedbackBar
