export function formatSuggestion(suggestion) {
	const secondary = suggestion.secondary ? ` ${suggestion.secondary}` : "";
	const entries = suggestion.entries > 1 ? ` (${suggestion.entries} more entries)` : "";
	const address = suggestion.streetLine + secondary + entries + " " + suggestion.city + ", " + suggestion.state + " " + suggestion.zipcode;
	const selected = suggestion.streetLine + secondary + " (" + suggestion.entries + ") " + suggestion.city + ", " + suggestion.state + " " + suggestion.zipcode;

	return {
		address,
		selected,
	};
}