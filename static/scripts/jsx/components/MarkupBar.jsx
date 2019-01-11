var MarkupSet = require('./MarkupSet.jsx')
var React = require('react')
var ButtonGroup = require('react-bootstrap').ButtonGroup
var Button = require('react-bootstrap').Button
var Glyphicon = require('react-bootstrap').Glyphicon
var ajax = require('jquery').ajax
var Modal = require('react-bootstrap').Modal

class MarkupBar extends React.Component {

    constructor(props) {
        super(props);
        this.addNewTag = this.addNewTag.bind(this);
        this.renameTag = this.renameTag.bind(this);
        this.handleMarkupSetAdd = this.handleMarkupSetAdd.bind(this);
        this.openAddTagModal = this.openAddTagModal.bind(this);
        this.closeAddTagModal = this.closeAddTagModal.bind(this);
        this.updateNewTagNameVal = this.updateNewTagNameVal.bind(this);
        this.handleExistingTagClick = this.handleExistingTagClick.bind(this);
        this.handleEnterKeypress = this.handleEnterKeypress.bind(this);
        this.toggleAttachNewTagToCurrentSymbol = this.toggleAttachNewTagToCurrentSymbol.bind(this);
        var presentMarkups = []
        if (props.currentSymbolName in props.nonterminals){
            presentMarkups = props.nonterminals[props.current_nonterminal].markup
        }
        this.state = {
            present: presentMarkups,
            newMarkupSets: Object.keys(this.props.tagsets).length,
            showTagDefinitionModal: false,
            newTagName: '',
            nameOfTagsetBeingModified: '',
            attachNewTagToCurrentSymbol: false
        }
    }

    toggleAttachNewTagToCurrentSymbol() {
        this.setState({attachNewTagToCurrentSymbol: !this.state.attachNewTagToCurrentSymbol})
    }

    handleMarkupSetAdd() {
        var newMarkupSetName = '/this is a new tagset/' + Object.keys(this.props.tagsets).length
        var object = {"markupSet": newMarkupSetName}
        ajax({
            url: $SCRIPT_ROOT + '/api/markup/addtagset',
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(object),
            success: () => {
                this.props.updateFromServer()
            },
            cache: false
        })
    }

    openAddTagModal(nameOfTagsetBeingModified, tagBeingRenamed) {
        this.setState({
            showTagDefinitionModal: true,
            nameOfTagsetBeingModified: nameOfTagsetBeingModified,
            tagBeingRenamed: tagBeingRenamed
        });
        if (tagBeingRenamed !== null) {
            this.setState({newTagName: tagBeingRenamed});
        }
    }

    closeAddTagModal() {
        this.setState({
            showTagDefinitionModal: false,
            nameOfTagsetBeingModified: "",
            newTagName: "",
            attachNewTagToCurrentSymbol: false
        });
    }

    addNewTag() {
        var object = {
            "markupSet": this.state.nameOfTagsetBeingModified,
            "tag": this.state.newTagName
        }
        ajax({
            url: $SCRIPT_ROOT + '/api/markup/addtag',
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(object),
            success: () => {
                this.props.updateFromServer();
                if (this.state.attachNewTagToCurrentSymbol) {
                    var newObject = {
                        "nonterminal": this.props.currentSymbolName,
                        "markupSet": this.state.nameOfTagsetBeingModified,
                        "tag": this.state.newTagName
                    }
                    ajax({
                        url: $SCRIPT_ROOT + '/api/markup/toggle',
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify(newObject),
                        success: () => this.props.updateFromServer(),
                        cache: false
                    })
                }
            },
            cache: false
        })
    }

    renameTag() {
        var newTagName = this.state.newTagName;
        var object = {
            "markupset": this.state.nameOfTagsetBeingModified,
            "oldtag": this.state.tagBeingRenamed,
            "newtag": this.state.newTagName
        }
        ajax({
            url: $SCRIPT_ROOT +'/api/markup/renametag',
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(object),
            success: () => this.props.updateFromServer(),
            cache: false
        })
    }

    handleMarkupClick(set, tag) {
        if (this.props.currentSymbolName != "") {
            var object = {

            }
            ajax({
                url: $SCRIPT_ROOT + '/api/markup/toggle',
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(object),
                success: () => this.props.updateFromServer(),
                cache: false
            })
        }
    }

    updateNewTagNameVal(e) {
        if (e.target.value.indexOf('\n') === -1) {
            this.setState({newTagName: e.target.value})
        }
    }

    handleExistingTagClick(existingTagName) {
        this.setState({newTagName: existingTagName});
    }

    handleEnterKeypress(e) {
        if (e.key === 'Enter' && !(e.ctrlKey || e.metaKey)) {
            if (this.state.showTagDefinitionModal) {
                document.getElementById("submitTagButton").click();
            }
         }
    }

    componentDidMount(){
        document.addEventListener("keydown", this.handleEnterKeypress, false);
    }

    componentWillReceiveProps(props){
        var presentMarkups = []
        if (props.currentSymbolName in props.nonterminals){
            presentMarkups = props.nonterminals[props.currentSymbolName].markup
        }
        this.setState({
            present: presentMarkups
        });
    }

    render() {
        var output = []
        var total = Object.keys(this.props.tagsets)
        for (var outer = 0; total.length > outer ; outer++) {
            var present_nt = []
            if (this.state.present[total[outer]])
            {
              present_nt = this.state.present[total[outer]]
            }
            else
            {
              present_nt = []
            }
            output.push(<MarkupSet    currentNonterminal={this.props.currentSymbolName}
                                      updateFromServer={this.props.updateFromServer}
                                      markups={this.props.tagsets}
                                      key={total[outer]}
                                      name={total[outer]}
                                      present_nt={present_nt}
                                      current_set={this.props.tagsets[total[outer]]}
                                      updateSymbolFilterQuery={this.props.updateSymbolFilterQuery}
                                      currentNonterminal={this.props.currentSymbolName}
                                      openAddTagModal={this.openAddTagModal}
                                      currentRule={this.props.currentRule}
            />)
            var submitTagButtonHoverText = this.state.tagBeingRenamed ? "Rename tag" : "Create tag";
            if (this.state.newTagName === "") {
                submitTagButtonHoverText += " (disabled: no tag name)";
            }
            else if (this.props.tagsets[this.state.nameOfTagsetBeingModified].includes(this.state.newTagName)) {
                submitTagButtonHoverText += " (disabled: tag already exists)";
            }
        }
        return(
            <div>
                <ButtonGroup className="btn-test">
                    <Button className="grp_button" onClick={this.handleMarkupSetAdd} key="addnew" title="Add new tagset"  style={{height: '38px'}}>
                        <Glyphicon glyph="plus"/>
                    </Button>
                {output}
                </ButtonGroup>
                <Modal show={this.state.showTagDefinitionModal} onHide={this.closeAddTagModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Tag Definition</Modal.Title>
                    </Modal.Header>
                    <div id='existingTagsList' style={{'overflowY': 'scroll', 'marginBottom': '15px', 'maxHeight': '40vh', 'padding': '15px 30px 0px 30px'}}>
                        {this.state.nameOfTagsetBeingModified
                            ?
                            this.props.tagsets[this.state.nameOfTagsetBeingModified].map((name) => {return (<Button style={{'margin':'0', 'border':'0px', "width": "100%", "textAlign": "left", 'overflowY': 'scroll'}} title="Copy tag name" onClick={this.handleExistingTagClick.bind(this, name)} key={name}>{name}</Button>)})
                            :
                            ""
                        }
                    </div>
                    <div style={{'textAlign': 'center'}}>
                        <textarea id='newTagNameInput' type='text' title="Enter tag name." value={this.state.newTagName} onChange={this.updateNewTagNameVal} style={{'width': '90%', 'border': '0px solid #d7d7d7', 'height': '86px', 'marginTop': '10px', 'marginBottom': '15px', 'fontSize': '18px', 'padding': '8px 12px', 'backgroundColor': '#f2f2f2'}} autoFocus="true"/>
                        <br/>
                        {(this.props.currentSymbolName && (!this.state.tagBeingRenamed))
                            ?
                            <label title="This determines whether the newly created tag will be attached to the current symbol upon being created." style={{"fontWeight": "normal", "position": "absolute", "left": "0px", "padding": "20px 0px 21px 31px"}}><input title="This determines whether the newly created tag will be attached to the current symbol upon being created." name="isGoing" type="checkbox" checked={this.state.attachNewTagToCurrentSymbol} onChange={this.toggleAttachNewTagToCurrentSymbol}/> Attach to current symbol</label>
                            :
                            ""
                        }
                        <Button id="submitTagButton" title={submitTagButtonHoverText} disabled={this.state.newTagName === "" || this.props.tagsets[this.state.nameOfTagsetBeingModified].includes(this.state.newTagName)} bsStyle="primary" bsSize="large" style={{'marginBottom': '25px'}} onClick={this.state.tagBeingRenamed ? this.renameTag : this.addNewTag}>{this.state.tagBeingRenamed ? "Rename tag" : "Create Tag"}</Button>
                    </div>
                </Modal>
            </div>
        )
    }
}

module.exports = MarkupBar;
