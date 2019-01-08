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
        this.handleMarkupSetAdd = this.handleMarkupSetAdd.bind(this);
        this.openAddTagModal = this.openAddTagModal.bind(this);
        this.closeAddTagModal = this.closeAddTagModal.bind(this);
        this.updateNewTagNameVal = this.updateNewTagNameVal.bind(this);
        this.handleExistingTagClick = this.handleExistingTagClick.bind(this);
        this.handleEnterKeypress = this.handleEnterKeypress.bind(this);
        this.toggleAttachNewTagToCurrentSymbol = this.toggleAttachNewTagToCurrentSymbol.bind(this);
        var presentMarkups = []
        if (props.currentNonterminal in props.nonterminals){
            presentMarkups = props.nonterminals[props.current_nonterminal].markup
        }
        this.state = {
            present: presentMarkups,
            newMarkupSets: Object.keys(this.props.total).length,
            showTagDefinitionModal: false,
            newTagName: '',
            nameOfTagsetBeingAddedTo: '',
            attachNewTagToCurrentSymbol: false
        }
    }

    toggleAttachNewTagToCurrentSymbol() {
        this.setState({attachNewTagToCurrentSymbol: !this.state.attachNewTagToCurrentSymbol})
    }

    handleMarkupSetAdd() {
        var newMarkupSetName = '/this is a new tagset/' + Object.keys(this.props.total).length
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

    openAddTagModal(nameOfTagsetBeingAddedTo) {
        this.setState({showTagDefinitionModal: true, nameOfTagsetBeingAddedTo: nameOfTagsetBeingAddedTo});
    }

    closeAddTagModal() {
        this.setState({
            showTagDefinitionModal: false,
            nameOfTagsetBeingAddedTo: "",
            newTagName: "",
            attachNewTagToCurrentSymbol: false
        });
    }

    addNewTag() {
        var object = {
            "markupSet": this.state.nameOfTagsetBeingAddedTo,
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
                        "nonterminal": this.props.currentNonterminal,
                        "markupSet": this.state.nameOfTagsetBeingAddedTo,
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

    handleMarkupClick(set, tag) {
        if (this.props.currentNonterminal != "") {
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
        if (e.key === 'Enter') {
            if (this.state.showTagDefinitionModal) {
                document.getElementById("submitNewTagButton").click();
            }
         }
    }

    componentDidMount(){
        document.addEventListener("keydown", this.handleEnterKeypress, false);
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

    render() {
        var output = []
        var total = Object.keys(this.props.total)
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
            output.push(<MarkupSet    currentNonterminal={this.props.currentNonterminal}
                                      updateFromServer={this.props.updateFromServer}
                                      markups={this.props.total}
                                      key={total[outer]}
                                      name={total[outer]}
                                      present_nt={present_nt}
                                      current_set={this.props.total[total[outer]]}
                                      updateSymbolFilterQuery={this.props.updateSymbolFilterQuery}
                                      currentNonterminal={this.props.currentNonterminal}
                                      openAddTagModal={this.openAddTagModal}/>)
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
                        <Modal.Title>Add Tag</Modal.Title>
                    </Modal.Header>
                    <div id='existingTagsList' style={{'overflowY': 'scroll', 'marginBottom': '15px', 'maxHeight': '40vh', 'padding': '15px 30px 0px 30px'}}>
                        {this.state.nameOfTagsetBeingAddedTo
                            ?
                            this.props.total[this.state.nameOfTagsetBeingAddedTo].map((name) => {return (<Button style={{'margin':'0', 'border':'0px', "width": "100%", "textAlign": "left", 'overflowY': 'scroll'}} title="Copy tag name" onClick={this.handleExistingTagClick.bind(this, name)} key={name}>{name}</Button>)})
                            :
                            ""
                        }
                    </div>
                    <div style={{'textAlign': 'center'}}>
                        <textarea id='newTagNameInput' type='text' title="Enter tag name." value={this.state.newTagName} onChange={this.updateNewTagNameVal} style={{'width': '90%', 'border': '0px solid #d7d7d7', 'height': '86px', 'marginTop': '10px', 'marginBottom': '15px', 'fontSize': '18px', 'padding': '8px 12px', backgroundColor: '#f2f2f2'}} autoFocus="true"/>
                        <br/>
                        {this.props.currentNonterminalName
                            ?
                            <label title="This determines whether the newly created tag will be attached to the current symbol upon being created." style={{"fontWeight": "normal", "position": "absolute", "left": "0px", "padding": "20px 0px 21px 31px"}}><input title="This determines whether the newly created tag will be attached to the current symbol upon being created." name="isGoing" type="checkbox" checked={this.state.attachNewTagToCurrentSymbol} onChange={this.toggleAttachNewTagToCurrentSymbol}/> Attach to current symbol</label>
                            :
                            ""
                        }
                        <Button id="submitNewTagButton" title={this.state.newTagName === "" ? "Create tag (disabled: no tag name)" : this.props.total[this.state.nameOfTagsetBeingAddedTo].includes(this.state.newTagName) ? "Create tag (disabled: tag already exists)" : "Create tag"} disabled={this.state.newTagName === "" || this.props.total[this.state.nameOfTagsetBeingAddedTo].includes(this.state.newTagName)} bsStyle="primary" bsSize="large" style={{'marginBottom': '25px'}} onClick={this.addNewTag}>Create Tag</Button>
                    </div>
                </Modal>
            </div>
        )
    }
}

module.exports = MarkupBar;
