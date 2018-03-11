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
            var res = name.indexOf(this.state.searchVal);
            if (res != -1){ return true; }
            return false;
        })
    }

    // returns a sorted array of nonterminal names.
    formatList(nonterminals) { // nonterminals = array of nonterminal names
        var anyDeepTerminals = nonterminals.filter((name) => this.props.nonterminals[name].deep == true);
        if (!anyDeepTerminals || this.state.searchVal == '*'){
            // put new nonterminals at the bottom of the list.
            return nonterminals.sort();
        }
        // remove deep nonterminals
        nonterminals = nonterminals.filter((name) => this.props.nonterminals[name].deep == false).sort();
        // add the searched-for deep nonterminals to the top of the list.
        var deeps = [];
        var propsNonterminals = Object.values(this.props.nonterminals);
        for (var i = 0; i < propsNonterminals.length; i++){
            var name = Object.keys(this.props.nonterminals)[i];
            // keep nonterminals that are deep and are being searched for.
            if (propsNonterminals[i].deep == true && name.indexOf(this.state.searchVal) != -1){
                deeps.push(Object.keys(this.props.nonterminals)[i]);
            }
        }
        // add new nonterminals to the end of the list -- a new nonterminal contains the substring 'new nonterminal'
        var newNT = nonterminals.filter((name) => name.indexOf('new nonterminal') != -1)
        nonterminals = nonterminals.filter((name) => name.indexOf('new nonterminal') == -1)
        for (var i in newNT){
            nonterminals.push(newNT[i]);
        }
        return deeps.concat(nonterminals);
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
                                placeholder='Filter by symbol name'/>
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
