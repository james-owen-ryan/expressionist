import os
import re
import json
import grammar
import nonterminal_symbol
import tags
from flask import Flask, render_template, request, jsonify
from reductionist import Reductionist
from productionist import Productionist, ContentRequest

app = Flask(__name__)
debug = False


@app.route('/api/default', methods=['GET'])
def default():
    return app.grammar.to_json()


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/grammar/check_equivalence', methods=['POST'])
def check_if_grammar_states_are_the_same():
    data = request.get_json()
    grammar_state_1 = data['grammarState1']
    grammar_state_2 = data['grammarState2']
    payload = {'verdict': grammar_state_1 == grammar_state_2}
    return jsonify(payload)


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
    """Load a grammar into memory given a JSON string sent via POST (allows the app to reflect undo and redo changes)."""
    app.grammar = grammar.from_json(str(request.data))
    return app.grammar.to_json()


@app.route('/api/grammar/from_file', methods=['POST'])
def load_file_grammar():
    grammar_name = request.data
    user_file = os.path.abspath(os.path.join(os.path.dirname(__file__), ''.join(['grammars/', grammar_name])))
    grammar_file = open(user_file, 'r')
    if grammar_file:
        app.grammar = grammar.from_json(str(grammar_file.read()))
    return app.grammar.to_json()


@app.route('/api/grammar/save', methods=['GET', 'POST'])
def save_grammar():
    grammar_name = request.data
    # Make sure the name includes a '.json' file extension
    if grammar_name[-5:] != '.json':
        grammar_name += '.json'
    try:
        filename = os.path.abspath(os.path.join(os.path.dirname(__file__), ''.join(['grammars/', grammar_name])))
        outfile = open(filename, 'w+')
        outfile.write(app.grammar.to_json(to_file=True))
    except Exception as error:
        print repr(error)
        return "Unable to save grammar. Please check console for more details."
    return "The grammar was successfully saved."


@app.route('/api/grammar/new', methods=['GET'])
def new_grammar():
    app.grammar = grammar.PCFG()
    return app.grammar.to_json()


@app.route('/api/nonterminal/add', methods=['POST'])
def add_nt():
    data = request.get_json()
    app.grammar.add_nonterminal(nonterminal_symbol.NonterminalSymbol(data['nonterminal']))
    return app.grammar.to_json()


@app.route('/api/nonterminal/rename', methods=['POST'])
def rename_nt():
    data = request.get_json()
    old = data['old']
    new = data['new']
    app.grammar.rename_nonterminal_symbol(old, new)
    return app.grammar.to_json()


@app.route('/api/nonterminal/delete', methods=['POST'])
def delete_nt():
    data = request.get_json()
    nonterminal = re.search('[^\[\]]+', data['nonterminal']).group(0)
    app.grammar.delete_nonterminal(nonterminal)
    return app.grammar.to_json()


@app.route('/api/nonterminal/set_top_level_status', methods=['POST'])
def set_top_level_status():
    data = request.get_json()
    nonterminal = app.grammar.nonterminals.get(data["nonterminal"])
    new_top_level_status = data["status"]
    nonterminal.deep = new_top_level_status
    return app.grammar.to_json()


@app.route('/api/nonterminal/set_pinned_status', methods=['POST'])
def set_symbol_pinned_status():
    data = request.get_json()
    nonterminal = app.grammar.nonterminals.get(data["nonterminal"])
    new_pinned_status = data["status"]
    nonterminal.pinned = new_pinned_status
    return app.grammar.to_json()


@app.route('/api/nonterminal/expand', methods=['POST', 'GET'])
def expand_nt():
    data = request.get_json()
    return app.grammar.expand(nonterminal_symbol.NonterminalSymbol(data['nonterminal'])).to_json()


@app.route('/api/rule/expand', methods=['POST', 'GET'])
def expand_rule():
    data = request.get_json()
    return app.grammar.expand_rule(data['nonterminal'], int(data['index'])).to_json()


@app.route('/api/rule/swap', methods=['POST'])
def swap_rule():
    data = request.get_json()
    index = int(data['index'])
    original = re.search('[^\[\]]+', data['original']).group(0)
    new = re.search('[^\[\]]+', data['new']).group(0)
    app.grammar.copy_rule(original, index, new)
    return app.grammar.to_json()


@app.route('/api/rule/add', methods=['POST'])
def add_rule():
    data = request.get_json()
    rule_head_name = data['rule head name']
    rule_body = data['rule body']
    application_rate = int(data['application rate'])
    preconditions_str = data['preconditions']
    effects_str = data['effects']
    try:
        # Retrieve the nonterminal symbol named in the rule head
        rule_head_object = app.grammar.nonterminals[rule_head_name]
    except KeyError:
        # No such nonterminal symbol exists yet, so create one
        rule_head_object = nonterminal_symbol.NonterminalSymbol(rule_head_name)
        app.grammar.add_nonterminal(rule_head_object)
    app.grammar.add_rule(
        rule_head=rule_head_object,
        rule_body=grammar.parse_rule(rule_body),
        application_rate=application_rate,
        preconditions_str=preconditions_str,
        effects_str=effects_str
    )
    return app.grammar.to_json()


@app.route('/api/rule/edit', methods=['POST'])
def edit_rule():
    data = request.get_json()
    original_rule_head_name = data['original rule head name']
    original_rule_index = int(data['rule id'])
    rule_head_name = data['rule head name']
    rule_body = data['rule body']
    application_rate = int(data['application rate'])
    preconditions_str = data['preconditions']
    effects_str = data['effects']
    if rule_head_name == original_rule_head_name:
        # Simply update the application rate and expansion
        app.grammar.modify_application_rate(
            rule_head=nonterminal_symbol.NonterminalSymbol(rule_head_name),
            rule_index=original_rule_index,
            application_rate=application_rate
        )
        app.grammar.modify_rule_expansion(
            rule_head=nonterminal_symbol.NonterminalSymbol(rule_head_name),
            rule_index=original_rule_index,
            derivation=grammar.parse_rule(rule_body),
            application_rate=application_rate
        ),
        app.grammar.modify_rule_preconditions_and_effects(
            rule_head=nonterminal_symbol.NonterminalSymbol(rule_head_name),
            rule_index=original_rule_index,
            new_preconditions_str=preconditions_str,
            new_effects_str=effects_str
        )
    else:
        # Delete the old rule and create a new one that is associated with the new rule head
        app.grammar.remove_rule_by_index(nonterminal_symbol.NonterminalSymbol(original_rule_head_name), original_rule_index)
        try:
            new_rule_head_object = app.grammar.nonterminals[rule_head_name]
        except KeyError:
            new_rule_head_object = nonterminal_symbol.NonterminalSymbol(rule_head_name)
            app.grammar.add_nonterminal(new_rule_head_object)
        app.grammar.add_rule(new_rule_head_object, grammar.parse_rule(rule_body), application_rate)
    return app.grammar.to_json()


@app.route('/api/rule/delete', methods=['POST'])
def del_rule():
    data = request.get_json()
    rule = int(data['rule'])
    nonterminal = data['nonterminal']
    app.grammar.remove_rule_by_index(nonterminal_symbol.NonterminalSymbol(nonterminal), rule)
    return app.grammar.to_json()


@app.route('/api/rule/set_app', methods=['POST'])
def set_app():
    data = request.get_json()
    rule = data['rule']
    nonterminal = data['nonterminal']
    app_rate = int(data['app_rate'])
    app.grammar.modify_application_rate(nonterminal_symbol.NonterminalSymbol(nonterminal), rule, app_rate)
    return app.grammar.to_json()


@app.route('/api/markup/addtag', methods=['POST'])
def add_tag():
    data = request.get_json()
    markupSet = tags.MarkupSet(data['markupSet'])
    markup = tags.Markup(data['tag'], markupSet)
    app.grammar.add_unused_markup(markup)
    return app.grammar.to_json()


@app.route('/api/markup/addtagset', methods=['POST'])
def add_tagset():
    data = request.get_json()
    markupSet = tags.MarkupSet(data["markupSet"])
    app.grammar.add_new_markup_set(markupSet)
    return app.grammar.to_json()


@app.route('/api/markup/toggle', methods=['POST'])
def toggle_tag():
    data = request.get_json()
    nonterminal = nonterminal_symbol.NonterminalSymbol(data["nonterminal"])
    markupSet = tags.MarkupSet(data['markupSet'])
    markup = tags.Markup(data['tag'], markupSet)
    app.grammar.toggle_markup(nonterminal, markup)

    return app.grammar.to_json()


@app.route('/api/markup/renameset', methods=['POST'])
def rename_markupset():
    data = request.get_json()
    oldset = data['oldset']
    newset = data['newset']
    app.grammar.modify_markupset(oldset, newset)
    return app.grammar.to_json()


@app.route('/api/markup/renametag', methods=['POST'])
def rename_tag():
    data = request.get_json()
    tagset_name = data['markupset']
    old_tag_name = data['oldtag']
    new_tag_name = data['newtag']
    app.grammar.rename_tag(tagset_name=tagset_name, old_tag_name=old_tag_name, new_tag_name=new_tag_name)
    return app.grammar.to_json()


@app.route('/api/markup/removetag', methods=['POST'])
def remove_tag():
    data = request.get_json()
    tagset_name = data['tagSet']
    tag_name = data['tagName']
    app.grammar.remove_tag(tagset_name=tagset_name, tag_name=tag_name)
    return app.grammar.to_json()


@app.route('/api/markup/deletetagset', methods=['POST'])
def delete_tagset():
    name = request.get_json()['tagsetName']
    app.grammar.delete_tagset(name)
    return app.grammar.to_json()


@app.route('/api/grammar/export', methods=['GET', 'POST'])
def export():
    """Instantiate a Reductionist object to have it index the grammar and export .grammar and .meanings files."""
    # Grab the name the user gave for the content bundle
    content_bundle_name = request.data
    # Strip off .json, in the case that it was included (otherwise, we will export, e.g., 'myGrammar.json.meanings')
    if content_bundle_name.endswith('.json'):
        content_bundle_name = content_bundle_name[:-5]
    output_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ''.join(['exports/', content_bundle_name])))
    # Index the grammar and save out the resulting files (Productionist-format grammar file [.grammar],
    # trie file (.marisa), and expressible meanings file [.meanings])
    Reductionist(
        raw_grammar_json=app.grammar.to_json(to_file=True),  # JOR: I'm not sure what to_file actually does
        path_to_write_output_files_to=output_path,
        verbosity=0 if debug is False else 2
    )
    # if not reductionist.validator.errors:
    #     print "\n--Success! Indexed this grammar's {n} generable lines to infer {m} expressible meanings.--".format(
    #         n=reductionist.total_generable_outputs,
    #         m=len(reductionist.expressible_meanings)
    #     )
    #     return "The grammar was successfully exported."
    # else:
    #     print "\n--Errors--"
    #     for error_message in reductionist.validator.error_messages:
    #         print '\n{msg}'.format(msg=error_message)
    # if reductionist.validator.warnings:
    #     print "\n--Warnings--"
    #     for warning_message in reductionist.validator.warning_messages:
    #         print '\n{msg}'.format(msg=warning_message)
    #     return "The grammar was successfully exported, but errors were printed to console."
    return "The grammar failed to export. Please check the console for more details."


@app.route('/api/grammar/build', methods=['GET', 'POST'])
def build_productionist():
    """Build a Productionist by processing an exported content bundle."""
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


@app.route('/api/grammar/content_request', methods=['POST'])
def handle_content_request():
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
    state = json.loads(content_request["state"])
    # Time to generate content; prepare the actual ContentRequest object that Productionist will process
    content_request = ContentRequest(
        required_tags=required_tags,
        prohibited_tags=prohibited_tags,
        scoring_metric=scoring_metric,
        state=state,
        merge_state=False
    )
    # Fulfill the content request to generate N outputs (each being an object of the class productionist.Output)
    content_package = app.productionist.fulfill_content_request(content_request=content_request)
    if content_package:
        # Send the generated outputs back to the authoring tool as a single JSON package
        content_package_json = json.dumps({
            "text": content_package.text,
            "tags": list(content_package.tags),
            "treeExpression": content_package.tree_expression,
            "state": json.dumps(content_package.state.now)
        })
        return content_package_json
    return "The content request cannot be satisfied by the exported content bundle."


if __name__ == '__main__':
    app.grammar = grammar.from_json(str(open('./grammars/new.json', 'r').read()))
    app.productionist = None  # Gets set upon export
    app.debug = debug
    app.run()
