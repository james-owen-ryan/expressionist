var MarkupSet = require('./MarkupSet.jsx')
var React = require('react')
var ButtonGroup = require('react-bootstrap').ButtonGroup
var Button = require('react-bootstrap').Button
var Glyphicon = require('react-bootstrap').Glyphicon

var MarkupBar = React.createClass({


  render: function(){
    //empty output array
    var output = []
    var total = Object.keys(this.props.total)
    //for loop iterates over the array which holds all markups
    for( var outer = 0; total.length > outer ; outer++)
    {
      var present_nt = []
      if (this.props.present[total[outer]])
      {
        present_nt = this.props.present[total[outer]]
      }
      else
      {
        present_nt = []
      }

      output.push(<MarkupSet onClickMarkup = {this.props.onClickMarkup}
        onRenameMarkupSet={this.props.onRenameMarkupSet} 
        onAddMarkup ={this.props.onAddMarkup}
        key={total[outer]} 
        name={total[outer]}
        present_nt={present_nt} 
        onRenameMarkup={this.props.onRenameMarkup}
        current_set={this.props.total[total[outer]]}/>)
    }
    return(
        <ButtonGroup className="btn-test">
          <Button className="grp_button" onClick={this.props.onAddMarkupSet} key="addnew"><Glyphicon
              glyph="plus"/></Button>
        {output}
      </ButtonGroup>
    )
    }
});

module.exports = MarkupBar
