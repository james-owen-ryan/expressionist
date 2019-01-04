var React = require('react')
var Glyphicon = require('react-bootstrap').Glyphicon
var Button = require('react-bootstrap').Button
var Modal = require('react-bootstrap').Modal

class FeedbackBar extends React.Component {

    constructor(props) {
        super(props);
        this.openTreeExpressionModal = this.openTreeExpressionModal.bind(this);
        this.closeTreeExpressionModal = this.closeTreeExpressionModal.bind(this);
        this.state = {
            showTreeExpressionModal: false
        };
    }

    openTreeExpressionModal() {
        this.setState({showTreeExpressionModal: true})
    }

    closeTreeExpressionModal() {
        this.setState({showTreeExpressionModal: false})
    }

    render() {
        var derivation_str = ""
        if (this.props.derivation) {
            derivation_str = this.props.derivation
        }
        var markups_str = ""
        if (this.props.markup) {
            this.props.markup.forEach(function (tags) {
                markups_str += '* ' + tags + '<br>'
            })
        }
        return (
            <div id="feedback" style={{"height": "100%", "width": "100%", "position": "absolute", "bottom": "0", "left": "0"}}>
                <div title="Text in generated content package" id="Derivation"
                     style={{"backgroundColor": "#fff", "border": "10px solid #f2f2f2", "borderRight": "0px solid #fff", "float": "left", "height": "100%", "width": "50%", "overflow": "auto", "padding": "10px", "paddingRight": "0px"}}>
                    <div style={{"paddingRight": "10px"}}>{derivation_str}</div>
                    {/* <div style={{"position": "absolute", "bottom": "10px", "right": "0px"}}><Button onClick={this.openTreeExpressionModal} title="View tree expression" disabled={this.props.derivation ? false : true}><Glyphicon glyph="tree-conifer"/></Button></div> */}
                </div>
                <div title="Tags in generated content package" id="Markup"
                     style={{"backgroundColor": "#fff", "border": "10px solid #f2f2f2", "borderRight": "0px solid #fff", "height": "100%", "float": "left", "width": "50%", "overflow": "auto", "padding": "10px"}}>
                    <p dangerouslySetInnerHTML={{__html: markups_str}}></p>
                </div>
            <Modal show={this.state.showTreeExpressionModal} onHide={this.closeTreeExpressionModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Tree expression</Modal.Title>
                </Modal.Header>
                <div>{this.props.treeExpression}</div>
            </Modal>
            </div>
        );
    }
}

module.exports = FeedbackBar;