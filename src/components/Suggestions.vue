<template>
	<div>
		Hi
		<div v-for="suggestion in suggestions">
			<Suggestion
				:suggestion="suggestion"
				selectSuggestion="() => selectSuggestion(suggestion)"
			/>
		</div>
	</div>
</template>

<script>
	import Suggestion from "./Suggestion";

	export default {
		name: "Suggestions",
		components: {Suggestion},
		props: {
			"suggestions": Array,
			"selectSuggestion": Function,
		},
	};
</script>