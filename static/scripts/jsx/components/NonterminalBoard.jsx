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
                async: false,
                cache: false
            })
            this.props.updateFromServer()
        }
    }

    handleNonterminalRename(nonterminal) {
        var newsymbol = window.prompt("Please enter new Symbol Name")
        if (this.props.name != "" && newsymbol != "") {
            var object = {
                "old": this.props.name,
                "new": newsymbol
            }
            ajax({
                url: $SCRIPT_ROOT + '/api/nonterminal/rename',
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(object),
                async: false,
                cache: false
            })
            this.props.updateFromServer()
            this.props.updateCurrentNonterminal(newsymbol)
            this.props.updateHistory(newsymbol, this.props.currentRule)
        }
    }

    handleNonterminalDelete() {
        var confirmresponse = window.prompt("This will delete the nonterminal and all rules which reference it, Be warned! YES, in all caps.");
        if (this.props.name != "" && confirmresponse == "YES") {
            var object = {"nonterminal": this.props.name}
            ajax({
                url: $SCRIPT_ROOT + '/api/nonterminal/delete',
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(object),
                async: false,
                cache: false
            })
            this.props.updateCurrentNonterminal("")
            this.props.updateCurrentRule(-1)
            this.props.updateFromServer()
            this.props.updateHistory("", -1)
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
            success: function (data) {
                this.props.updateMarkupFeedback(data.markup);
                this.props.updateExpansionFeedback(data.derivation)
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
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
                deep_str = "Toggle Top-Level"
                glyph_nt = <Glyphicon glyph="asterisk"/>
            }
            else {
                deep_str = "Toggle Top-Level"
                glyph_nt = <Glyphicon glyph="remove"/>
            }
            if( this.props.referents != []) {
                var referents = this.props.referents.map(this.handleClickerThing)
            }
        }

        return (
            <div>
                <div style={{"width": "70%", "margin": "0 auto", "float": "center"}}>
                    <h1>
                    <span style={{"padding": "5px"}}>{name}</span>
                    <br></br>
                    <Button bsStyle={this.props.nonterminal.deep ? "success" : "danger" }
                                         onClick={this.handleSetDeep} title={deep_str}>{glyph_nt}</Button>
                    <Button onClick={this.handleExpand} title="Test"><Glyphicon
                        glyph="resize-full"/></Button>
                    <Button onClick={this.handleNonterminalRename} title="Rename">
                        Rename</Button>
                    <Button onClick={this.handleNonterminalDelete}
                            title="Delete"> Delete</Button>
                    </h1>
                </div>

                <div style={{"width": "70%", "float": "left"}}>
                    <Panel>
                        <ListGroup style={{"maxHeight": "320", "overflowY": "auto"}}>
                            {referents}
                        </ListGroup>
                    </Panel>
                </div>

            </div>
        )

    }
}

module.exports = NonterminalBoard;
