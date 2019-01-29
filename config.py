# Whether to export expressible meanings with duplicate tags, in the case that multiple instances
# of the same tag would be attached to any meaning; note that exporting duplicate tags will expand
# the space of expressible meanings, which could incur memory and (likely minor) speed issues (i.e.,
# this parameter should only be turned on in cases where the number of instances of the same tag
# is semantically or operationally meaningful)
EXPORT_DUPLICATE_TAGS_ON_EXPRESSIBLE_MEANINGS = False
TRIE_OUTPUT = False
# The repetition penalty causes text to be reused less frequently
PRODUCTIONIST_REPETITION_PENALTY_MULTIPLIER = 0.033  # Initially 30 times less likely to be used after first usage
PRODUCTIONIST_REPETITION_PENALTY_RECOVERY_RATE = 1.2  # Sheds 15% of its current penalty after each non-usage instance
