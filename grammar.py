"""
Module designed to be used for the generation of generative grammars that focuses entirely on
generating grammars as opposed to parsing them
"""
import collections
import csv
import json
import re

# from IPython import embed
from nonterminal_symbol import NonterminalSymbol
from tags import Markup, MarkupSet
from terminal_symbol import TerminalSymbol, SystemVar
import copy

import jsontree

N_RULES_FIRED = 0


def parse_rule(rule_string):
    """
    function parses a string and returns the generation represented by that string
    :param rule_string: the string representing the rule to be parsed
    :type rule_string: string
    :returns: list[symbols]
    """
    # this regex is a pain but it matches strings of either [[...]] or [...]
    split_list = re.split('(\[{2}[^\]\[]+\]{2})', rule_string)
    # remove all empty strings
    split_list = filter(None, split_list)
    derivation = []
    for token in split_list:
        if token[:2] == '[[':
            derivation.append(NonterminalSymbol(token.lstrip("[").rstrip("]")))
        else:
            derivation.append(TerminalSymbol(token))
    return derivation


class PCFG(object):
    """
    Driver class for our PCFG, allows us to index our nonterminals and
    system variables so that the user can more easily modify them in real time
    Also allows us to selectively expand NonterminalSymbols to see all of their productions
    """

    def __init__(self, monte_carlo=False):
        self.nonterminals = {}
        self.system_vars = []
        self.markup_class = {}
        self.monte_carlo = monte_carlo  # Whether export will rely on a Monte Carlo derivation procedure

    def add_nonterminal(self, nonterminal):
        """ add a nonterminal to our grammar"""
        if not self.nonterminals.get(str(nonterminal.tag)):
            self.nonterminals[str(nonterminal.tag)] = nonterminal
        # this accomodates the recursive definition of nonterminals
        for markups in list(nonterminal.markup):
            self.add_markup(nonterminal, markups)

    def add_rule(self, nonterminal, derivation, application_rate=1):
        """
        add a rule to a nonterminal
        recursion makes this a paaaain
        problems arise with associating nonterminals that have the same tag with their correct
        nonterminal representation within the PCFG class nonterminals[] list
        so we have to do this manually with each token in derivation
        or else we end up with nonterminals that have the same tag but do not have the same
        productions associated with them
        """
        nonterm_add = self.nonterminals.get(str(nonterminal.tag))
        if nonterm_add:
            new_derivation = []
            for token in derivation:
                if isinstance(token, NonterminalSymbol):
                    if self.nonterminals.get(token.tag):
                        new_derivation.append(self.nonterminals.get(token.tag))
                    else:
                        self.add_nonterminal(token)
                        new_derivation.append(token)
                elif isinstance(token, SystemVar) and token not in self.system_vars:
                    self.system_vars.append(token)
                    new_derivation.append(token)
                else:
                    new_derivation.append(token)
            nonterm_add.add_rule(new_derivation, application_rate)

    def modify_rule_expansion(self, rule_id, nonterminal, derivation, application_rate=1):
        """Modify the expansion for a production rule."""
        nonterminal_for_this_rule = self.nonterminals.get(str(nonterminal.tag))
        if nonterminal_for_this_rule:
            new_derivation = []
            for token in derivation:
                if isinstance(token, NonterminalSymbol):
                    if self.nonterminals.get(token.tag):
                        new_derivation.append(self.nonterminals.get(token.tag))
                    else:
                        self.add_nonterminal(token)
                        new_derivation.append(token)
                elif isinstance(token, SystemVar) and token not in self.system_vars:
                    self.system_vars.append(token)
                    new_derivation.append(token)
                else:
                    new_derivation.append(token)
            rules = self.nonterminals.get(str(nonterminal.tag)).rules
            rules[rule_id].modify_derivation(expansion=new_derivation)
            nonterminal_for_this_rule.add_rule(new_derivation, application_rate)

    def remove_rule(self, nonterminal, derivation):
        """remove a rule from a nonterminal"""
        self.nonterminals.get(str(nonterminal.tag)).remove_rule(derivation)

    def remove_rule_by_index(self, nonterminal, rule_index):
        """ remove a rule from a nonterminal by its index"""
        self.nonterminals.get(str(nonterminal.tag)).remove_by_index(rule_index)

    def expand(self, nonterminal):
        """expand a given nonterminal"""
        return self.nonterminals.get(str(nonterminal.tag)).expand(markup=set())

    def modify_application_rate(self, nonterminal, rule_index, application_rate):
        """modify application_rate for the given nonterminal and derivation"""
        rules = self.nonterminals.get(str(nonterminal.tag)).rules
        rules[rule_index].modify_application_rate(application_rate)
        self.nonterminals.get(str(nonterminal.tag))._fit_probability_distribution()

    def monte_carlo_expand(self, nonterminal, samplesscalar=1):
        """
        performs monte_carlo_expand on a given nonterminal
        returns a list of size len(nonterminal.rules)*samplesscalar(no longer true, now size can
        vary depending on if every possible production was sampled
        """
        return self.nonterminals[nonterminal.tag].monte_carlo_expand(samplesscalar)

    def exhaustively_and_nonprobabilistically_expand(self, nonterminal):
        """Exhaustively and nonprobabilistically expands a nonterminal, producing one of each possible derivation."""
        return self.nonterminals[nonterminal.tag].exhaustively_and_nonprobabilistically_expand()

    def set_deep(self, nonterminal, truthy):
        self.nonterminals[str(nonterminal.tag)].set_deep(truthy)

    def add_markup(self, nonterminal, markup):
        """
        add markup to an existing nonterminal
        :type markup: tags.Markup
        """
        if self.nonterminals.get(str(nonterminal.tag)):
            if not self.markup_class.get(str(markup.tagset)):
                self.markup_class[str(markup.tagset)] = set()
            self.markup_class[str(markup.tagset)].add(markup)
            self.nonterminals.get(str(nonterminal.tag)).add_markup(markup)

    def remove_markup(self, nonterminal, markup):
        """
        add markup to an existing nonterminal
        :type markup: tags.Markup
        """
        nonterminal = self.nonterminals.get(str(nonterminal.tag))
        if nonterminal:
            nonterminal.remove_markup(markup)

    def toggle_markup(self, nonterminal, markup):
        if markup in list(self.nonterminals.get(str(nonterminal.tag)).markup):
            self.remove_markup(nonterminal, markup)
            print "removing markup"
        else:
            if str(nonterminal.tag) in self.nonterminals:
                print "adding markup"
                self.add_markup(nonterminal, markup)
            else:
                print('nonterminal not found!')

    def add_unused_markup(self, markup):

        if not self.markup_class.get(str(markup.tagset)):
            self.markup_class[str(markup.tagset)] = set()

        self.markup_class[str(markup.tagset)].add(markup)

    def add_new_markup_set(self, markupSet):

        if not self.markup_class.get(str(markupSet)):
            self.markup_class[str(markupSet)] = set()
            for tags in markupSet.markups:
                self.add_unused_markup(tags)

    def delete_tagset(self, tagsetName):
        exists = self.markup_class
        if tagsetName in self.markup_class:
            self.markup_class.pop(tagsetName, None)

    def monte_carlo_export(self, nonterminal, filename, samplesscalar=1, ):
        """
        returns a tab seperated value list of productions, duplicates removed.
        one thing I need to change is to output the set of markup in a nicer fashion
        """
        expansion = collections.Counter(sorted(self.monte_carlo_expand(nonterminal, samplesscalar)))
        with open(filename, 'a') as csvfile:
            row_writer = csv.writer(csvfile, delimiter='\t', quotechar='|', quoting=
            csv.QUOTE_MINIMAL)
            prob_range = 0
            for deriv in expansion:
                rng_interval = float(expansion[deriv]) / sum(expansion.values())
                rng_max = prob_range + rng_interval
                temp_prob = [prob_range, rng_max]
                row_writer.writerow(
                    [nonterminal, str(deriv.expansion),
                     '^'.join(str(annotation) for annotation in list(deriv.markup)),
                     [prob_range, rng_max]]
                )
                prob_range += rng_interval

    def exhaustively_and_nonprobabilistically_export(self, nonterminal, filename):
        """Append to a tab-separated file lines specifying each of the templated lines of dialogue that
        may be yielded by each of the possible terminal expansions of nonterminal.
        """
        all_possible_expansions_of_this_symbol = (
            self.exhaustively_and_nonprobabilistically_expand(nonterminal=nonterminal)
        )
        with open(filename, 'a') as export_tsv_file:
            row_writer = csv.writer(
                export_tsv_file, delimiter='\t', quotechar='|', quoting=csv.QUOTE_MINIMAL
            )
            for intermediate_derivation_object in all_possible_expansions_of_this_symbol:
                row_writer.writerow(
                    [nonterminal, str(intermediate_derivation_object.expansion),
                     '^'.join(str(annotation) for annotation in list(intermediate_derivation_object.markup)),
                     ['N/A', 'N/A']]  # We write 'N/A' here to indicate that we did not expand probabilistically
                )

    def export_all(self, filename):
        with open(filename, 'w') as tsv_export_file:
            row_writer = csv.writer(
                tsv_export_file, delimiter='\t', quotechar='|', quoting=csv.QUOTE_MINIMAL
            )
            header = ['Top-level Symbol', 'Expansion', 'Markup', 'Probability']
            row_writer.writerow(header)
        for nonterminal in self.nonterminals.itervalues():
            if nonterminal.deep:
                print "Expanding top-level symbol {}".format(nonterminal)
                if self.monte_carlo:
                    self.monte_carlo_export(nonterminal, filename)
                else:
                    self.exhaustively_and_nonprobabilistically_export(nonterminal=nonterminal, filename=filename)

    def to_json(self, to_file = None):
        # total represents our final dictionary we will conver to JSON
        total = {}
        # use defaultdict as it allows us to assume they are sets
        markups = collections.defaultdict(set)
        # nonterminals are their own dictionaries
        nonterminals = collections.defaultdict()

        if to_file is None:
            to_file = False
        else:
            to_file = True

        #print(self.markup_class)
        for key, value in self.nonterminals.iteritems():
            temp = collections.defaultdict()
            if len(value.rules) != 0:
                value.complete = True
            else:
                value.complete = False
            temp['deep'] = value.deep
            temp['complete'] = value.complete

            rules_list = []
            i = 0
            for rules in value.rules:
                # createJSON representation for individual rule markup
                if to_file == False:
                    for symbol in rules.derivation:
                        if isinstance(symbol, NonterminalSymbol):
                            if not nonterminals.get(symbol.tag):
                                nonterminals[symbol.tag] = collections.defaultdict()
                            if not nonterminals[symbol.tag].get('referents'):
                                nonterminals[symbol.tag]['referents'] = []
                            ref_tag = {"symbol": str(value.tag), "index": i}
                            if not ref_tag in nonterminals[symbol.tag]['referents']:
                                nonterminals[symbol.tag]['referents'].append(ref_tag)
                rules_list.append({'expansion': rules.derivation_json(), 'app_rate': rules.application_rate, })
                i += 1
            temp['rules'] = rules_list

            markup_dict = collections.defaultdict(set)
            for markup in value.markup:
                markup_dict[markup.tagset.__str__()] |= {markup.tag}
                markups[markup.tagset.__str__()] |= {markup.tag}

            temp['markup'] = markup_dict
            if not nonterminals.get(value.tag.__str__()):
                nonterminals[value.tag.__str__()] = collections.defaultdict()

            #print(nonterminals)
            nonterminals[value.tag.__str__()].update(temp)
            #print(nonterminals)

        total['nonterminals'] = nonterminals

        total['markups'] = {}
        for markupset in self.markup_class:
            total['markups'][str(markupset)] = set()
            for tag_object in self.markup_class[markupset]:
                if total['markups'].get(str(markupset)):
                    total['markups'][str(markupset)] |= {tag_object}
                else:
                    total['markups'][str(markupset)] = {tag_object}
            # Sort these in reverse order of definition time, meaning the most recently
            # defined mark-up shows up at the top of the drop-down; this makes it easy
            # to find and attribute a new tag that you've just defined in the case of
            # a very large tagset
            total['markups'][str(markupset)] = sorted(
                total['markups'][str(markupset)],
                key=lambda tag: tag.time_of_definition_index, reverse=True
            )
            # Just save the strings for the tags for each of the tag objects
            total['markups'][str(markupset)] = [
                str(tag_object.tag) for tag_object in total['markups'][str(markupset)]
                ]

        def set_default(obj):
            if isinstance(obj, set):
                return list(obj)
            if isinstance(obj, SystemVar):
                return str(obj)
            if isinstance(obj, NonterminalSymbol):
                return str(obj)
            else:
                #print(type(obj))
                raise TypeError

        #print total
        return json.dumps(total, default=set_default, sort_keys=True)
        # create the nonterminal dictonary

    def n_possible_derivations(self):
        """Return the number of possible terminal derivations that may yielded by this grammar."""
        return sum(symbol.n_terminal_expansions() for symbol in self.nonterminals.values() if symbol.deep)

    # really need to get a better way to do this
    def rename_nonterminal_symbol(self, old_symbol_name, new_symbol_name):
        JSON = jsontree.loads(self.to_json())
        #print(JSON)
        JSON['nonterminals'][new_symbol_name] = JSON['nonterminals'].pop(old_symbol_name)
        #print(JSON)
        test_str = jsontree.dumps(JSON)
        test_str = test_str.replace("[[{0}]]".format(old_symbol_name), "[[{0}]]".format(new_symbol_name))
        #print test_str
        new  = from_json(test_str)
        self.__dict__ = new.__dict__

    def rename_tag(self, tagset_name, old_tag_name, new_tag_name):
        grammar_dictionary = jsontree.loads(self.to_json())
        index = grammar_dictionary['markups'][tagset_name].index(old_tag_name)
        grammar_dictionary['markups'][tagset_name][index] = new_tag_name
        for nonterminal_symbol in grammar_dictionary['nonterminals'].values():
            if tagset_name in nonterminal_symbol['markup']:
                try:
                    index = nonterminal_symbol['markup'][tagset_name].index(old_tag_name)
                    nonterminal_symbol['markup'][tagset_name][index] = new_tag_name
                except ValueError:
                    pass
        test_str = jsontree.dumps(grammar_dictionary)
        new = from_json(test_str)
        self.__dict__ = new.__dict__

    def remove_tag(self, tagset_name, tag_name):
        """Remove the given tag from the grammar."""
        grammar_dictionary = jsontree.loads(self.to_json())
        grammar_dictionary['markups'][tagset_name].remove(tag_name)
        for nonterminal_symbol in grammar_dictionary['nonterminals'].values():
            if tagset_name in nonterminal_symbol['markup']:
                try:
                    nonterminal_symbol['markup'][tagset_name].remove(tag_name)
                except ValueError:
                    pass
        test_str = jsontree.dumps(grammar_dictionary)
        new = from_json(test_str)
        self.__dict__ = new.__dict__

    #doing all this stuff on the JSON isn't too bad
    def modify_markupset(self, oldset, newset):
        JSON = jsontree.loads(self.to_json())

        JSON['markups'][newset] = JSON['markups'].pop(oldset)

        for val in JSON['nonterminals'].values():
            if val['markup'].has_key(oldset):
                val['markup'][newset] = val['markup'].pop(oldset)

        test_str = jsontree.dumps(JSON)
        new = from_json(test_str)
        self.__dict__ = new.__dict__

    def delete_nonterminal(self, nonterminal):

        def filterrule(rule):
            if "[[{0}]]".format(nonterminal) in rule['expansion']:
                return 0
            else:
                return 1

        JSON = jsontree.loads(self.to_json())
        JSON['nonterminals'].pop(nonterminal)   # delete nonterminal
        for val in JSON['nonterminals'].values():
            val['rules'] = filter(filterrule, val['rules'])

        test_str = jsontree.dumps(JSON)
        new = from_json(test_str)
        self.__dict__ = new.__dict__

    def copy_rule(self, original, index, new):
        rule = copy.copy(self.nonterminals[original].rules[index])
        rule.symbol = self.nonterminals[new]
        self.nonterminals[new].add_rule_object(rule)

    # want to make this insert changed rule at old index, to preserve order
    def modify_rule(self, nonterminal, index):
        x=1


    def expand_rule(self, nonterminal, index):
        return self.nonterminals[nonterminal].expand_rule(index)


def from_json(json_in):
    gram_res = PCFG()
    dict_rep = json.loads(json_in)
    nonterminals = dict_rep.get('nonterminals')
    for tag, nonterminal in nonterminals.iteritems():
        rules = nonterminal['rules']
        markup = nonterminal['markup']

        # translate UI markup rep into data markup rep
        tmp_markups = []
        for markup_set, tags in markup.iteritems():
            tmp_set = MarkupSet(markup_set)
            for i in tags:
                new_mark = Markup(i, tmp_set)
                tmp_markups.append(new_mark)

        temp_nonterm = NonterminalSymbol(tag, markup=set(tmp_markups), deep=nonterminal['deep'])
        gram_res.add_nonterminal(temp_nonterm)

        for ruleindex, rule in enumerate(rules):
            # rule is an object
            expansion = parse_rule(''.join(rule['expansion']))
            application_rate = rule['app_rate']
            gram_res.add_rule(temp_nonterm, expansion, application_rate)

    for markupSet in dict_rep.get('markups'):
        x = MarkupSet(markupSet)
        gram_res.add_new_markup_set(MarkupSet(markupSet))
        print(markupSet)
        for tags in dict_rep['markups'][markupSet]:
            gram_res.add_unused_markup(Markup(tags, tagset=x))

    return gram_res
