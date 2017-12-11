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
import json
from reductionist import Reductionist
from productionist import Productionist, ContentRequest

app = Flask(__name__)
debug = False

@app.route('/api/default', methods=['GET'])
def default():
    return app.flask_grammar.to_json()

@app.route('/api/grammar/load_dir', methods=['GET'])
def load_dir():
    return jsonify(results=os.listdir(os.path.abspath(os.path.join(os.path.dirname(__file__), 'grammars/'))))

@app.route('/api/load_bundles', methods=['GET'])
def load_bundles():
    return jsonify(results=os.listdir(os.path.abspath(os.path.join(os.path.dirname(__file__), 'exports/'))))

@app.route('/api/load_bundle', methods=['POST'])
def load_bundle():
    bundle_name = request.data
    try:
        user_file = os.path.abspath(os.path.join(os.path.dirname(__file__), ''.join(['exports/', bundle_name, '.grammar'])))
        grammar_file = open(user_file, 'r')
    except Exception as error:
        print repr(error)
    return str(grammar_file.read())

@app.route('/api/grammar/load', methods=['POST'])
def load_grammar():
    print request
    app.flask_grammar = PCFG.from_json(str(request.data))
    return app.flask_grammar.to_json()

@app.route('/api/grammar/from_file', methods=['POST'])
def load_file_grammar():
    grammar_name = request.data
    user_file = os.path.abspath(os.path.join(os.path.dirname(__file__), ''.join(['grammars/', grammar_name])))
    grammar_file = open(user_file, 'r')
    if grammar_file:
        app.flask_grammar = PCFG.from_json(str(grammar_file.read()))
    return app.flask_grammar.to_json()

@app.route('/api/grammar/save', methods=['GET', 'POST'])
def save_grammar():
    grammar_name = request.data
    try:
        filename = os.path.abspath(os.path.join(os.path.dirname(__file__), ''.join(['grammars/', grammar_name])))
        outfile = open(filename, 'w+')
        outfile.write(app.flask_grammar.to_json(to_file=True))
    except Exception as error:
        print repr(error)
        return "Unable to save the grammar. Please check console for more details."
    return "The grammar was successfully saved."


@app.route('/api/grammar/new', methods=['GET'])
def new_grammar():
    app.flask_grammar = PCFG.PCFG()
    return app.flask_grammar.to_json()


@app.route('/api/nonterminal/add', methods=['POST'])
def add_nt():
    data = request.get_json()
    app.flask_grammar.add_nonterminal(NonterminalSymbol.NonterminalSymbol(data['nonterminal']))
    return app.flask_grammar.to_json()


@app.route('/api/nonterminal/rename', methods=['POST'])
def rename_nt():
    data = request.get_json()
    old = data['old']
    new = data['new']
    app.flask_grammar.modify_tag(old, new)
    return app.flask_grammar.to_json()

@app.route('/api/nonterminal/delete', methods=['POST'])
def delete_nt():
    data = request.get_json()
    nonterminal = re.search('[^\[\]]+', data['nonterminal']).group(0)
    app.flask_grammar.delete_nonterminal(nonterminal)
    return app.flask_grammar.to_json()

@app.route('/api/nonterminal/deep', methods=['POST'])
def set_deep():
    data = request.get_json()
    nonterminal = app.flask_grammar.nonterminals.get(data["nonterminal"])
    if nonterminal:
        if nonterminal.deep:
            nonterminal.deep = False
        else:
            nonterminal.deep = True

    return app.flask_grammar.to_json()


@app.route('/api/nonterminal/expand', methods=['POST', 'GET'])
def expand_nt():
    data = request.get_json()
    return app.flask_grammar.expand(NonterminalSymbol.NonterminalSymbol(data['nonterminal'])).to_json()

@app.route('/api/rule/expand', methods=['POST', 'GET'])
def expand_rule():
    data = request.get_json()
    return app.flask_grammar.expand_rule(data['nonterminal'], int(data['index']) ).to_json()

@app.route('/api/rule/swap', methods=['POST'])
def swap_rule():
    data = request.get_json()
    index = int(data['index'])
    original = re.search('[^\[\]]+', data['original']).group(0)
    new = re.search('[^\[\]]+', data['new']).group(0)
    app.flask_grammar.copy_rule(original, index, new)
    return app.flask_grammar.to_json()

@app.route('/api/rule/add', methods=['POST'])
def add_rule():
    data = request.get_json()
    rule = data['rule']
    app_rate = int(data['app_rate'])
    nonterminal = NonterminalSymbol.NonterminalSymbol(data["nonterminal"])
    app.flask_grammar.add_rule(nonterminal, PCFG.parse_rule(rule), app_rate)
    return app.flask_grammar.to_json()


@app.route('/api/rule/delete', methods=['POST'])
def del_rule():
    data = request.get_json()
    rule = int(data['rule'])
    nonterminal = data['nonterminal']
    app.flask_grammar.remove_rule_by_index(NonterminalSymbol.NonterminalSymbol(nonterminal), rule)
    return app.flask_grammar.to_json()


@app.route('/api/rule/set_app', methods=['POST'])
def set_app():
    data = request.get_json()
    rule = data['rule']
    nonterminal = data['nonterminal']
    app_rate = int(data['app_rate'])
    app.flask_grammar.modify_application_rate(NonterminalSymbol.NonterminalSymbol(nonterminal), rule, app_rate)
    return app.flask_grammar.to_json()


@app.route('/api/markup/addtag', methods=['POST'])
def add_tag():
    data = request.get_json()
    markupSet = Markups.MarkupSet(data['markupSet'])
    markup = Markups.Markup(data['tag'], markupSet)
    app.flask_grammar.add_unused_markup(markup)
    return app.flask_grammar.to_json()


@app.route('/api/markup/addtagset', methods=['POST'])
def add_tagset():
    data = request.get_json()
    markupSet = Markups.MarkupSet(data["markupSet"])
    app.flask_grammar.add_new_markup_set(markupSet)
    return app.flask_grammar.to_json()

@app.route('/api/markup/toggle', methods=['POST'])
def toggle_tag():
    data = request.get_json()
    print data
    nonterminal = NonterminalSymbol.NonterminalSymbol(data["nonterminal"])
    markupSet = Markups.MarkupSet(data['markupSet'])
    markup = Markups.Markup(data['tag'], markupSet)
    print("nonterminal")
    app.flask_grammar.toggle_markup(nonterminal, markup)

    return app.flask_grammar.to_json()

@app.route('/api/markup/renameset', methods=['POST'])
def rename_markupset():
    data = request.get_json()
    oldset = data['oldset']
    newset = data['newset']
    app.flask_grammar.modify_markupset(oldset, newset)
    return app.flask_grammar.to_json()

@app.route('/api/markup/renametag', methods=['POST'])
def rename_markuptag():
    data = request.get_json()
    markupset = data['markupset']
    oldtag = data['oldtag']
    newtag = data['newtag']
    app.flask_grammar.modify_markup(markupset, oldtag, newtag)
    return app.flask_grammar.to_json()

@app.route('/api/markup/deletetagset', methods=['POST'])
def delete_tagset():
    name = request.get_json()['tagsetName']
    print 'Deleting tagset: '+name
    app.flask_grammar.delete_tagset(name)
    return app.flask_grammar.to_json()

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
    # Index the grammar and save out the resulting files (Productionist-format grammar file [.grammar],
    # trie file (.marisa), and expressible meanings file [.meanings])
    reductionist = Reductionist(
        raw_grammar_json=app.flask_grammar.to_json(to_file=True),  # JOR: I'm not sure what to_file actually does
        path_to_write_output_files_to=output_path_and_filename,
        trie_output=True,
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
    return "The grammar failed to export. Please check the console for more details."


@app.route('/api/grammar/build', methods=['GET', 'POST'])
def build_productionist():
    """Build a Productionist by processing an exported content bundle."""
    print "\n-- Building a Productionist..."
    # Grab the name the user gave for the content bundle
    content_bundle_name = request.data
    content_bundle_directory = os.path.abspath(os.path.join(os.path.dirname(__file__), 'exports'))
    # Keep the Productionist on hand as an attribute of the web-app object
    app.productionist = Productionist(
        content_bundle_name=content_bundle_name,
        content_bundle_directory=content_bundle_directory,
        probabilistic_mode=True,  # TODO may want to support toggling this on and off in the authoring interface
        repetition_penalty_mode=False,
        terse_mode=False,
        verbosity=0
    )
    return jsonify({'status': "Successfully built a content generator.", 'bundleName': content_bundle_name})


@app.route('/api/grammar/tagged_content_request', methods=['POST'])
def tagged_content_request():
    """Furnish generated content that satisfies an author-defined content request."""
    # Receive the raw content request (as JSON data)
    data = request.data
    # Parse the raw JSON into a dictionary
    content_request = json.loads(data)
    # Grab out everything we need to send to Productionist
    required_tags = {tag["name"] for tag in content_request["tags"] if tag["status"] == "required"}
    prohibited_tags = {tag["name"] for tag in content_request["tags"] if tag["status"] == "disabled"}
    scoring_metric = [
        (tag["name"], int(tag["frequency"])) for tag in content_request["tags"] if tag["status"] == "enabled"
    ]
    # Time to generate content; prepare the actual ContentRequest object that Productionist will process
    content_request = ContentRequest(
        must_have=required_tags, must_not_have=prohibited_tags, scoring_metric=scoring_metric
    )
    print "\n-- Attempting to fulfill the following content request:\n{}".format(content_request)
    # Fulfill the content request to generate N outputs (each being an object of the class productionist.Output)
    output = app.productionist.fulfill_content_request(content_request=content_request)
    if output:
        print "\n\n-- Successfully fulfilled the content request!"
        # Send the generated outputs back to the authoring tool as a single JSON package
        output_as_json_package = json.dumps(output.payload)
        print output_as_json_package
        return output_as_json_package
    print "\n\n-- The content request cannot be satisfied by the exported content bundle."
    return "The content request cannot be satisfied by the exported content bundle."
    # JOR: Here's how the outputs are displayed in the command-line interface
    # for i in xrange(len(outputs)):
    #     output = outputs[i]
    #     if args.verbosity > 0:
    #         print "\n\n-- Successfully generated an output:"
    #         # Print the generated output
    #         print "\n\t{}".format(output)
    #         # Print out all the tags attached to the generated output
    #         print "\nThe following tags are attached to this output:"
    #         for tag in output.tags:
    #             print '\t{}'.format(tag)
    #         # Print the tree expression for the generated output
    #         print (
    #             "\n\n-- Here's a tree expression illustrating the series of expansions "
    #             "that produced this output:"
    #         )
    #         print "\n{}".format(output.tree_expression)
    #         # Print the tagged tree expression for the generated output
    #         print "\n\n-- Here's a tree expression that shows how the generated content got its tags:"
    #         print "\n{}".format(output.tree_expression_with_tags)
    #         # Print the bracketed expression for the generated output
    #         print (
    #             "\n\n-- Here's a bracketed expression that more economically illustrates "
    #             "the derivation of the content:"
    #         )
    #         print "\n{}".format(output.bracketed_expression)
    #         print '\n\n'
    #     else:
    #         print "#{n}".format(n=i + 1)
    #         print "--Output--\n{output}".format(output=str(output))
    #         # Note: For this one, we must either prevent commas in tag names or use a different delimiter
    #         print "--Tags--\n{tags}".format(tags=','.join(output.tags))
    #         print "--Bracketed expression--\n{expression}".format(expression=output.bracketed_expression)
    #         print "--Tree expression--\n{expression}".format(expression=output.tree_expression)
    #         print "--Tree expression (with tags)--\n{expression}".format(expression=output.tree_expression_with_tags)


if __name__ == '__main__':
    app.flask_grammar = PCFG.from_json(str(open('./grammars/example.json', 'r').read()))
    app.productionist = None  # Gets set upon export
    app.debug = debug
    app.run()
