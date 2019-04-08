<template>
	<form class="autocomplete--input-form">
		<div class="autocomplete--input-group">
			<label
				for="shouldValidate"
				class="autocomplete--input-label"
			>
				Validate on Selection
			</label>
			<input
				class="autocomplete--input-field"
				id="shouldValidate"
				type="checkbox"
				v-model="data.shouldValidate"
			/>
		</div>
		<div
			class="autocomplete--input-group"
			v-for="inputField in inputFields">
			<label
				class="autocomplete--input-label"
				:for="inputField.fieldName"
			>
				{{ inputField.fieldLabel }}
			</label>
			<input
				class="autocomplete--input-field"
				type="text"
				:id="inputField.fieldName"
				v-model="data[inputField.fieldName]"
				v-on:keyup="e => {if(e.target.id === 'address1') {data.queryAutocompleteForSuggestions(e.target.value)}}"
			/>
		</div>
		<div class="autocomplete--input-group">
			<label
				class="autocomplete--input-label"
				for="country"
			>
				Country
			</label>
			<select id="country" class="autocomplete--input-field" v-model="data.country">
				<option
					v-for="country in countries"
					:value="country.iso2"
				>{{country.name}}
				</option>
			</select>
		</div>
	</form>
</template>

<script>
	import inputFields from "../data/input_fields";
	import {countries} from "../data/countries";

	export default {
		name: "InputForm",
		data() {
			return {
				inputFields, countries,
			};
		},
		props: {
			"data": Object,
		},
	};
</script>

<style lang="scss" scoped>
	@import "InputForm";
</style>