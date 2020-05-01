var React = require('react')
var ListGroupItem = require('react-bootstrap').ListGroupItem
var ListGroup = require('react-bootstrap').ListGroup
var ajax = require('jquery').ajax
var uniq = require('uniq')

class FileList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            grammarFileNames: [],
            height: this.props.height || '400px',
        };
    }

    componentWillReceiveProps() {
        if (this.props.directory == 'grammars'){
            var endpoint = '/api/grammar/load_dir'
        } else {
            var endpoint = '/api/load_bundles'
        }
        ajax({
            url: $SCRIPT_ROOT + endpoint,
            type: "GET",
            cache: false,
            success: (data) => {
                data.results.sort();
                this.setState({'grammarFileNames': data.results})
            }
        })
    }

    render() {
        var files = null;
        if (this.state.grammarFileNames.length > 0) {
            files = this.state.grammarFileNames.map( (filename) => {
                if (filename == this.props.highlightedFile){
                    return <ListGroupItem style={{border: "0px"}} onClick={ () => { this.props.onFileClick(filename) } } key={filename} bsStyle="success">{filename}</ListGroupItem>
                }
                return <ListGroupItem style={{border: "0px"}} onClick={ () => { this.props.onFileClick(filename) } } key={filename}>{filename}</ListGroupItem>
            })
        } else {
            files = <p></p>
        }
        return (<ListGroup className='grammar-files' style={{'overflowY': 'scroll', 'height': this.state.height}}>{files}</ListGroup>)
    }
}

module.exports = FileList;
