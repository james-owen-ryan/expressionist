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

var TestModal = React.createClass({
    getInitialState() {
        return {
            grammarFileNames: [],
            markups: this.getMarkupsFromBundle('example'),
            tags: this.getTagsFromBundle('example'),
            bundleName: 'example',
            bundlesList: []
        };
    },

    componentWillMount: function(){
        console.log('compmounted!')
        ajax({
            url: $SCRIPT_ROOT + '/api/load_bundles',
            type: "GET",
            async: false,
            cache: false,
            success: function(data){
                this.setState({bundlesList: data.results})
            }.bind(this)
        })
    },

    getMarkupsFromBundle: function(bundleName){
        var grammar = null;
        ajax({
            url: $SCRIPT_ROOT + '/api/load_bundle',
            type: "POST",
            contentType: "application/json",
            data: bundleName,
            async: false,
            cache: false,
            success: function(data){
                grammar = JSON.parse(data);
            }
        })
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
        return tagsets
    },

    getTagsFromBundle: function(bundleName){
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
                frequency: 1,
                status: 'required'
            });
        }
        return tags;
    },

    toggleTagSetStatus: function(tagset){
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
            success: function(data){
                alert(data);
            },
            error: function(err){
                alert('It seems like you have not built your Productionist grammar into memory yet. See console for more details.');
            }
        })
    },

    setExportsBundleNames: function(){
        ajax({
            url: $SCRIPT_ROOT + '/api/load_bundles',
            type: "GET",
            contentType: "application/json",
            async: false,
            cache: false,
            success: function(files){
                var prefixes = files.results.map( f => f.substr(0, f.indexOf('.')) );
                var uniq = prefixes.filter( (p, i) => {
                    for (var j = 0; j < prefixes.length; j++){
                        if (i == j){
                            break; // Don't compare yourself to yourself!
                        }
                        if (prefixes[j] == p){
                            // This filename already exists somewhere else in the array.
                            // Get rid of this file!
                            return false
                        }
                    }
                    return true; // The filename is unique.
                });
                this.setState({exportsBundleNames: uniq})
            }.bind(this)
        });
    },

    render: function(){
        const instructionsPopover = (
            <Popover id="instructions-popover" title="Instructions">
                Enter a the bundle name of an exported file (the prefix to the three generated files). Select which tags to search for. Adjust the frequency at which these tags are selected.
            </Popover>
        )
        const searchExports = (
            <Popover id="search-exports" title="Search for Bundle Name">
                <ListGroup id='bundlesList' style={{marginBottom: '0px', height: '400px', overflow: 'scroll'}}>
                {
                    this.state.bundlesList
                        .filter(b => {
                            return b.includes('grammar')
                        })
                        .map( bundleName => {
                            var noExtension = bundleName.substr(0,bundleName.indexOf('.'))
                            return <ListGroupItem  title={noExtension}
                                            bsSize="xsmall"
                                            onClick={this.setState.bind(this, {bundleName: noExtension})}>
                                            {noExtension}
                            </ListGroupItem>
                        })
                }
                </ListGroup>
            </Popover>
        )

        return (
            <Modal show={this.props.show} onHide={this.props.onHide}>
                <Modal.Header closeButton>
                    <Modal.Title>Generate Content &emsp; <OverlayTrigger overlay={instructionsPopover}><Glyphicon glyph="info-sign" /></OverlayTrigger></Modal.Title>
                </Modal.Header>
                <FormGroup>
                    <ControlLabel style={{display: 'block', marginLeft: '15px', marginTop: '10px'}}>Bundle Name</ControlLabel>
                    <FormControl    type="text"
                                    value={this.state.bundleName}
                                    onChange={this.updateBundleName}
                                    style={{width: '200px', display: 'inline', marginLeft: "15px"}}/>
                    <OverlayTrigger trigger='focus' placement='right' overlay={searchExports}><Glyphicon glyph="zoom-in" tabIndex='-1' style={{marginLeft: '-30px'}} /></OverlayTrigger>
                </FormGroup>
                <div id="tags">
                    <ListGroup id='tagsList' style={{marginBottom: '0px'}}>
                        {
                            Object.keys(this.state.markups).map(function (tagset){
                                return (
                                    <ListGroupItem bsSize="xsmall" key={tagset} style={{border: 'none'}}>
                                        <ListGroupItem  title={tagset}
                                                        bsSize="xsmall"
                                                        onClick={this.toggleTagSetStatus.bind(this, tagset)}>
                                                        {tagset}
                                        </ListGroupItem>
                                        {
                                            this.state.markups[tagset].map(function (tag){
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
                    &emsp;&ensp;<Button onClick={this.sendTaggedContentRequest} bsStyle='primary' style={{marginBottom: '10px', marginTop: '10px'}}>Generate!</Button>
                </div>
            </Modal>
        );
    }
})

module.exports = TestModal