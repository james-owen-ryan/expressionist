import json

from Markups import Markup


class IntermediateDeriv(object):
    """
    This class is used in the probabilistic Monte Carlo Expansions to associate markup with
    productions
    markup contains all markup which led to a particular string being formed
    expansion contains that string
    these are then joined at the end
    """

    def __init__(self, markup, expansion):
        self.markup = markup
        self.expansion = expansion
        self.probability = 1

    def __eq__(self, other):
        if isinstance(other, IntermediateDeriv):
            return self.__str__() == other.__str__()
        else:
            return False

    def __str__(self):
        return self.expansion.__str__() + " MARKUP" + self.markup.__str__()

    def __add__(self, other):
        # if adding two derivations together, add them
        if isinstance(other, IntermediateDeriv):

            return IntermediateDeriv(self.markup | other.markup, self.expansion + other.expansion)
        # if adding markup to a derivation, only add markup, preserve expansion
        else:
            return IntermediateDeriv(self.markup | other, self.expansion)

    def __lt__(self, other):
        return self.expansion < other.expansion

    def __radd__(self, other):
        if other == 0:
            return self
        else:
            return self.__add__(other)

    def __repr__(self):
        return self.__str__()

    def __hash__(self):
        return hash((self.expansion))

    def to_json(self):

        def set_default(obj):
            if isinstance(obj, Markup):
                return obj.__str__()

        return json.dumps({"derivation": self.expansion.__str__(), "markup": list(self.markup)}, default=set_default)

    def mcm_derive(self, samplesscalar, markup):
        return self.expansion.mcm_derive(samplesscalar, markup)

    def exhaustively_and_nonprobabilistically_derive(self, markup):
        """"""
        return self.expansion.exhaustively_and_nonprobabilistically_derive(markup=markup)
