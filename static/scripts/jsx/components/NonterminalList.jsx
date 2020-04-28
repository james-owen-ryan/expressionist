var React = require('react')
var Nonterminal = require('./Nonterminal.jsx')
var ListGroupItem = require('react-bootstrap').ListGroupItem
var ListGroup = require('react-bootstrap').ListGroup
var Glyphicon = require('react-bootstrap').Glyphicon
var Button = require('react-bootstrap').Button
var ajax = require('jquery').ajax

class NonterminalList extends React.Component {
    
    constructor(props) {
        super(props);
        this.clickNonterminalUpdate = this.clickNonterminalUpdate.bind(this);
        this.updateSymbolFilterQuery = this.updateSymbolFilterQuery.bind(this);
        this.formatList = this.formatList.bind(this);
        this.addNonterminal = this.addNonterminal.bind(this);
        this.clearSymbolFilterQuery = this.clearSymbolFilterQuery.bind(this);
        this.state = {
            thisIsANewSymbolNumber: 0
        }
    }

    clickNonterminalUpdate(position) {
        if (this.props.nonterminals[position]) {
            this.props.updateCurrentSymbolName(position);
            this.props.updateCurrentRule(-1);
            this.props.updateGeneratedContentPackageTags([]);
            this.props.updateGeneratedContentPackageText("");
        }
    }

    updateSymbolFilterQuery(e) {
        this.props.updateSymbolFilterQuery(e.target.value);
    }

    clearSymbolFilterQuery() {
        this.props.updateSymbolFilterQuery("");
    }

    // Returns a sorted array of nonterminal names
    formatList(nonterminals) {  // 'nonterminals' is an array of nonterminal names
        // If there is a symbol-definition field, put that at the very top
        var symbolDefinition = [];
        for (var i = 0; i < nonterminals.length; i++){
            var symbolName = nonterminals[i];
            if (symbolName.indexOf('$symbol') !== -1){
                symbolDefinition.push(symbolName);
            }
        }
        // Place top-level nonterminal symbols at the top of the list
        var topLevelSymbols = [];
        for (var i = 0; i < nonterminals.length; i++){
            var symbolName = nonterminals[i];
            if (this.props.nonterminals[symbolName].deep == true){
                topLevelSymbols.push(symbolName);
            }
        }
        topLevelSymbols.sort(function(a, b){
            return a.toLowerCase() == b.toLowerCase() ? 0 : +(a.toLowerCase() > b.toLowerCase()) || -1;
        });
        // Place pinned symbols next
        var pinnedSymbols = [];
        for (var i = 0; i < nonterminals.length; i++){
            var symbolName = nonterminals[i];
            if (this.props.nonterminals[symbolName].pinned == true){
                topLevelSymbols.push(symbolName);
            }
        }
        pinnedSymbols.sort(function(a, b){
            return a.toLowerCase() == b.toLowerCase() ? 0 : +(a.toLowerCase() > b.toLowerCase()) || -1;
        });
        // Place incomplete symbols next (these are ones for which no production rules have been authored)
        var incompleteSymbols = [];
        for (var i = 0; i < nonterminals.length; i++){
            var symbolName = nonterminals[i];
            if (this.props.nonterminals[symbolName].complete == false){
                incompleteSymbols.push(symbolName);
            }
        }
        incompleteSymbols.sort(function(a, b){
            return a.toLowerCase() == b.toLowerCase() ? 0 : +(a.toLowerCase() > b.toLowerCase()) || -1;
        });
        // Finally, place all other symbols last, sorting alphabetically (but ignoring case)
        var allOtherSymbols = [];
        for (var i = 0; i < nonterminals.length; i++){
            var symbolName = nonterminals[i];
            if (this.props.nonterminals[symbolName].deep == false && this.props.nonterminals[symbolName].complete == true && symbolName.indexOf('$symbol') === -1){
                allOtherSymbols.push(symbolName);
            }
        }
        allOtherSymbols.sort(function(a, b){
            return a.toLowerCase() == b.toLowerCase() ? 0 : +(a.toLowerCase() > b.toLowerCase()) || -1;
        });
        // Return the sorted list
        return symbolDefinition.concat(topLevelSymbols).concat(pinnedSymbols).concat(incompleteSymbols).concat(allOtherSymbols);
    }

    addNonterminal() {
        // Reset the filter query, so that the author can see the symbol-definition element
        this.props.updateSymbolFilterQuery('');
        var thisIsANewSymbolName = '$symbol' + this.state.thisIsANewSymbolNumber;
        ajax({
            url: $SCRIPT_ROOT + '/api/nonterminal/add',
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({'nonterminal': thisIsANewSymbolName}),
            success: () => {
                this.props.updateFromServer();
                this.setState({thisIsANewSymbolNumber: this.state.thisIsANewSymbolNumber + 1})
            },
            cache: false
        })
    }

    render() {
        var symbolMatches = this.formatList(this.props.getListOfMatchingSymbolNames(this.props.symbolFilterQuery));
        return (
            <div>
                <ListGroup id='nonterminalList'>
                    <ListGroupItem bsSize='xsmall' key='nonterminalListSearchGroupItem' style={{'padding': '0px'}}>
                        <Button key="ADDNEW" onClick={this.addNonterminal} title="Add new symbol" style={{'height': '35px', 'marginBottom': '2px'}}><Glyphicon glyph="plus"/></Button>
                        {
                            Object.keys(this.props.nonterminals).some(function (name) {return name.indexOf("$symbol") === -1})
                            ?
                            <input  id='nonterminalListSearch'
                                title="Hint: try '$text:[text from symbol rewriting]', e.g., '$text:typoo'"
                                type='text'
                                onChange={this.updateSymbolFilterQuery}
                                value={this.props.symbolFilterQuery}
                                style={{'width': 'calc(100% - 38px - 38px)', 'height': '100%', 'padding': '8px'}}
                                placeholder='Filter list...'
                                // This hack is necessary to keep the cursor at the end of the query upon auto-focus
                                onFocus={function(e) {
                                    var val = e.target.value;
                                    e.target.value = '';
                                    e.target.value = val;
                                }}
                                autoFocus="true"
                            />
                            :
                            ""
                        }
                        {this.props.symbolFilterQuery ? <Button onClick={this.clearSymbolFilterQuery} title="Clear filter" style={{'height': '35px', 'marginBottom': '2px'}}><Glyphicon glyph="remove"/></Button> : ""}
                    </ListGroupItem>
                    {   symbolMatches.map((name) => {
                            var complete = this.props.nonterminals[name].complete;
                            var deep = this.props.nonterminals[name].deep;
                            var pinned = this.props.nonterminals[name].pinned;
                            var thisIsANewSymbol = false
                            if (name.indexOf('$symbol') !== -1){
                                thisIsANewSymbol = true
                            }
                            return (
                                <Nonterminal    name={name}
                                                complete={complete}
                                                deep={deep}
                                                pinned={pinned}
                                                onClick={this.clickNonterminalUpdate.bind(this, name)} 
                                                key={name}
                                                thisIsANewSymbol={thisIsANewSymbol}
                                                symbolNameAlreadyExists={this.props.symbolNameAlreadyExists}
                                                updateFromServer={this.props.updateFromServer}
                                                updateCurrentSymbolName={this.props.updateCurrentSymbolName}
                                                updateCurrentRule={this.props.updateCurrentRule}
                                                currentRule={this.props.currentRule}
                                                isCurrentNonterminal={name === this.props.currentNonterminalName}>
                                </Nonterminal>
                            )
                        })
                    }
                </ListGroup>
            </div>
        );
    }
}

module.exports = NonterminalList;
