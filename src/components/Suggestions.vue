<template>
	<div>
		<div v-for="suggestion in suggestions">
			<Suggestion
				:suggestion="suggestion"
				:selectSuggestion="() => this.selectSuggestion(suggestion)"
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