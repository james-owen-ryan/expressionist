from IntermediateDeriv import IntermediateDeriv


class TerminalSymbol(object):
    """A terminal symbol in a grammar."""

    def __init__(self, representation):
        """Initialize a NonterminalSymbol object.
        :param representation: string value of Terminal
        :type representation: string
        """
        self.representation = representation
        self.markup = set()

    def __eq__(self, other):
        if isinstance(other, TerminalSymbol):
            return self.representation == other.representation
        else:
            return False

    def expand(self, markup=None):
        """Return this terminal symbol."""
        if markup is None:
            markup = set()
        return IntermediateDeriv(self.markup | markup, str(self))

    def monte_carlo_expand(self, markup):
        """
        this is not a nonterminal, so the monte carlo_expand is the same as the normal expand
        """
        return self.expand(markup)

    def exhaustively_and_nonprobabilistically_expand(self, markup):
        return self.expand(markup=markup)

    def n_terminal_expansions(self):
        """Return the number of possible terminal expansions of this symbol."""
        return 1

    def __str__(self):
        return self.representation.__str__()

    def __repr__(self):
        return self.__str__()


class SystemVar(TerminalSymbol):
    """
    class to handle systemVariables which are processed by game engine
    instead of Expressionist, separate from TerminalSymbol so that
    we can provide a list of all systemVar easily
    """

    def __init__(self, representation):
        TerminalSymbol.__init__(self, representation)

    def __str__(self):
        return "[" + str(self.representation) + "]"

    def __repr__(self):
        return self.__str__()

    def __cmp__(self, other):
        # ughhh
        if isinstance(other, SystemVar):
            if str(self) < str(other):  # compare name value (should be unique)
                return -1
            elif str(self) > str(other):
                return 1
            else:
                return 0  # should mean it's the same instance
        else:
            return 0
