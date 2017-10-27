"""import unittest for running tests"""
import unittest

from IntermediateDeriv import IntermediateDeriv
from Markups import Markup, MarkupSet
from NonterminalSymbol import NonterminalSymbol
from PCFG import parse_rule, PCFG
from Rule import Rule
from Terminals import TerminalSymbol, SystemVar


class TestNonterminalEquivalency(unittest.TestCase):
    """
    Testing Equivalency of NonterminalSymbols
    """

    def setUp(self):
        self.a_nonterminal = NonterminalSymbol('A')
        self.b_nonterminal = NonterminalSymbol('A')
        self.aaa = NonterminalSymbol('AAA')
        self.bbb = NonterminalSymbol('BBB')

    def test_should_eq_each_other(self):
        """identical nonterminals should equal eachother"""
        self.assertEqual(self.a_nonterminal, self.b_nonterminal)

    def test_different_not_eq(self):
        """nonidentical nonterminals should not equal eachother"""
        self.assertNotEqual(self.aaa, self.bbb)

    def test_different_rules_not_eq(self):
        """Nonterminals with the same tag but different rules should not equal eachother"""
        a_rule = parse_rule("[[Test of]] rule parsing")
        self.a_nonterminal.add_rule(a_rule)
        self.assertEqual(self.a_nonterminal.tag, self.b_nonterminal.tag)
        self.assertNotEqual(self.a_nonterminal, self.b_nonterminal)

    def test_different_markup_not_eq(self):
        """
        Heaven forbid you had two nonterminals with the same tag but different markup, they should
        not equal eachother
        """

        MRK_SET1 = MarkupSet('A_MARKUP')
        MRK_SET2 = MarkupSet('B_MARKUP')
        MRK_1 = Markup('AAA', MRK_SET1)
        MRK_2 = Markup('BBB', MRK_SET2)

        self.a_nonterminal.add_markup(MRK_1)
        self.b_nonterminal.add_markup(MRK_2)

        self.assertIn(MRK_1, self.a_nonterminal.markup)
        self.assertIn(MRK_1, self.a_nonterminal.markup)
        self.assertNotEqual(self.a_nonterminal, self.b_nonterminal)


class TestRuleEquivalency(unittest.TestCase):
    """
    Test equivalency of Rules
    """

    def setUp(self):
        self.a_derivation = parse_rule("[[Test]] of [rule] {parsing}")
        self.a_nonterminal = NonterminalSymbol('A')
        self.a_rule = Rule(self.a_nonterminal, self.a_derivation, application_rate=1)
        self.b_rule = Rule(self.a_nonterminal, self.a_derivation, application_rate=1)

    def test_equal_rules(self):
        """Identical Rules Should equal eachother"""
        self.assertEqual(self.a_rule, self.b_rule)

    def test_different_app_rates(self):
        """Identical Rules with different application_rates should eq"""
        self.b_rule.application_rate = 3
        self.assertNotEqual(self.a_rule.application_rate, self.b_rule.application_rate)
        self.assertEqual(self.a_rule, self.b_rule)

    def test_different_derivations(self):
        """
        Rules with identical symbols but different derivations should not eq
        """
        c_derivation = parse_rule("[[haha]] we're testing it again")
        c_nonterminal = self.a_nonterminal
        c_rule = Rule(c_nonterminal, c_derivation)
        self.assertNotEqual(c_rule, self.a_rule)

    def test_different_symbols(self):
        """
        Rules with identical derivations but different symbols should not eq
        """
        c_nonterminal = NonterminalSymbol('c')
        c_rule = Rule(c_nonterminal, self.a_derivation)
        self.assertNotEqual(c_rule, self.a_rule)


class TestPcfgOperations(unittest.TestCase):
    """
    Testing operations on a PCFG
    """

    def setUp(self):
        self.test_gram = PCFG()
        self.nonterminal = NonterminalSymbol('a')
        self.markup_class = MarkupSet('TEST_MARKUP')
        self.markup = Markup("MARKUP", self.markup_class)

    def test_add_nonterminal(self):
        """
        test adding a nonterminal to a PCFG
        """
        nonterminal = NonterminalSymbol('a')
        self.test_gram.add_nonterminal(nonterminal)
        test_nonterminals = {'a': NonterminalSymbol('a')}
        self.assertEqual(self.test_gram.nonterminals, test_nonterminals)

    def test_add_rule(self):
        """
        test adding a rule to an existing nonterminal in PCFG
        """
        self.test_gram.add_nonterminal(self.nonterminal)
        test_derivation = [NonterminalSymbol('b'), "aaaaade"]
        self.test_gram.add_rule(self.nonterminal, test_derivation)
        test_rules = [Rule(self.nonterminal, test_derivation)]
        self.assertEqual(self.test_gram.nonterminals.get(str(self.nonterminal.tag)).rules, test_rules)

    def test_remove_rule(self):
        """
        test that it successfully removes an implemented rule
        """
        self.test_gram.add_nonterminal(self.nonterminal)
        test_derivation = [NonterminalSymbol('b'), "aaaaade"]
        self.test_gram.remove_rule(self.nonterminal, test_derivation)
        self.assertEqual(self.test_gram.nonterminals.get(str(self.nonterminal.tag)).rules, [])

    def test_expansion(self):
        """
        test expansions of our grammar
        """
        self.test_gram.add_nonterminal(self.nonterminal)
        a_prod = parse_rule("[[b]], this is a test of expansion")
        self.test_gram.add_rule(self.nonterminal, a_prod)
        self.test_gram.add_nonterminal(a_prod[0])
        b_prod = parse_rule("Wow")
        self.test_gram.add_rule(a_prod[0], b_prod)
        test_string = "Wow, this is a test of expansion"
        test_deriv = IntermediateDeriv(set(), TerminalSymbol("Wow, this is a test of expansion"))

        self.assertEqual(self.test_gram.expand(NonterminalSymbol('a')), test_deriv)

    def test_recursive_nt_addition(self):
        """
        add_rule should add all nonterminals present in derivation
        that are not in the grammar to the grammar
        """
        self.test_gram.add_nonterminal(self.nonterminal)
        a_prod = parse_rule("[[b]], this is a test of expansion")
        self.test_gram.add_rule(self.nonterminal, a_prod)
        self.assertEqual(2, len(self.test_gram.nonterminals))

    def test_markup_class_addition(self):
        """
        tests to ensure that if we add a markup to a nonterminal, and that markup class does not already
        exist within our PCFG markup class list, we add it to the markup class list
        """
        self.nonterminal.add_markup(self.markup)
        self.test_gram.add_nonterminal(self.nonterminal)
        test = set()
        test.add(self.markup)
        self.assertEqual(self.test_gram.markup_class[self.markup.tagset.__str__()], test)

    def test_expansion_returns_markup(self):
        """make sure our expansions return markup correctly"""

        self.nonterminal.add_markup(self.markup)
        self.test_gram.add_nonterminal(self.nonterminal)

    def test_empty_expansion(self):
        """
        test that expansions of nonterminals with no productions works correctly
        """
        self.test_gram.add_nonterminal(self.nonterminal)
        a_prod = parse_rule("[[b]], this is a test of expansion")
        self.test_gram.add_rule(self.nonterminal, a_prod)
        self.test_gram.add_nonterminal(a_prod[0])
        test_string = IntermediateDeriv(set(), "[[b]], this is a test of expansion")
        self.assertEqual(self.test_gram.expand(NonterminalSymbol('a')), test_string)

    def test_modify_app_rate(self):
        """
        test that application rates are correctly modified
        """
        self.test_gram.add_nonterminal(self.nonterminal)
        a_prob = parse_rule("test of application_rate")
        self.test_gram.add_rule(self.nonterminal, a_prob)
        old_app = self.test_gram.nonterminals.get(str(self.nonterminal.tag)).rules[0].application_rate
        self.test_gram.modify_application_rate(self.nonterminal, 0, 5)
        new_app = self.test_gram.nonterminals.get(str(self.nonterminal.tag)).rules[0].application_rate
        self.assertNotEqual(old_app, new_app)
        self.assertEqual(new_app, 5)

    def test_returns_system_vars(self):
        """
        test that our function correctly returns the list of system variables
        defined by the user within the program
        """
        self.test_gram.add_nonterminal(self.nonterminal)
        system_var_prod = parse_rule("[[affimative]], [name], [[I think]] his hair is[hair_color]")
        self.test_gram.add_rule(self.nonterminal, system_var_prod)
        self.assertEqual(2, len(self.test_gram.system_vars))
        system_var_prod_2 = parse_rule("Ah yes, [player_name]")
        self.test_gram.add_rule(system_var_prod[0], system_var_prod_2)
        self.assertEqual(3, len(self.test_gram.system_vars))
        test_system_vars = []
        test_system_vars.append(SystemVar("name"))
        test_system_vars.append(SystemVar("hair_color"))
        test_system_vars.append(SystemVar("player_name"))
        self.assertEqual(test_system_vars, self.test_gram.system_vars)


if __name__ == '__main__':
    unittest.main()
