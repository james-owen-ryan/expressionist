import os
import sys
import time
import itertools
from productionist import Productionist


class Completionist(object):
    """A class for exhaustively generating all possible outputs of a grammar."""

    def __init__(self, content_bundle_name, content_bundle_directory, output_parent_directory, max_file_size,
                 log_progress=False, value_ignore_function=None):
        """Initialize a Completionist object."""
        # Prepare a Productionist module
        self.productionist = Productionist(
            content_bundle_name=content_bundle_name,
            content_bundle_directory=content_bundle_directory,
            verbosity=0
        )
        self.value_ignore_function = value_ignore_function
        # Create a directory in which we will place the output directory, using the current UNIX time as an identifier
        self.output_directory = os.path.join(output_parent_directory, str(int(time.time())))
        os.makedirs(self.output_directory)
        self.max_file_size = max_file_size
        self.current_outfile_identifier = -1
        # Grab the total number of generable outputs in this content bundle (to prepare for logging)
        stats_filename = "{bundle}.stats".format(bundle=content_bundle_name)
        self.todo = int(
            open(os.path.join(content_bundle_directory, stats_filename)).readlines()[0].split('\t')[1].strip('\n')
        )
        self.logging = log_progress
        # Exhaust the content bundle to write all possible outputs to files in the output directory that
        # we just created
        self.exhaust()

    def exhaust(self):
        """Exhaust the content bundle to write all possible outputs to file."""
        # Prepare logging variables
        start_time = time.time()
        total_lines_written = 0.0  # Float to support easy percentage calculation below
        # Prepare an initial output file
        outfile = self._next_outfile()
        # Start generating possible outputs and writing them to file
        for symbol in self.productionist.grammar.nonterminal_symbols:
            if symbol.expansions_are_complete_outputs:
                for output in self._exhaustively_derive_expansions_of_nonterminal_symbol(nonterminal_symbol=symbol):
                    line_for_this_output = self._outfile_line_for_output(output=output)
                    outfile.write(line_for_this_output)
                    total_lines_written += 1
                    # Print out progress, if desired
                    if self.logging and total_lines_written % 10000 == 0:
                        outfile_size_in_mb = outfile.tell() / 1000000.
                        if outfile_size_in_mb >= self.max_file_size:
                            # Close the current outfile and start a new one
                            outfile.close()
                            outfile = self._next_outfile()
                        percent_done = round(total_lines_written/self.todo, 5)
                        time_spent_so_far = time.time() - start_time
                        time_per_output = time_spent_so_far/total_lines_written
                        number_of_outputs_remaining = self.todo-total_lines_written
                        time_remaining = time_per_output * number_of_outputs_remaining
                        hours_remaining = int(round(time_remaining/60/60.))
                        update = "{percentage:.5f}% done (~{hours} hour{s} remaining)".format(
                            percentage=float(percent_done),
                            hours=hours_remaining,
                            s='s' if hours_remaining != 1 else ''
                        )
                        sys.stdout.write('\r')
                        sys.stdout.flush()
                        sys.stdout.write(update)
                        sys.stdout.flush()
        outfile.close()

    def _exhaustively_derive_expansions_of_nonterminal_symbol(self, nonterminal_symbol):
        """Exhaustively derive all possible expansions of the given nonterminal symbol.

        If a production rule of this symbol references another nonterminal that has not been expanded yet,
        this method will make a call to this same method for that nonterminal symbol to recursively
        expand it. In this way, another symbol may call this method for this symbol if it needs to expand
        it to execute one of its production rules. We'll make heavy use of generators in this method,
        so that we only ever keep one expansion in memory at a time.
        """
        all_terminal_results = (
            self._exhaustively_derive_results_of_production_rule(production_rule=production_rule)
            for production_rule in nonterminal_symbol.production_rules
        )
        for terminal_result in itertools.chain.from_iterable(all_terminal_results):
            terminal_result_with_interleaved_execution_trace = "$BOUND$nt={symbol_name}$BOUND${result}".format(
                symbol_name=nonterminal_symbol.name,
                result=terminal_result
            )
            yield terminal_result_with_interleaved_execution_trace

    def _exhaustively_derive_results_of_production_rule(self, production_rule):
        """Exhaustively derive all possible results of executing the given production rule."""
        all_component_variations = (
            self._exhaustively_derive_expansions_of_nonterminal_symbol(nonterminal_symbol=symbol)
            if symbol.__class__.__name__ == 'NonterminalSymbol' else [symbol]
            for symbol in production_rule.body
        )
        all_possible_results = itertools.product(*all_component_variations)
        for result in all_possible_results:
            yield ''.join(result)

    def _next_outfile(self):
        """Return a next outfile in which to write outputs."""
        self.current_outfile_identifier += 1
        next_filename = '{identifier}.tsv'.format(identifier=self.current_outfile_identifier)
        path_to_next_outfile = os.path.join(self.output_directory, next_filename)
        outfile = open(path_to_next_outfile, 'w')
        return outfile

    def _outfile_line_for_output(self, output):
        """Return an outfile line for the given output."""
        # Process this output, which interleaves generated surface text with references to the
        # nonterminal symbols that were expanded to produce that surface text
        surface_text_segments = []
        nonterminal_symbol_names = []
        components = output.split('$BOUND$')
        for component in components:
            if component.startswith('nt='):
                nonterminal_symbol_name = component[3:]  # Strip off the leading 'nt='
                if not (self.value_ignore_function and self.value_ignore_function(value=nonterminal_symbol_name)):
                    nonterminal_symbol_names.append(nonterminal_symbol_name)
            else:
                surface_text_segments.append(component)
        # Produce a tab-separated line coupling the surface text (left of the tab delimiter) with the list of
        # nonterminal symbols that were expanded to produce the surface text (right of the tab delimiter)
        outfile_line = '{surface_text}\t{trace}\n'.format(
            surface_text=''.join(surface_text_segments),  # These already included whitespace as appropriate
            trace=' '.join(nonterminal_symbol_names)
        )
        return outfile_line


if __name__ == '__main__':
    # See potential usage for IGNORE_LIST below
    # IGNORE_LIST = ['certain-symbol-name', 'other symbol', 'someAdditionalValue']
    Completionist(
        content_bundle_name='nameOfContentBundleToExhaust',
        content_bundle_directory='/path/to/content/bundle/to/exhaust',
        output_parent_directory='/path/to/directory/that/outputs/subdirectory/will/be/written/to',
        max_file_size=300,  # The max file size for each individual output file (this is only approximately enforced)
        log_progress=True,  # Whether to log progress (this will slow down the process)
        # A value-ignore function can be used to exclude certain values from the output file (values are
        # the components on the right of the tab delimiter in an output file), which will save space; pass
        # None to this argument to include all values
        value_ignore_function=None
        # value_ignore_function=lambda value: value.startswith('_')  # Ignore values with leading underscore
        # value_ignore_function = lambda value: value in IGNORE_LIST  # Ignore values in IGNORE_LIST, from above
    )
