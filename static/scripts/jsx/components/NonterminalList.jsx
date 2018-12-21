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
        this.updateList = this.updateList.bind(this);
        this.getListOfMatchingSymbolNames = this.getListOfMatchingSymbolNames.bind(this);
        this.formatList = this.formatList.bind(this);
        this.addNonterminal = this.addNonterminal.bind(this);
        this.state = {
            newNTNumber: 0
        }
    }

    clickNonterminalUpdate(position) {
        if (this.props.nonterminals[position]) {
            this.props.updateCurrentNonterminal(position);
            this.props.updateCurrentRule(-1);
            this.props.updateMarkupFeedback([]);
            this.props.updateExpansionFeedback("");
            this.props.updateHistory(position, -1);
        }
    }

    updateList(e) {
        this.props.updateSymbolFilterQuery(e.target.value);
    }

    // returns an array of nonterminal names that match the symbolFilterQuery.
    getListOfMatchingSymbolNames() {
        var allSymbolNames = Object.keys(this.props.nonterminals);
        // If there's no filter query, all symbols match
        if (this.props.symbolFilterQuery == ''){
            return allSymbolNames
        }
        // If there's a filter query operating over tags, match all symbols having those tags; here's
        // an example of such a filter query: '$tags:Moves:greeting & Moves:farewell' (note: these
        // queries are treated in a case-sensitive manner because tags are case-sensitive)
        else if (this.props.symbolFilterQuery.slice(0, 6) == "$tags:") {
            var matches = [];
            var raw_tags = this.props.symbolFilterQuery.slice(6).split(' $& ');
            for (var i = 0; i < allSymbolNames.length; i++){
                var symbolName = allSymbolNames[i];
                var isMatch = true;
                for (var j = 0; j < raw_tags.length; j++){
                    if (!raw_tags[j].includes(':')) {
                        isMatch = false;
                    }
                    else {
                        var tagset = raw_tags[j].split(':')[0];
                        var tag = raw_tags[j].split(':')[1];
                        if (!(tagset in this.props.nonterminals[symbolName]["markup"])) {
                            isMatch = false;
                        }
                        else if (!(this.props.nonterminals[symbolName]["markup"][tagset].includes(tag))) {
                            isMatch = false;
                        }
                    }
                }
                if (isMatch){
                    matches.push(symbolName);
                }
            }
            return matches;
        }
        // If there's a filter query operating over symbol expansions, match all symbols that have
        // a production rule whose body includes a terminal symbol for which the filter-query component
        // is a substring
        else if (this.props.symbolFilterQuery.slice(0, 6) == "$text:") {
            var matches = [];
            var text = this.props.symbolFilterQuery.slice(6);
            for (var i = 0; i < allSymbolNames.length; i++){
                var symbolName = allSymbolNames[i];
                var isMatch = false;
                var productionRules = this.props.nonterminals[symbolName]["rules"];
                for (var j = 0; j < productionRules.length; j++){
                    var productionRule = productionRules[j];
                    for (var k = 0; k < productionRule["expansion"].length; k++){
                        var symbol = productionRule["expansion"][k];
                        if (symbol.slice(0, 2) != '[[' && symbol.toLowerCase().indexOf(text.toLowerCase()) != -1) {
                            isMatch = true;
                        }
                    }
                }
                if (isMatch){
                    matches.push(symbolName);
                }
            }
            return matches;
        }
        // Lastly, handle conventional filter queries, which simply match against the symbol names (in
        // a case-insensitive manner)
        return allSymbolNames.filter( (symbolName) => {
            // A given symbol is a match if the filter query is a substring of its name
            var isMatch = symbolName.toLowerCase().indexOf(this.props.symbolFilterQuery.toLowerCase());
            if (isMatch != -1){ return true; }
            return false;
        })
    }

    // Returns a sorted array of nonterminal names
    formatList(nonterminals) {  // 'nonterminals' is an array of nonterminal names
        // If there is a symbol-definition field, put that at the very top
        var symbolDefinition = [];
        for (var i = 0; i < nonterminals.length; i++){
            var symbolName = nonterminals[i];
            console.log(symbolName);
            if (symbolName.indexOf('$symbol') != -1){
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
            if (this.props.nonterminals[symbolName].deep == false && this.props.nonterminals[symbolName].complete == true){
                allOtherSymbols.push(symbolName);
            }
        }
        allOtherSymbols.sort(function(a, b){
            return a.toLowerCase() == b.toLowerCase() ? 0 : +(a.toLowerCase() > b.toLowerCase()) || -1;
        });
        // Return the sorted list
        return symbolDefinition.concat(topLevelSymbols).concat(incompleteSymbols).concat(allOtherSymbols);
    }

    addNonterminal() {
        var newNTName = '$symbol' + this.state.newNTNumber;
        ajax({
            url: $SCRIPT_ROOT + '/api/nonterminal/add',
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({'nonterminal': newNTName}),
            success: () => {
                this.props.updateFromServer();
                this.setState({newNTNumber: this.state.newNTNumber + 1})
            },
            cache: false
        })
    }

    render() {
        var nonterminals = this.formatList(this.getListOfMatchingSymbolNames());
        return (
            <div>
                <ListGroup id='nonterminalList'>
                    <ListGroupItem bsSize='xsmall' key='nonterminalListSearchGroupItem' style={{'padding': '0px'}}>
                        <Button key="ADDNEW" onClick={this.addNonterminal} title="Add new symbol" style={{'height': '35px', 'marginBottom': '2px'}}><Glyphicon glyph="plus"/></Button>
                        <input  id='nonterminalListSearch'
                                title="Hint: Try '$text:[text from symbol expansion]', e.g., '$text:typoo'"
                                type='text' 
                                onChange={this.updateList} 
                                value={this.props.symbolFilterQuery}
                                style={{'width': 'calc(100% - 38px)', 'height': '100%', 'padding': '8px'}}
                                placeholder='Filter...'/>
                    </ListGroupItem>
                    {   nonterminals.map((name) => {
                            var complete = this.props.nonterminals[name].complete;
                            var deep = this.props.nonterminals[name].deep;
                            var newNT = false
                            if (name.indexOf('$symbol') != -1){
                                newNT = true
                            }
                            return (
                                <Nonterminal    name={name}
                                                complete={complete}
                                                deep={deep}
                                                onClick={this.clickNonterminalUpdate.bind(this, name)} 
                                                key={name}
                                                new={newNT}
                                                other_names={this.props.nonterminals}
                                                updateFromServer={this.props.updateFromServer}
                                                updateCurrentNonterminal={this.props.updateCurrentNonterminal}
                                                updateHistory={this.props.updateHistory}
                                                currentRule={this.props.currentRule}>
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
