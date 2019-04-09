<template>
	<div
		v-bind:class="buildResultHoverClass()"
		v-on:click="() => selectSuggestion(suggestion)"
		v-on:mouseenter="() => setIsHovered(true)"
		v-on:mouseleave="() => setIsHovered(false)"
	>
		{{ suggestion.text }}
	</div>
</template>

<script>
	export default {
		name: "Suggestion",
		props: {
			"suggestion": Object,
			"selectSuggestion": Function,
		},
		data() {
			return {
				isHovered: false,
			};
		},
		methods: {
			setIsHovered(isHovered) {
				this.isHovered = isHovered;
			},
			buildResultHoverClass() {
				const className = "autocomplete--suggestion";
				return this.isHovered ? className + " autocomplete--suggestion-hover" : className;
			},
		},
	};
</script>

<style lang="scss" scoped>
	@import "Suggestion";
</style>