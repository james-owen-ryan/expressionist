class Markup(object):
    """
    individual instance of markup, found as a list within NonterminalSymbol
    note:nonterminals do not have markup associated by default,
    add it using nonterminal.add_Markup
    """

    def __init__(self, tag, tagset):
        """
        create new markup belonging to tagset with given tag
        :type tag: str
        :type tagset: MarkupSet
        """
        self.tag = tag
        self.tagset = tagset
        self.time_of_definition_index = tagset.assign_time_of_definition_index()
        # add ourself to our markup

    def __eq__(self, other):
        if isinstance(other, Markup):
            return str(self.tag) == str(other.tag) and str(self.tagset) == str(other.tagset)
        else:
            return False

    def __hash__(self):
        return self.__str__().__hash__()

    def __str__(self):
        return self.tagset.__str__() + ":" + self.tag.__str__()

    def __repr__(self):
        return self.__str__()


class MarkupSet(object):
    """
    Each MarkupSet has many Markup objects
    stored in a set
    """

    def __init__(self, tagset):
        self.tagset = tagset
        self.markups = set()
        # This increments as new tags are defined to allow sorting of drop-down
        # menus in the authoring interface by time of tag definition, e.g.,
        # an ordering with the most recently defined tags listed first
        self.current_time_of_definition_index = -1

    def __eq__(self, other):
        if isinstance(other, MarkupSet):
            return str(self.tagset) == str(other.tagset)
        else:
            return False

    def add_markup(self, markup):
        """
        add a markup to ourself
        """
        if markup.tagset == self.tagset:
            self.markups.add(markup)

    def remove_markup(self, markup):
        """
        remove a markup from our set
        """
        if markup.tagset == self.tagset and markup in self.markups:
            self.markups.remove(markup)

    def assign_time_of_definition_index(self):
        """Increment the current time-of-definition index and then return the result."""
        self.current_time_of_definition_index += 1
        return self.current_time_of_definition_index

    def __str__(self):
        return self.tagset.__str__()

    def __repr__(self):
        return self.__str__()
