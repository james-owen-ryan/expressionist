import os
import sys
from flask import Flask, render_template, request
from flask import jsonify
import webbrowser
import Markups
import NonterminalSymbol
from test_gram import test
# from IPython import embed
import re
import PCFG
import threading
from reductionist import Reductionist


app = Flask(__name__)
debug = False




@app.route('/api/default', methods=['GET'])
def default():
    return flask_grammar.to_json()


"""
globals are horrible in these two, but because we're not in python 3.x
we don't have nonlocal keywords. Make sure we modify our copy instead of make a new one this way
"""

@app.route('/api/grammar/load_dir', methods=['GET'])
def load_dir():
    return jsonify(results=os.listdir(os.path.abspath(os.path.join(os.path.dirname(__file__), 'grammars/'))))

@app.route('/api/grammar/load', methods=['POST'])
def load_grammar():
    print request
    global flask_grammar
    flask_grammar = PCFG.from_json(str(request.data))
    return flask_grammar.to_json()


@app.route('/api/grammar/from_file', methods=['POST'])
def load_file_grammar():
    global flask_grammar
    grammar_name = request.data
    user_file = os.path.abspath(os.path.join(os.path.dirname(__file__), ''.join(['grammars/', grammar_name])))
    grammar_file = open(user_file, 'r')
    if grammar_file:
        flask_grammar = PCFG.from_json(str(grammar_file.read()))
    return flask_grammar.to_json()


@app.route('/api/grammar/save', methods=['GET', 'POST'])
def save_grammar():
    grammar_name = request.data
    try:
        filename = os.path.abspath(os.path.join(os.path.dirname(__file__), ''.join(['grammars/', grammar_name])))
        outfile = open(filename, 'w+')
        outfile.write(flask_grammar.to_json(to_file=True))
    except:
        print sys.exc_info()[0]
        return "Unable to save the grammar. Please check console for more details."
    return "The grammar was successfully saved."


@app.route('/api/grammar/new', methods=['GET'])
def new_grammar():
    global flask_grammar
    flask_grammar = PCFG.PCFG()
    return flask_grammar.to_json()


@app.route('/api/nonterminal/add', methods=['POST'])
def add_nt():
    data = request.get_json()
    # Strip off excess brackets
    data['nonterminal'] = re.search('[^\[\]]+', data['nonterminal']).group(0)
    flask_grammar.add_nonterminal(NonterminalSymbol.NonterminalSymbol(data['nonterminal']))
    return flask_grammar.to_json()


@app.route('/api/nonterminal/rename', methods=['POST'])
def rename_nt():
    data = request.get_json()
    old = re.search('[^\[\]]+', data['old']).group(0)
    new = re.search('[^\[\]]+', data['new']).group(0)
    flask_grammar.modify_tag(old, new)
    return flask_grammar.to_json()

@app.route('/api/nonterminal/delete', methods=['POST'])
def delete_nt():
    data = request.get_json()
    nonterminal = re.search('[^\[\]]+', data['nonterminal']).group(0)
    flask_grammar.delete_nonterminal(nonterminal)
    return flask_grammar.to_json()

@app.route('/api/nonterminal/deep', methods=['POST'])
def set_deep():
    data = request.get_json()
    nonterminal = flask_grammar.nonterminals.get(data["nonterminal"])
    if nonterminal:
        if nonterminal.deep:
            nonterminal.deep = False
        else:
            nonterminal.deep = True

    return flask_grammar.to_json()


@app.route('/api/nonterminal/expand', methods=['POST', 'GET'])
def expand_nt():
    data = request.get_json()
    return flask_grammar.expand(NonterminalSymbol.NonterminalSymbol(data['nonterminal'])).to_json()


@app.route('/api/rule/expand', methods=['POST', 'GET'])
def expand_rule():
    data = request.get_json()
    return flask_grammar.expand_rule(data['nonterminal'], int(data['index']) ).to_json()

@app.route('/api/rule/swap', methods=['POST'])
def swap_rule():
    data = request.get_json()
    index = int(data['index'])
    original = re.search('[^\[\]]+', data['original']).group(0)
    new = re.search('[^\[\]]+', data['new']).group(0)
    flask_grammar.copy_rule(original, index, new)
    return flask_grammar.to_json()

@app.route('/api/rule/add', methods=['POST'])
def add_rule():
    data = request.get_json()
    rule = data['rule']
    app_rate = int(data['app_rate'])
    nonterminal = NonterminalSymbol.NonterminalSymbol(data["nonterminal"])
    flask_grammar.add_rule(nonterminal, PCFG.parse_rule(rule), app_rate)
    return flask_grammar.to_json()


@app.route('/api/rule/delete', methods=['POST'])
def del_rule():
    data = request.get_json()
    rule = int(data['rule'])
    nonterminal = data['nonterminal']
    flask_grammar.remove_rule_by_index(NonterminalSymbol.NonterminalSymbol(nonterminal), rule)
    return flask_grammar.to_json()


@app.route('/api/rule/set_app', methods=['POST'])
def set_app():
    data = request.get_json()
    rule = data['rule']
    nonterminal = data['nonterminal']
    app_rate = int(data['app_rate'])
    flask_grammar.modify_application_rate(NonterminalSymbol.NonterminalSymbol(nonterminal), rule, app_rate)
    return flask_grammar.to_json()


@app.route('/api/markup/addtag', methods=['POST'])
def add_tag():
    data = request.get_json()
    markupSet = Markups.MarkupSet(data['markupSet'])
    markup = Markups.Markup(data['tag'], markupSet)
    flask_grammar.add_unused_markup(markup)
    return flask_grammar.to_json()


@app.route('/api/markup/addtagset', methods=['POST'])
def add_tagset():
    data = request.get_json()
    markupSet = Markups.MarkupSet(data["markupSet"])
    flask_grammar.add_new_markup_set(markupSet)
    return flask_grammar.to_json()


@app.route('/api/markup/toggle', methods=['POST'])
def toggle_tag():
    data = request.get_json()
    print data
    nonterminal = NonterminalSymbol.NonterminalSymbol(data["nonterminal"])
    markupSet = Markups.MarkupSet(data['markupSet'])
    markup = Markups.Markup(data['tag'], markupSet)
    print("nonterminal")
    flask_grammar.toggle_markup(nonterminal, markup)

    return flask_grammar.to_json()

@app.route('/api/markup/renameset', methods=['POST'])
def rename_markupset():
    data = request.get_json()
    oldset = data['oldset']
    newset = data['newset']
    flask_grammar.modify_markupset(oldset, newset)
    return flask_grammar.to_json()

@app.route('/api/markup/renametag', methods=['POST'])
def rename_markuptag():
    data = request.get_json()
    markupset = data['markupset']
    oldtag = data['oldtag']
    newtag = data['newtag']
    flask_grammar.modify_markup(markupset, oldtag, newtag)
    return flask_grammar.to_json()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):
    return render_template('index.html')


@app.route('/api/grammar/export', methods=['GET', 'POST'])
def export():
    """Instantiate a Reductionist object to have it index the grammar and export .grammar and .meanings files."""
    # Grab the name the user gave for the content bundle
    content_bundle_name = request.data
    # Strip off .json, in the case that it was included (otherwise, we will export, e.g., 'myGrammar.json.meanings')
    if content_bundle_name.endswith('.json'):
        content_bundle_name = content_bundle_name[:-5]
    output_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'exports'))
    output_path_and_filename = "{}/{}".format(output_path, content_bundle_name)
    # Index the grammar and save out the resulting files (Productionist-format grammar file [.grammar] and
    # expressible meanings file [.meanings])
    reductionist = Reductionist(
        raw_grammar_json=flask_grammar.to_json(to_file=True),  # JOR: I'm not sure what to_file actually does
        path_to_write_output_files_to=output_path_and_filename,
        trie_output=False,
        verbosity=0 if debug is False else 2
    )
    if not reductionist.validator.errors:
        print "\n--Success! Indexed this grammar's {n} generable lines to infer {m} expressible meanings.--".format(
            n=reductionist.total_generable_outputs,
            m=len(reductionist.expressible_meanings)
        )
        return "The grammar was successfully exported."
    else:
        print "\n--Errors--"
        for error_message in reductionist.validator.error_messages:
            print '\n{msg}'.format(msg=error_message)
    if reductionist.validator.warnings:
        print "\n--Warnings--"
        for warning_message in reductionist.validator.warning_messages:
            print '\n{msg}'.format(msg=warning_message)
        return "The grammar was successfully exported, but errors were printed to console."
    return "The grammar failed to export. Please check console for more details."


if __name__ == '__main__':
    global flask_grammar
    flask_grammar = PCFG.from_json(str(open('./grammars/example.json', 'r').read()))
    app.debug = debug
    app.run()
