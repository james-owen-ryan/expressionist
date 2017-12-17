var React = require('react')
var ListGroupItem = require('react-bootstrap').ListGroupItem
var ListGroup = require('react-bootstrap').ListGroup
var ajax = require('jquery').ajax

class FileList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            grammarFileNames: []
        };
    }

    componentDidMount() {
        ajax({
            url: $SCRIPT_ROOT + '/api/grammar/load_dir',
            type: "GET",
            cache: false,
            success: (data) => { this.setState({'grammarFileNames': data.results}) }
        })
    }

    render() {
        var files = null;
        if (this.state.grammarFileNames.length > 0) {
            files = this.state.grammarFileNames.map( (filename) => {
                return <ListGroupItem onClick={this.props.onFileClick.bind(this, filename)} key={filename}>{filename}</ListGroupItem>
            })
        } else {
            files = <p>There are no files in /grammars</p>
        }
        return (<ListGroup class='grammar-files' style={{'overflowY': 'scroll', 'height':'400px'}}>{files}</ListGroup>)
    }
}

module.exports = FileList;
