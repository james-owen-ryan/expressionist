from tags import Markup, MarkupSet
from nonterminal_symbol import NonterminalSymbol
from grammar import parse_rule, PCFG

test = PCFG()

ask_day = NonterminalSymbol('ask_day', deep = True)

test.add_nonterminal(ask_day)
ask_day_prod1 = parse_rule("[[greetings]] [[pleasantry]] [[ask]]")
ask_day_prod2 = parse_rule("[[greetings]] [[rude]] [[ask]]")

test.add_rule(ask_day, ask_day_prod1, 10)
test.add_rule(ask_day, ask_day_prod2, 3)

pleasantry_prod1 = parse_rule("This [weather] weather is sure crazy, isn't it?")
pleasantry_prod2 = parse_rule("Did you see the [speaker.sportsTeam] game, it was crazy!")
pleasantry_prod3 = parse_rule("Can you believe what happened on the [news.channel] last night?!")


rude_prod1 = parse_rule("As ugly as ever, I see!")
rude_prod2 = parse_rule("Time has been as unkind to you as it has to [world.celebrity]!")
rude_prod3 = parse_rule("You remain as despicable as ever, it would seem.")

greetings_prod1 = parse_rule("Hey, long time no see, [subject.name].")
greetings_prod2 = parse_rule("Is that you, [subject.name]?")
greetings_prod3 = parse_rule("I haven't seen you in forever, [subject.name]!")

ask_prod1 = parse_rule("What have you been up to today?")
ask_prod2 = parse_rule("What have you been doing this fine [dayofweek]?")
ask_prod3 = parse_rule("What have you been occupying yourself with beautiful [day.time]")

greetings = NonterminalSymbol('greetings')
ask = NonterminalSymbol('ask')
rude = NonterminalSymbol('rude')
pleasantry = NonterminalSymbol('pleasantry')
empty_expand = NonterminalSymbol('EMPTY')

test.add_rule(greetings, greetings_prod1, 5)
test.add_rule(greetings, greetings_prod2, 3)
test.add_rule(greetings, greetings_prod3, 3)


test.add_rule(pleasantry, pleasantry_prod1, 4)
test.add_rule(pleasantry, pleasantry_prod2, 2)
test.add_rule(pleasantry, pleasantry_prod3, 3)

test.add_rule(rude, rude_prod1, 8)
test.add_rule(rude, rude_prod2, 10)
test.add_rule(rude, rude_prod3, 7)

test.add_rule(ask, ask_prod1, 5)
test.add_rule(ask, ask_prod2, 10)
test.add_rule(ask, ask_prod3, 8)
test.add_rule(ask, [empty_expand], 5)

SPEECH_ACT = MarkupSet("speech_act")
TONE = MarkupSet("tone")

ask_day_markup = Markup("THISISATEST", SPEECH_ACT)
greetings_markup = Markup("hello", SPEECH_ACT)
pleasantry_markup = Markup("polite", TONE)
rude_markup = Markup("impolite", TONE)
ask_markup = Markup("question", SPEECH_ACT)
empty_markup = Markup("EMPTYQUESTION", SPEECH_ACT)

test.add_markup(ask_day, ask_day_markup)

test.add_markup(greetings, greetings_markup)
test.add_markup(pleasantry, pleasantry_markup)
test.add_markup(rude, rude_markup)

test.add_markup(ask, ask_markup)
test.add_markup(empty_expand, empty_markup)

"""
now let's do a simpler grammar
"""
