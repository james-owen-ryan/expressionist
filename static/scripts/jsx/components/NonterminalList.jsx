var React = require('react')
var Nonterminal = require('./Nonterminal.jsx')
var ListGroupItem = require('react-bootstrap').ListGroupItem
var ListGroup = require('react-bootstrap').ListGroup
var Glyphicon = require('react-bootstrap').Glyphicon
var ajax = require('jquery').ajax

class NonterminalList extends React.Component {
    
    constructor(props) {
        super(props);
        this.clickNonterminalUpdate = this.clickNonterminalUpdate.bind(this);
        this.updateList = this.updateList.bind(this);
        this.getList = this.getList.bind(this);
        this.formatList = this.formatList.bind(this);
        this.addNonterminal = this.addNonterminal.bind(this);
        this.state = {
            searchVal: '',
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
        this.setState({'searchVal': e.target.value})
    }

    // returns an array of nonterminal names that match state.searchVal.
    getList() {
        var names = Object.keys(this.props.nonterminals);
        if (this.state.searchVal == ''){ 
            return names
        }
        else if (this.state.searchVal == '*'){
            return names.filter( (name) => {
                return this.props.nonterminals[name].deep == true;
            })
        }
        return names.filter( (name) => {
            var res = name.toLowerCase().indexOf(this.state.searchVal.toLowerCase());
            if (res != -1){ return true; }
            return false;
        })
    }

    // Returns a sorted array of nonterminal names
    formatList(nonterminals) {  // 'nonterminals' is an array of nonterminal names
        var nonterminals = Object.values(this.props.nonterminals);
        var that = this;
        // Place top-level nonterminal symbols at the top of the list
        var topLevelSymbols = [];
        for (var i = 0; i < nonterminals.length; i++){
            var name = Object.keys(this.props.nonterminals)[i];
            if (nonterminals[i].deep == true && name.indexOf(this.state.searchVal) != -1){
                topLevelSymbols.push(Object.keys(this.props.nonterminals)[i]);
            }
        }
        topLevelSymbols.sort(function(a, b){
            return a.toLowerCase() == b.toLowerCase() ? 0 : +(a.toLowerCase() > b.toLowerCase()) || -1;
        });
        // Place incomplete symbols next (these are ones for which no production rules have been authored)
        var incompleteSymbols = [];
        for (var i = 0; i < nonterminals.length; i++){
            var name = Object.keys(this.props.nonterminals)[i];
            if (nonterminals[i].complete == false && name.indexOf(this.state.searchVal) != -1){
                incompleteSymbols.push(Object.keys(this.props.nonterminals)[i]);
            }
        }
        incompleteSymbols.sort(function(a, b){
            return a.toLowerCase() == b.toLowerCase() ? 0 : +(a.toLowerCase() > b.toLowerCase()) || -1;
        });
        // Finally, place all other symbols last, sorting alphabetically (but ignoring case)
        var allOtherSymbols = [];
        for (var i = 0; i < nonterminals.length; i++){
            var name = Object.keys(this.props.nonterminals)[i];
            if (nonterminals[i].deep == false && nonterminals[i].complete == true && name.indexOf(this.state.searchVal) != -1){
                allOtherSymbols.push(Object.keys(this.props.nonterminals)[i]);
            }
        }
        allOtherSymbols.sort(function(a, b){
            return a.toLowerCase() == b.toLowerCase() ? 0 : +(a.toLowerCase() > b.toLowerCase()) || -1;
        });
        return topLevelSymbols.concat(incompleteSymbols).concat(allOtherSymbols);
    }

    addNonterminal() {
        var newNTName = 'new nonterminal ' + this.state.newNTNumber
        ajax({
            url: $SCRIPT_ROOT + '/api/nonterminal/add',
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({'nonterminal': newNTName}),
            success: () => {
                this.setState({'newNameVal': this.state.newNTNumber += 1})
                this.props.updateFromServer()
            },
            cache: false
        })
    }

    render() {
        var nonterminals = this.formatList(this.getList());
        return (
            <div>
                <ListGroup id='nonterminalList'>
                    <ListGroupItem bsSize='xsmall' key='nonterminalListSearchGroupItem'>
                        <input  id='nonterminalListSearch' 
                                type='text' 
                                onChange={this.updateList} 
                                value={this.state.searchVal}
                                style={{'width': '100%'}}
                                placeholder='Search...'/>
                    </ListGroupItem>
                    {   nonterminals.map((name) => {
                            var complete = this.props.nonterminals[name].complete;
                            var deep = this.props.nonterminals[name].deep;
                            var newNT = false
                            if (name.indexOf('new nonterminal') != -1){
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
                    <ListGroupItem bsSize="xsmall" key="ADDNEW" onClick={this.addNonterminal}>
                        <Glyphicon glyph="plus"/>
                    </ListGroupItem>

                </ListGroup>
            </div>
        );
    }
}

module.exports = NonterminalList;
