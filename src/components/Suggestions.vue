<template>
	<div>
		<div v-for="suggestion in suggestions">
			<Suggestion
				:suggestion="suggestion"
				:selectSuggestion="selectSuggestion"
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