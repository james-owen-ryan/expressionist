var React = require('react')
var ListGroupItem = require('react-bootstrap').ListGroupItem;
var ListGroup = require('react-bootstrap').ListGroup;
var Glyphicon = require('react-bootstrap').Glyphicon;
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Popover = require('react-bootstrap').Popover;
var FormControl = require('react-bootstrap').FormControl;
var FormGroup = require('react-bootstrap').FormGroup;
var ControlLabel = require('react-bootstrap').ControlLabel;
var Button = require('react-bootstrap').Button;
var Modal = require('react-bootstrap').Modal;
var ajax = require('jquery').ajax;

var GenerateModal = React.createClass({
    getInitialState() {
        return {
            show: this.props.show,
            onHide: this.props.onHide,
            grammarFileNames: [],
            tags: this.processMarkups(this.props.markups),
            bundleName: 'example',
            bundleNameMatches: true
        };
    },

    processMarkups: function(markups){
        var flattened = Object.values(markups).reduce((a, b) => { return a.concat(b) })
        return flattened.map(function (tag){
            return {
                name: tag,
                frequency: 1, // Assume the user wants all tags weighted equally.
                status: 'required'
            }
        })
    },

    componentWillReceiveProps: function (nextProps){
        this.setState(
            {
                tags: this.processMarkups(nextProps.markups),
                show: nextProps.show
            }
        )
    },

    toggleTagSetStatus: function(tagset){
        var tagsetTags = this.props.markups[tagset];
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
    },

    updateTagFrequency: function(e){
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
    },

    toggleTagStatus: function(tag){
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
    },

    getTagData: function(tag, data){
        return this.state.tags.find(tagObj => { return tagObj.name == tag })[data];
    },

    getTagColorFromStatus: function(currentStatus){
        if (currentStatus == 'required'){
            return 'success'
        }
        else if (currentStatus == 'enabled'){
            return 'warning'
        }
        // assume currentStatus = 'disabled'
        return 'danger'
    },

    cycleStatus: function(currentStatus){
        if (currentStatus == 'required'){
            return 'enabled'
        }
        else if (currentStatus == 'enabled'){
            return 'disabled'
        }
        // assume currentStatus = 'disabled'
        return 'required'
    },

    sendTaggedContentRequest: function(){
        // Productionist requires tags to be formatted as `tagset:tag` strings.
        // However, this.state.tags is only a list of objects with no ref to their set.
        var forProductionist = this.state.tags.map(function (tagObj){
            var tagsets = Object.keys(this.props.markups);
            for (var i = 0; i < tagsets.length; i++){
                var tagsetTags = this.props.markups[tagsets[i]]
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
            success: function(data){
                alert(data);
            }
        })
    },

    updateBundleName: function(e){
        ajax({
            url: $SCRIPT_ROOT + '/api/load_bundles',
            type: "GET",
            contentType: "application/json",
            async: false,
            cache: false,
            success: function(data){
                var match = false;
                for (var i = 0; i < data.results.length; i++){
                    var prefix = data.results[i].substr(0, data.results[i].indexOf('.'));
                    console.dir(prefix);
                    if (prefix == e.target.value){
                        match = true;
                    }
                }
                this.setState({
                    bundleName: e.target.value,
                    bundleNameMatches: match
                })
            }.bind(this)
        });
    },

    render: function(){
        const instructionsPopover = (
            <Popover id="instructions-popover" title="Instructions">
                Enter a the bundle name of an exported file (the prefix to the three generated files). Select which tags to search for. Adjust the frequency at which these tags are selected.
            </Popover>
        )
        return (
            <Modal show={this.state.show} onHide={this.state.onHide}>
                <Modal.Header closeButton>
                    <Modal.Title>Generate Content &emsp; <OverlayTrigger overlay={instructionsPopover}><Glyphicon glyph="info-sign" /></OverlayTrigger></Modal.Title>
                </Modal.Header>
                <div id="tags">
                    <FormGroup>
                        &emsp;&ensp;<ControlLabel style={this.state.bundleNameMatches ? {marginTop: '10px', color: "#3c763d"} : {marginTop: '10px', color: "#a94442"} }>Bundle Name</ControlLabel>
                        <FormControl    type="text"
                                        value={this.state.bundleName}
                                        onChange={this.updateBundleName}
                                        style={{width: '200px', display: 'block', marginLeft: "15px"}}/>
                    </FormGroup>
                    <ListGroup id='tagsList' style={{marginBottom: '0px'}}>
                        {
                            Object.keys(this.props.markups).map(function (tagset){
                                return (
                                    <ListGroupItem bsSize="xsmall" key={tagset} style={{border: 'none'}}>
                                        <ListGroupItem  title={tagset}
                                                        bsSize="xsmall"
                                                        onClick={this.toggleTagSetStatus.bind(this, tagset)}>
                                                        {tagset}
                                        </ListGroupItem>
                                        {
                                            this.props.markups[tagset].map(function (tag){
                                                return (
                                                    <div>
                                                        <ListGroupItem  title={tag}
                                                                        bsSize="xsmall"
                                                                        bsStyle={this.getTagColorFromStatus(this.getTagData(tag, "status"))}
                                                                        onClick={this.toggleTagStatus.bind(this, tag)}>
                                                                        {tag}
                                                                        <FormControl    type="number"
                                                                                        id={tag}
                                                                                        value={this.getTagData(tag, "frequency")}
                                                                                        onChange={this.updateTagFrequency}
                                                                                        style={this.getTagData(tag, "status") == 'enabled' ? {display: 'inline'} : {display: 'none'}}
                                                                        />
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
                    &emsp;&ensp;<Button onClick={this.sendTaggedContentRequest} bsStyle='primary' style={{marginBottom: '10px'}}>Generate!</Button>
                </div>
            </Modal>
        );
    }
})

module.exports = GenerateModal