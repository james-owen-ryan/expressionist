var MarkupSet = require('./MarkupSet.jsx')
var React = require('react')
var ButtonGroup = require('react-bootstrap').ButtonGroup
var Button = require('react-bootstrap').Button
var Glyphicon = require('react-bootstrap').Glyphicon
var ajax = require('jquery').ajax

class MarkupBar extends React.Component {

    constructor(props) {
        super(props);
        this.handleMarkupSetAdd = this.handleMarkupSetAdd.bind(this);
        var presentMarkups = []
        if (props.currentNonterminal in props.nonterminals){
            presentMarkups = props.nonterminals[props.current_nonterminal].markup
        }
        this.state = {
            present: presentMarkups
        }
    }

    componentWillReceiveProps(props){
        var presentMarkups = []
        if (props.currentNonterminal in props.nonterminals){
            presentMarkups = props.nonterminals[props.currentNonterminal].markup
        }
        this.setState({
            present: presentMarkups
        });
    }

    handleMarkupSetAdd() {
        var markupTag = window.prompt("Please enter MarkupSet")
        if (markupTag != "") {
            var object = {"markupSet": markupTag}
            ajax({
                url: $SCRIPT_ROOT + '/api/markup/addtagset',
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(object),
                async: false,
                cache: false
            })
            this.props.updateFromServer()
        }
    }

    render() {
        var output = []
        var total = Object.keys(this.props.total)
        for( var outer = 0; total.length > outer ; outer++)
        {
          var present_nt = []
          if (this.state.present[total[outer]])
          {
            present_nt = this.state.present[total[outer]]
          }
          else
          {
            present_nt = []
          }

          output.push(<MarkupSet    currentNonterminal={this.props.currentNonterminal}
                                    updateFromServer={this.props.updateFromServer}
                                    markups={this.props.total}
                                    key={total[outer]} 
                                    name={total[outer]}
                                    present_nt={present_nt} 
                                    current_set={this.props.total[total[outer]]}/>)
        }
        return(
            <ButtonGroup className="btn-test">
                <Button className="grp_button" onClick={this.handleMarkupSetAdd} key="addnew">
                    <Glyphicon glyph="plus"/>
                </Button>
            {output}
            </ButtonGroup>
        )
    }
}

module.exports = MarkupBar;
