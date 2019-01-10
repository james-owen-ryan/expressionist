var React = require('react')
var ListGroupItem = require('react-bootstrap').ListGroupItem
var ListGroup = require('react-bootstrap').ListGroup
var Glyphicon = require('react-bootstrap').Glyphicon
var OverlayTrigger = require('react-bootstrap').OverlayTrigger
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
        this.toggleTagsetStatus = this.toggleTagsetStatus.bind(this);
        this.updateTagFrequency = this.updateTagFrequency.bind(this);
        this.toggleTagStatus = this.toggleTagStatus.bind(this);
        this.getTagData = this.getTagData.bind(this);
        this.getTagColorFromStatus = this.getTagColorFromStatus.bind(this);
        this.cycleStatus = this.cycleStatus.bind(this);
        this.sendTaggedContentRequest = this.sendTaggedContentRequest.bind(this);
        this.toggleTagsetExpandOrCollapse = this.toggleTagsetExpandOrCollapse.bind(this);
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
            outputError: false,
            tagsetIsExpanded: {}
        };
    }

    toggleTagsetExpandOrCollapse(tagset) {
        var tagsetIsExpanded = this.state.tagsetIsExpanded;
        tagsetIsExpanded[tagset] = !tagsetIsExpanded[tagset];
        this.setState({tagsetIsExpanded: tagsetIsExpanded})
    }

    toggleTagsetStatus(tagset) {
        var that = this;
        var updated = this.state.tags.map(function (tagObj){
            if (tagset == tagObj.tagset){
                return {
                    name: tagObj.name,
                    frequency: tagObj.frequency,
                    status: that.cycleStatus(tagObj.status),
                    tagset: tagObj.tagset
                }
            }
            return tagObj
        });
        this.setState({tags: updated});
        this.sendTaggedContentRequest(updated);
    }

    updateTagFrequency(e) {
        var updated = this.state.tags.map(function(tagObj){
            if (e.target.id == tagObj.tagset+':'+tagObj.name){
                return {
                    name: tagObj.name,
                    frequency: e.target.value,
                    status: tagObj.status,
                    tagset: tagObj.tagset
                }
            }
            return tagObj
        })
        this.setState({tags: updated});
        if (!isNaN(e.target.value) && e.target.value != ''){ 
            this.sendTaggedContentRequest(updated);
        }
    }

    toggleTagStatus(tagset, tag) {
        var that = this;
        var updated = this.state.tags.map(function (tagObj){
            if (tagObj.name == tag && tagObj.tagset == tagset){
                return {
                    name: tagObj.name,
                    frequency: tagObj.frequency,
                    status: that.cycleStatus(tagObj.status),
                    tagset: tagObj.tagset
                }
            }
            return tagObj; 
        })
        this.setState({tags: updated});
        this.sendTaggedContentRequest(updated);
    }

    getTagData(tagset, tag, data) {
        return this.state.tags.find(tagObj => { return tagObj.name == tag && tagObj.tagset == tagset })[data];
    }

    getTagColorFromStatus(currentStatus) {
        if (currentStatus == 'required'){
            return 'success'
        }
        else if (currentStatus == 'enabled'){
            return null
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
        var forProductionist = tags.map(function (tagObj){
            return {
                name: tagObj.tagset + ':' + tagObj.name,
                frequency: tagObj.frequency,
                status: tagObj.status
            }
        })
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
                var sortedTags = data.tags.sort();
                for (var i = 0; i < sortedTags.length; i++) {
                    sortedTags[i]  = "* " + sortedTags[i];
                }
                this.setState({
                  probablisticOutputText: data.text,
                  probablisticOutputTags: sortedTags,
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
                alert('There was an error. Consult your Python console for more details.');
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
                name: str.split(':')[1],
                frequency: 0,
                status: 'enabled',
                tagset: str.split(':')[0]
            });
        }
        return tags;
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
                    var tagset = str.substr(0, str.indexOf(':'));
                    var tag = str.substr(str.indexOf(':')+1);
                    if (tagsets[tagset] == undefined){
                        tagsets[tagset] = [tag];
                    }
                    else{
                        tagsets[tagset] = tagsets[tagset].concat(tag);
                    }
                }
                this.setState({markups: tagsets})
            }
        })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.bundleName !== ''){
            var tagObjects = this.getTagsFromBundle(nextProps.bundleName);
            var tagsetIsExpanded = {};
            for (var i = 0; i < tagObjects.length; i++) {
                if (!(tagObjects[i].tagset in tagsetIsExpanded)) {
                    tagsetIsExpanded[tagObjects[i].tagset] = false;
                }
            }
            this.setState({
                bundleName: nextProps.bundleName,
                tags: tagObjects,
                tagsetIsExpanded: tagsetIsExpanded
            });
            this.setMarkupsFromBundle(nextProps.bundleName);
        }
        else {
            // This happens when the tool starts up, since this modal is actually constructed at that time
            this.setState({bundleName: nextProps.bundleName})
        }
    }

    render() {
        return (
            <Modal show={this.props.show} onHide={this.props.onHide} dialogClassName="test-productionist-module-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Test Productionist module...</Modal.Title>
                </Modal.Header>
                <Alert bsStyle="danger" style={setErrorWarningStyle(this.state.outputError)}>
                  Content request is unsatisfiable.
                </Alert>
                <div>
                    <div style={{display: 'flex', marginBottom: '5px'}}>
                      <p style={{width: "100%", textAlign: "center"}}>Generated Content Package</p>
                    </div>
                    <Grid fluid>
                      <Row className="show-grid" style={{display: 'flex'}}>
                        <Col xs={6} className='test-modal-feedback-bar test-modal-feedback-bar-left'>{this.state.probablisticOutputText}</Col>
                        <Col xs={6} className='test-modal-feedback-bar test-modal-feedback-bar-right'>{this.state.probablisticOutputTags.map( (tagset) => <div>{tagset}</div> )}</Col>
                      </Row>
                    </Grid>
                    <div style={{marginTop: '10px', marginBottom: '10px', width: "100%", textAlign: "center"}}>Tree Expression</div>
                    <Grid fluid>
                      <Row className="show-grid">
                        <Col xs={12} style={{'whiteSpace': 'pre-wrap', 'marginBottom': '20px'}} className='test-modal-feedback-bar'>{this.state.probablisticOutputTreeExpression}</Col>
                      </Row>
                    </Grid>
                </div>
                <Button onClick={this.sendTaggedContentRequest.bind(this, this.state.tags)} title="Submit content request" style={{padding: '7px 12px', width: "15%", left: "42.5%", height: "50px", fontSize: "25px", position: "relative"}}><Glyphicon glyph="play"/></Button>
                <div id="tags">
                    <p style={{marginTop: '10px', marginBottom: '10px', width: "100%", textAlign: "center"}}>Content Request</p>
                    <ListGroup id='tagsList' style={{marginBottom: '0px'}}>
                        {
                            Object.keys(this.state.markups).map(function (tagset){
                                return (
                                    <ListGroupItem bsSize="xsmall" key={tagset} style={{border: '0px'}}>
                                        <ListGroupItem title="Toggle status in content request for all tags in this tagset" bsSize="xsmall" onClick={this.toggleTagsetStatus.bind(this, tagset)} style={{border: '0px', width: "calc(100% - 38px)"}}>{tagset}</ListGroupItem>
                                        <Button title={this.state.tagsetIsExpanded[tagset] ? "Collapse tagset" : "Expand tagset"} onClick={this.toggleTagsetExpandOrCollapse.bind(this, tagset)}><Glyphicon glyph={this.state.tagsetIsExpanded[tagset] ? "menu-up" : "menu-down"}/></Button>
                                        {this.state.tagsetIsExpanded[tagset]
                                            ?
                                            this.state.markups[tagset].map(function (tag){
                                                return (
                                                    <div key={tagset + ":" + tag}>
                                                        <ListGroupItem style={{border: '0px', padding: "0px"}}>
                                                            <Button title={"Toggle tag status in content request (currently: " + this.getTagData(tagset, tag, "status") + ")"} bsSize="xsmall" bsStyle={this.getTagColorFromStatus(this.getTagData(tagset, tag, "status"))} onClick={this.toggleTagStatus.bind(this, tagset, tag)} style={{width: "calc(100% - 50px)", padding: "0px 5px 0px 5px", marginBotton: "0px"}}>{tag}</Button>
                                                            <FormControl title="Modify tag utility in content request" type="number" id={tagset+':'+tag} value={this.getTagData(tagset, tag, "frequency")} onChange={this.updateTagFrequency} style={this.getTagData(tagset, tag, "status") == 'enabled' ? {display: 'inline', width: '50px', height: '30px', float: 'right', border: "0px", "padding": "5px"} : {display: 'none'}} />
                                                        </ListGroupItem>
                                                    </div>
                                                )
                                            }.bind(this))
                                            :
                                            ""
                                        }
                                    </ListGroupItem>
                                )
                            }.bind(this))
                        }
                    </ListGroup>
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
