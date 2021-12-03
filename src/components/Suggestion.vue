<template>
	<div class="autocomplete--suggestion" v-on:click="() => selectSuggestion(suggestion)">
		{{ formatSuggestion(suggestion).address }}
	</div>
</template>

<script>
  import {formatSuggestion} from "../../utils.js";

  export default {
		name: "Suggestion",
		props: {
			"suggestion": Object,
			"selectSuggestion": Function,
		},
    methods: {
      formatSuggestion,
    }
	};
</script>

<style lang="scss" scoped>
	@import "Suggestion";
</style>