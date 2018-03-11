var React = require('react')

class FeedbackBar extends React.Component {

    render() {
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
                     style={{"backgroundColor": "#fff", "border": "10px solid #f2f2f2", "borderRight": "0px solid #fff", "float": "left", "height": "110%", "width": "50%", "overflow": "auto", "padding": "10px"}}>
                    {derivation_str}
                </div>

                <div id="Markup"
                     style={{"backgroundColor": "#fff", "border": "10px solid #f2f2f2", "borderRight": "0px solid #fff", "height": "110%", "float": "left", "width": "50%", "overflow": "auto", "padding": "10px"}}>
                    <p dangerouslySetInnerHTML={{__html: markups_str}}></p>
                </div>

            </div>

        );
    }
}

module.exports = FeedbackBar;
