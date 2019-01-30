import itertools
import operator


class Rule(object):
    """A production rule in a grammar."""

    def __init__(self, rule_head, rule_body, application_rate=1, preconditions_str="", effects_str=""):
        """Initialize a Rule object.
        :param rule_head: Nonterminal symbol(lhs) for this rule
        :type rule_head: nonterminal_symbol.NonterminalSymbol
        :param rule_body: Derivation of the NonterminalSymbol
        :type rule_body: list()
        :param application_rate: application_rate(probability) for this rule
        """
        self.head = rule_head  # NonterminalSymbol that is lhs of rule
        self.body = rule_body  # An ordered list of nonterminal and terminal symbols
        self.application_rate = application_rate
        self.preconditions = preconditions_str
        self.effects = effects_str
        # This attribute holds a list containing all possible derivations of this rule (each being represented by
        # an agglomerated IntermediateDerivation object); it's built once and only once the first time
        # self.exhaustively_and_nonprobabilistically_derive() is called
        self.all_possible_derivations = None

    def __eq__(self, other):
        # equality does not consider application_rate
        if isinstance(other, Rule):
            return self.head.tag == other.head.tag and self.body == other.body
        else:
            return False

    def __str__(self):
        return self.head.__str__() + ' -> ' + self.body.__str__()

    def __repr__(self):
        return self.__str__()

    def modify_derivation(self, expansion):
        """Update the right-hand side (expansion) for this rule."""
        self.body = expansion

    def modify_application_rate(self, application_rate):
        """
        change the application rate for this rule
        """
        self.application_rate = application_rate

    def derive(self, markup=None):
        """Carry out the derivation specified for this rule."""
        if markup is None:
            markup = set()
        return (sum(symbol.expand(markup=markup) for symbol in self.body))

    def derivation_json(self):
        def stringify(x): return x.__str__()

        return map(stringify, self.body)

    def mcm_derive(self, samplesscalar, markup):
        """carry out montecarlo derivation for this rule"""
        ret_list = []
        # for each value in derivation side of the rule
        for symbol in self.body:
            # if the symbol is a nonterminal, monte_carlo_expand returns an array
            if type(symbol) == "NonterminalSymbol":
                # List containing the mcm expansions for a given symbol
                ret_list.append(symbol.monte_carlo_expand(samplesscalar, markup))
                # samples should be intermediate derivations
            else:
                toadd = []
                toadd.append(symbol.monte_carlo_expand(markup))
                ret_list.append(toadd)

        # ret list should be a list of lists
        # either TerminalSymbols or Nonterminals Symbols
        # take this and construct a list of TerminalSymbols and singleNonterminalSymbols
        # this means represent each possible combination of NonterminalSymbols

        # ret list contains the cartesian product of its subsets, representing all possible
        # combinations of derivations
        ret_list = list(itertools.product(*ret_list))

        final = []
        for values in ret_list:
            final.append(sum(values))

        # at this point, ret list should be a list of the Intermediate derivations
        # ret_list = list(itertools.chain.from_iterable(ret_list))
        return final

    def exhaustively_and_nonprobabilistically_derive(self, markup):
        global N_RULES_FIRED
        N_RULES_FIRED += 1
        print "{}: {}".format(N_RULES_FIRED, self)
        if not self.all_possible_derivations:
            # Build up a list containing all the possible intermediate derivations for each
            # symbol that is used in this rule
            intermediate_derivations = []
            for symbol in self.body:
                if type(symbol) == "NonterminalSymbol":
                    # If a symbol is nonterminal, then calling exhaustively_and_nonprobabilistically_expand()
                    # for it will return a list of IntermediateDerivation objects
                    intermediate_derivations.append(symbol.exhaustively_and_nonprobabilistically_expand(markup=markup))
                else:
                    # If a symbol is terminal, calling exhaustively_and_nonprobabilistically_expand() for it
                    # will return a single IntermediateDerivation that expands to the string representing the
                    # nonterminal symbol; as such, we need to wrap this object up in a list before we append it
                    intermediate_derivations.append(
                        [symbol.exhaustively_and_nonprobabilistically_expand(markup=markup)]
                    )
            # To exhaustively compute all possible intermediate derivations for this symbol, we
            # simply take the Cartesian product of the list of lists that we have just built
            all_possible_combinations_of_intermediate_derivations = list(itertools.product(*intermediate_derivations))
            # Now we can yield new intermediate derivations for each of these combinations
            # that combines the string expansions and annotations of all the intermediate derivations
            # in the combination
            new_combined_intermediate_derivations = [
                sum(combination_of_intermediate_derivations) + self.markup for
                combination_of_intermediate_derivations in all_possible_combinations_of_intermediate_derivations
                ]
            self.all_possible_derivations = new_combined_intermediate_derivations
        return self.all_possible_derivations

    def n_terminal_expansions(self):
        """Return the number of possible terminal expansions of this rule."""
        # Since there's no product() built-in function in Python that works like sum()
        # does, we have to use this ugly reduce thing
        n_terminal_expansions = (
            reduce(operator.mul, (symbol.n_terminal_expansions() for symbol in self.body), 1)
        )
        return n_terminal_expansions
