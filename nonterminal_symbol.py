import itertools
import random
from intermediate_derivation import IntermediateDeriv
from rule import Rule
from terminal_symbol import TerminalSymbol


class NonterminalSymbol(object):
    """A non-terminal symbol in a grammar."""

    def __init__(self, tag, markup=None, deep=False):
        """Initialize a NonterminalSymbol object."""
        if markup is None:
            markup = set()
        self.tag = tag
        self.rules = []  # Unordered list of rule objects
        self.rules_probability_distribution = {}
        self.markup = set()
        self.deep = deep
        self.complete = False
        self.pinned = False  # Whether the symbol is pinned to the top of the list of nonterminal symbols
        for markups in list(markup):
            if markups not in list(self.markup):
                self.markup.add(markups)
        # This attribute holds a list containing all possible expansions of this symbol (each being represented by
        # an agglomerated IntermediateDerivation object); it's built once and only once the first time
        # self.exhaustively_and_nonprobabilistically_expand() is called
        self.all_possible_expansions = None

    def __eq__(self, other):
        if isinstance(other, NonterminalSymbol):
            # equality depends on tag and rules
            return self.tag == other.tag and self.rules == other.rules
        else:
            return False

    def add_rule(self, rule_body, application_rate=1, preconditions_str="", effects_str=""):
        """Add a new production rule for this nonterminal symbol."""
        rule_object = Rule(
            rule_head=self,
            rule_body=rule_body,
            application_rate=application_rate,
            preconditions_str=preconditions_str,
            effects_str=effects_str
        )
        if rule_object not in self.rules:
            self.rules.append(rule_object)
            self.fit_probability_distribution()
            return True
        else:
            return False

    def add_rule_object(self, rule_object):
        if rule_object not in self.rules:
            self.rules.append(rule_object)
            self.fit_probability_distribution()
            return True
        else:
            return False

    def remove_rule(self, derivation):
        """remove a production rule for this nonterminal symbol."""
        rule_object = Rule(rule_head=self, rule_body=derivation)
        if rule_object in self.rules:
            self.rules.remove(rule_object)
            self.fit_probability_distribution()

    def remove_by_index(self, index):
        self.rules.remove(self.rules[index])
        self.fit_probability_distribution()

    def expand(self, markup=None):
        if markup is None:
            markup = set()

        """Expand this nonterminal symbol by probabilistically choosing a production rule."""
        new_markup = markup | self.markup
        selected_rule = self._pick_a_production_rule()
        return selected_rule.derive(new_markup)

    def expand_rule(self, index):
        if self.rules[index]:
            print(self.rules[index])
            print("wow")
            print(self.markup)
            return self.rules[index].derive(self.markup)

    def set_deep(self, truthy):
        self.deep = truthy

    def add_markup(self, markup):
        """
        adds markup to a given nonterminalSymbol
        """
        if markup and markup not in list(self.markup):
            self.markup.add(markup)

    def remove_markup(self, markup):
        for markup_tags in list(self.markup):
            if markup == markup_tags:
                self.markup.remove(markup_tags)

    def monte_carlo_expand(self, samplesscalar=1, markup=None):
        """
        probabilistically expand our nonterminal
        samplesScalar*n times, where n is the number of productions rules
        at our particular level
        returns an array containing the n samples of the productions for self
        """
        if markup is None:
            markup = set()
        # expand n times
        rule_choices = []
        ret_list = []
        if len(self.rules) != 0:
            times = len(self.rules) * samplesscalar
        else:
            times = 1

        # union the set of our markup and the markup we are called with
        new_markup = self.markup | markup
        chosen = []

        for _ in range(times):
            selected_rule = self._pick_a_production_rule()
            chosen.append(selected_rule)
            rule_choices.append(IntermediateDeriv(new_markup, selected_rule))

        # ensure each possible production occurs at least once

        for rule in self.rules:
            if rule not in chosen:
                rule_choices.append(IntermediateDeriv(new_markup, rule))

        for derivation in rule_choices:
            # expand the rule if possible
            ret_list.append(derivation.mcm_derive(samplesscalar, new_markup))

        # there has to be a better way to do this
        is_list = 1
        for derivations in ret_list:
            if not isinstance(derivations, list):
                is_list = 0

        if is_list:
            ret_list = list(itertools.chain(*ret_list))

        return ret_list

    def exhaustively_and_nonprobabilistically_expand(self, markup=None):
        """Exhaustively expand this nonterminal symbol using each of its production rules once and only once.

        If a production rule includes an embedded nonterminal symbol that has not been expanded yet,
        this method will make a call to this same method for that nonterminal symbol to recursively
        expand it. In this way, another symbol may call this method for this symbol if it needs to expand
        it for one of its production rules. Because we don't care about probabilities, but rather
        exhaustive expansion, we can just save the results from the first time this method is called so
        that we never do the computation more than once.
        """
        if not self.all_possible_expansions:
            # Collect all of the mark-up that we have accumulated at this point
            accumulated_markup = self.markup if markup is None else self.markup | markup
            # Prepare intermediate derivations for each of the production rules associated
            # with this symbol
            intermediate_derivations = [
                IntermediateDeriv(markup=accumulated_markup, expansion=rule) for rule in self.rules
                ]
            # Fire the production rules associated with these intermediate derivations
            expanded_intermediate_derivations = []
            for intermediate_derivation in intermediate_derivations:
                expanded_intermediate_derivations.append(
                    intermediate_derivation.exhaustively_and_nonprobabilistically_derive(markup=accumulated_markup)
                )
            # Flatten out the list (JOR: not sure why exactly)
            flattened_list_of_expanded_intermediate_derivations = list(
                itertools.chain(*expanded_intermediate_derivations)
            )
            self.all_possible_expansions = flattened_list_of_expanded_intermediate_derivations
        return self.all_possible_expansions

    def _pick_a_production_rule(self):
        """Probabilistically select a production rule."""
        if self.rules:
            x = random.random()
            selected_rule = next(
                rule for rule in self.rules_probability_distribution if (
                    self.rules_probability_distribution[rule][0] < x <
                    self.rules_probability_distribution[rule][1])
            )
            return selected_rule
        else:
            # if there are no rules for the nonterminal, return empty string
            return Rule(self, [TerminalSymbol(self.__str__())])

    def n_terminal_expansions(self):
        """Return the number of possible terminal expansions of this symbol."""
        return sum(rule.n_terminal_expansions() for rule in self.rules)

    def __str__(self):
        return '[[' + self.tag.__str__() + ']]'

    def __repr__(self):
        return self.__str__()

    def fit_probability_distribution(self):
        """Return a probability distribution fitted to the given application-rates dictionary."""
        if self.rules:
            application_rates_dictionary = {rule: rule.application_rate for rule in self.rules}
            frequencies_sum = float(sum(application_rates_dictionary.values()))
            probabilities = {}
            for k in application_rates_dictionary.keys():
                frequency = application_rates_dictionary[k]
                probability = frequency / frequencies_sum
                probabilities[k] = probability
            fitted_probability_distribution = {}
            current_bound = 0.0
            for k in probabilities:
                probability = probabilities[k]
                probability_range_for_k = (current_bound, current_bound + probability)
                fitted_probability_distribution[k] = probability_range_for_k
                current_bound += probability
            # Make sure the last bound indeed extends to 1.0
            last_bound_attributed = list(probabilities)[-1]
            fitted_probability_distribution[last_bound_attributed] = (
                fitted_probability_distribution[last_bound_attributed][0], 1.0
            )
            self.rules_probability_distribution = fitted_probability_distribution
