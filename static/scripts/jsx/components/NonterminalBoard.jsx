var React = require('react')
var Button = require('react-bootstrap').Button
var Glyphicon = require('react-bootstrap').Glyphicon
var Panel = require('react-bootstrap').Panel
var ListGroupItem = require('react-bootstrap').ListGroupItem
var ListGroup = require('react-bootstrap').ListGroup
var ajax = require('jquery').ajax

class NonterminalBoard extends React.Component {

    constructor(props) {
        super(props);
        this.handleClickerThing = this.handleClickerThing.bind(this);
        this.handleNonterminalRuleClickThrough = this.handleNonterminalRuleClickThrough.bind(this);
        this.handleSetDeep = this.handleSetDeep.bind(this);
        this.handleNonterminalRename = this.handleNonterminalRename.bind(this);
        this.handleNonterminalDelete = this.handleNonterminalDelete.bind(this);
        this.handleExpand = this.handleExpand.bind(this);
    }

    handleClickerThing(object){
        var idx = object.index
        var symbol = object.symbol
        return <ListGroupItem
            key={object.index}
            style={{"border": "0px"}}
            onClick={this.handleNonterminalRuleClickThrough.bind(this, symbol, idx)}>{object['expansion']}</ListGroupItem>
    }

    handleNonterminalRuleClickThrough(tag, index) {
        this.props.updateCurrentNonterminal(tag)
        this.props.updateCurrentRule(index)
        this.props.updateMarkupFeedback([])
        this.props.updateExpansionFeedback("")
        this.props.updateHistory(tag, index)
    }

    handleSetDeep(nonterminal) {
        if (this.props.name != "") {
            var object = {
                "nonterminal": this.props.name,
            }
            ajax({
                url: $SCRIPT_ROOT + '/api/nonterminal/deep',
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(object),
                success: () => this.props.updateFromServer(),
                cache: false
            })
        }
    }

    handleNonterminalRename(nonterminal) {
        var newsymbol = window.prompt("Enter a new name for this nonterminal symbol.");
        if (this.props.name !== "" && newsymbol) {
            var object = {
                "old": this.props.name,
                "new": newsymbol
            }
            ajax({
                url: $SCRIPT_ROOT + '/api/nonterminal/rename',
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(object),
                success: () => {
                    this.props.updateFromServer();
                    this.props.updateCurrentNonterminal(newsymbol);
                    this.props.updateHistory(newsymbol, this.props.currentRule);
                },
                cache: false
            })
        }
    }

    handleNonterminalDelete() {
        var confirmresponse = window.confirm("Are you sure you'd like to delete this nonterminal symbol? This will also delete any production rules that reference it.");
        if (this.props.name != "" && confirmresponse == true) {
            var object = {"nonterminal": this.props.name};
            ajax({
                url: $SCRIPT_ROOT + '/api/nonterminal/delete',
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(object),
                succes: () => {
                    this.props.updateCurrentNonterminal("");
                    this.props.updateCurrentRule(-1);
                    this.props.updateFromServer();
                    this.props.updateHistory("", -1);
                },
                cache: false
            })
        }
    }

    handleExpand() {
        ajax({
            url: $SCRIPT_ROOT + '/api/nonterminal/expand',
            type: 'POST',
            contentType: "application/json",
            data: JSON.stringify({"nonterminal": this.props.name}),
            dataType: 'json',
            async: true,
            cache: false,
            success: (data) => {
                this.props.updateMarkupFeedback(data.markup);
                this.props.updateExpansionFeedback(data.derivation)
            },
            error: (xhr, status, err) => {
                console.error(this.props.url, status, err.toString());
            }
        });
    }

    render() {
        var expand
        var rules
        var markup
        var glyph_nt
        if (this.props.nonterminal) {
            var name = this.props.name
            var deep_str = ""
            if (this.props.nonterminal && this.props.nonterminal.deep) {
                deep_str = "Toggle top-level status"
                glyph_nt = <Glyphicon glyph="star"/>
            }
            else {
                deep_str = "Toggle top-level status"
                glyph_nt = <Glyphicon glyph="star-empty"/>
            }
            if( this.props.referents != []) {
                var referents = this.props.referents.map(this.handleClickerThing)
            }
        }

        return (
            <div>
                <div style={{"width": "70%", "margin": "0 auto", "float": "center"}}>
                    <h1>
                    <span>{name}</span>
                    <br></br>
                    <Button bsStyle={this.props.nonterminal.deep ? "success" : "default" } onClick={this.handleSetDeep} title={deep_str}>{glyph_nt}</Button>
                    <Button onClick={this.handleExpand} title="Test"><Glyphicon glyph="play"/></Button>
                    <Button onClick={this.handleNonterminalRename} title="Rename"><Glyphicon glyph="pencil"/></Button>
                    <Button onClick={this.handleNonterminalDelete} title="Delete"><Glyphicon glyph="trash"/></Button>
                    </h1>
                </div>

                <div style={{"width": "70%", "margin": "0 auto"}}>
                    <Panel>
                        <ListGroup style={{"maxHeight": "320px", "overflowY": "auto"}}>
                            {referents}
                        </ListGroup>
                    </Panel>
                </div>

            </div>
        )

    }
}

module.exports = NonterminalBoard;
