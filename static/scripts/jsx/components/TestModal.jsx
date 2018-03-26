var React = require('react')
var ListGroupItem = require('react-bootstrap').ListGroupItem
var ListGroup = require('react-bootstrap').ListGroup
var Glyphicon = require('react-bootstrap').Glyphicon
var OverlayTrigger = require('react-bootstrap').OverlayTrigger
var Popover = require('react-bootstrap').Popover
var FormControl = require('react-bootstrap').FormControl
var FormGroup = require('react-bootstrap').FormGroup
var ControlLabel = require('react-bootstrap').ControlLabel
var Button = require('react-bootstrap').Button
var Modal = require('react-bootstrap').Modal
var Grid = require('react-bootstrap').Grid
var Row = require('react-bootstrap').Row
var Col = require('react-bootstrap').Col
var Alert = require('react-bootstrap').Alert
var ajax = require('jquery').ajax

class TestModal extends React.Component {

    constructor(props) {
        super(props);
        this.toggleTagSetStatus = this.toggleTagSetStatus.bind(this);
        this.updateTagFrequency = this.updateTagFrequency.bind(this);
        this.toggleTagStatus = this.toggleTagStatus.bind(this);
        this.getTagData = this.getTagData.bind(this);
        this.getTagColorFromStatus = this.getTagColorFromStatus.bind(this);
        this.cycleStatus = this.cycleStatus.bind(this);
        this.sendTaggedContentRequest = this.sendTaggedContentRequest.bind(this);
        this.state = {
            grammarFileNames: [],
            markups: {},
            tags: [],
            bundleName: '',
            bundlesList: [],
            numOutputs: 0,
            probablisticOutputText: '',
            probablisticOutputTags: [],
            probablisticOutputTreeExpression: '',
            probablisticOutputBracketedExpression: '',
            outputError: false
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.bundleName != ''){
            this.setState({
                bundleName: nextProps.bundleName,
                tags: this.getTagsFromBundle(nextProps.bundleName)
            })
            this.setMarkupsFromBundle(nextProps.bundleName)
        }else{
            this.setState({bundleName: nextProps.bundleName})
        }
    }

    setMarkupsFromBundle(bundleName) {
        var grammar = null;
        ajax({
            url: $SCRIPT_ROOT + '/api/load_bundle',
            type: "POST",
            contentType: "application/json",
            data: bundleName,
            cache: false,
            success: (data) => {
                grammar = JSON.parse(data);
                var tagsets = {}
                for (var i = 0; i < Object.keys(grammar.id_to_tag).length; i++){
                    var str = grammar.id_to_tag[i];
                    var tagset = str.substr(0,str.indexOf(':'));
                    var tag = str.substr(str.indexOf(':')+1);
                    if (tagsets[tagset] == undefined){
                        tagsets[tagset] = [tag];
                    }else{
                        tagsets[tagset] = tagsets[tagset].concat(tag);
                    }
                }
                this.setState({markups: tagsets})
            }
        })
    }

    getTagsFromBundle(bundleName) {
        var grammar = null;
        ajax({
            url: $SCRIPT_ROOT + '/api/load_bundle',
            type: "POST",
            contentType: "application/json",
            data: bundleName,
            async: false,
            cache: false,
            success: function(data){
                grammar = data;
            }
        })
        grammar = JSON.parse(grammar);
        var tags = []
        for (var i = 0; i < Object.keys(grammar.id_to_tag).length; i++){
            var str = grammar.id_to_tag[i];
            tags.push({
                name: str.substr(str.indexOf(':')+1),
                frequency: 0,
                status: 'enabled'
            });
        }
        return tags;
    }

    toggleTagSetStatus(tagset) {
        var tagsetTags = this.state.markups[tagset];
        var updated = this.state.tags.map(function (tagObj){
            for (var i = 0; i < tagsetTags.length; i++){
                if (tagsetTags[i] == tagObj.name){
                    return {
                        name: tagObj.name,
                        frequency: tagObj.frequency,
                        status: this.cycleStatus(tagObj.status)
                    }
                }
            }
            return tagObj;
        }.bind(this));
        this.setState({tags: updated});
        this.sendTaggedContentRequest(updated);
    }

    updateTagFrequency(e) {
        var updated = this.state.tags.map(tagObj => {
            if (tagObj.name == e.target.id){
                return {
                    name: tagObj.name,
                    frequency: e.target.value,
                    status: tagObj.status
                }
            }else{ return tagObj; }
        });
        this.setState({tags: updated});
        this.sendTaggedContentRequest(updated);
    }

    toggleTagStatus(tag) {
        // only toggle if the active element is a ListGroupItem.
        if (!document.activeElement.classList.contains("list-group-item")){
            return false;
        }
        var updated = this.state.tags.map(function (tagObj){
            if (tagObj.name == tag){
                return {
                    name: tagObj.name,
                    frequency: tagObj.frequency,
                    status: this.cycleStatus(tagObj.status)
                }
            }else{ return tagObj; }
        }.bind(this));
        this.setState({tags: updated});
        this.sendTaggedContentRequest(updated);
    }

    getTagData(tag, data) {
        return this.state.tags.find(tagObj => { return tagObj.name == tag })[data];
    }

    getTagColorFromStatus(currentStatus) {
        if (currentStatus == 'required'){
            return 'success'
        }
        else if (currentStatus == 'enabled'){
            return 'warning'
        }
        // assume currentStatus = 'disabled'
        return 'danger'
    }

    cycleStatus(currentStatus) {
        if (currentStatus == 'required'){
            return 'enabled'
        }
        else if (currentStatus == 'enabled'){
            return 'disabled'
        }
        // assume currentStatus = 'disabled'
        return 'required'
    }

    sendTaggedContentRequest(tags) {
        // Productionist requires tags to be formatted as `tagset:tag` strings.
        // However, this.state.tags is only a list of objects with no ref to their set.
        var forProductionist = tags.map(function (tagObj){
            var tagsets = Object.keys(this.state.markups);
            for (var i = 0; i < tagsets.length; i++){
                var tagsetTags = this.state.markups[tagsets[i]]
                var tagObjIsInTagsetTags = tagsetTags.filter(function(t){ return t == tagObj.name }).length == 1
                if (tagObjIsInTagsetTags){
                    return {
                        name: tagsets[i]+":"+tagObj.name,
                        frequency: tagObj.frequency,
                        status: tagObj.status
                    }
                }
            }
            return "[HeaderBar.sendTaggedContentRequest] A tag was sent without finding its tag set."
        }.bind(this));
        ajax({
            url: $SCRIPT_ROOT + '/api/grammar/tagged_content_request',
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                tags: forProductionist,
                bundleName: this.state.bundleName
            }),
            async: true,
            cache: false,
            success: (data) => {
              if (data != 'The content request cannot be satisfied by the exported content bundle.'){
                data = JSON.parse(data)
                this.setState({
                  probablisticOutputText: data.text,
                  probablisticOutputTags: data.tags,
                  probablisticOutputTreeExpression: data.treeExpression,
                  probablisticOutputBracketedExpression: data.bracketedExpression,
                  outputError: false,
                  numOutputs: this.state.numOutputs+1
                })
              } else {
                this.setState({outputError: true})
              }
            },
            error: function(err){
                alert('It seems like you have not built your Productionist grammar into memory yet. See console for more details.');
            }
        })
    }

    render() {
        const instructionsPopover = (
            <Popover id="instructions-popover" title="Instructions">
                This is the bundle name that you typed into the Build window.
            </Popover>
        )
        return (
            <Modal show={this.props.show} onHide={this.props.onHide}>
                <Modal.Header closeButton>
                    <Modal.Title>Generate Content</Modal.Title>
                </Modal.Header>
                <Grid fluid>
                  <Row className="show-grid">
                    <Col xs={6}>
                        <FormGroup>
                            <ControlLabel style={{display: 'block', marginLeft: '15px', marginTop: '10px'}}>Bundle Name</ControlLabel>
                            <FormControl type="text" value={this.state.bundleName} style={{width: '200px', display: 'inline', marginLeft: "15px"}} readOnly={true}/>
                        </FormGroup>
                    </Col>
                    <Col xs={6}>
                        <Button onClick={this.sendTaggedContentRequest.bind(this, this.state.tags)} bsStyle='warning' style={{padding: '7px 12px', marginTop: '35px'}}>Generate</Button>
                    </Col>
                  </Row>
                </Grid>
                <div id="tags">
                    <ListGroup id='tagsList' style={{marginBottom: '0px'}}>
                        {
                            Object.keys(this.state.markups).map(function (tagset){
                                return (
                                    <ListGroupItem bsSize="xsmall" key={tagset} style={{border: 'none'}}>
                                        <ListGroupItem  title={tagset} bsSize="xsmall" onClick={this.toggleTagSetStatus.bind(this, tagset)}>{tagset}
                                        </ListGroupItem>
                                        {
                                            this.state.markups[tagset].map(function (tag){
                                                return (
                                                    <div key={tag}>
                                                        <ListGroupItem title={tag} bsSize="xsmall" className='nohover' bsStyle={this.getTagColorFromStatus(this.getTagData(tag, "status"))} onClick={this.toggleTagStatus.bind(this, tag)}>
                                                            {tag}
                                                            <FormControl type="number" id={tag} value={this.getTagData(tag, "frequency")} onChange={this.updateTagFrequency} style={this.getTagData(tag, "status") == 'enabled' ? {display: 'inline', width: '100px', height: '20px', float: 'right'} : {display: 'none'}} />
                                                        </ListGroupItem>
                                                    </div>
                                                )
                                            }.bind(this))
                                        }
                                    </ListGroupItem>
                                )
                            }.bind(this))
                        }
                    </ListGroup>
                    <div id='outputs' style={{marginLeft: '15px', marginTop: '10px', marginRight: '15px', marginBottom: '10px'}}>
                        <Alert bsStyle="danger" style={setErrorWarningStyle(this.state.outputError)}>
                          Content request is unsatisfiable.
                        </Alert>
                        <div style={{marginBottom: '10px'}}>
                          Output #{this.state.numOutputs}
                        </div>
                        <div>
                            <div style={{display: 'flex', marginBottom: '5px'}}>
                              <p>Generated Text</p>
                            </div>
                            <Grid fluid>
                              <Row className="show-grid" style={{display: 'flex'}}>
                                <Col xs={6} className='feedback-bar feedback-bar-left'>{this.state.probablisticOutputText}</Col>
                                <Col xs={6} className='feedback-bar feedback-bar-right'>{this.state.probablisticOutputTags.map( (tagset) => <div>{tagset}</div> )}</Col>
                              </Row>
                            </Grid>
                            <div style={{marginTop: '10px', marginBottom: '10px'}}>Tree Expression</div>
                            <Grid fluid>
                              <Row className="show-grid">
                                <Col xs={12} style={{'white-space': 'pre-wrap'}} className='feedback-bar'>{this.state.probablisticOutputTreeExpression}</Col>
                              </Row>
                            </Grid>
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }
}

function setErrorWarningStyle(outputError){
  if (outputError == true){
    return {display: 'block'}
  }else{
    return {display: 'none'}
  }
}

module.exports = TestModal;
