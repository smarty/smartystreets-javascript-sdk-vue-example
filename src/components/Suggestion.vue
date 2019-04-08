<template>
	<div>Suggestion!</div>
</template>

<script>
	export default {
		name: "Suggestion",
		props: {
			"suggestions": Array,
			"selectSuggestion": Function,
		},
	};
</script>

<style lang="scss" scoped>
	@import "Suggestion";
</style>