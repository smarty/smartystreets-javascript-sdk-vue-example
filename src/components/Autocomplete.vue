<template>
	<div class="autocomplete">
		<InputForm
			:data="this"
		/>
		<!--<Suggestions-->
		<!--suggestions={this.state.suggestions}-->
		<!--selectSuggestion={this.selectSuggestion}-->
		<!--/>-->
	</div>
</template>
<script>
	import Vue from "vue";
	import * as SmartyStreetsSDK from "smartystreets-javascript-sdk";
	import * as sdkUtils from "smartystreets-javascript-sdk-utils";
	import InputForm from "./InputForm";

	const SmartyStreetsCore = SmartyStreetsSDK.core;
	const websiteKey = ""; // Your website key here
	const smartyStreetsSharedCredentials = new SmartyStreetsCore.SharedCredentials(websiteKey);
	const autoCompleteClientBuilder = new SmartyStreetsCore.ClientBuilder(smartyStreetsSharedCredentials);
	const usStreetClientBuilder = new SmartyStreetsCore.ClientBuilder(smartyStreetsSharedCredentials);

	const autoCompleteClient = autoCompleteClientBuilder.buildUsAutocompleteClient();
	const usStreetClient = usStreetClientBuilder.buildUsStreetApiClient();

	export default {
		name: "Autocomplete",
		components: {InputForm},
		data() {
			return {
				shouldValidate: true,
				address1: "",
				address2: "",
				city: "",
				state: "",
				zipCode: "",
				country: "US",
				suggestions: [],
				error: "",
			};
		},
		methods: {
			queryAutocompleteForSuggestions(query) {
				const lookup = new SmartyStreetsSDK.usAutocomplete.Lookup(query);

				autoCompleteClient.send(lookup)
					.then(response => {
						this.suggestions = response.result;
					})
					.catch(console.warn);
			},
			selectSuggestion(suggestion) {
				this.useAutoCompleteSuggestion(suggestion);
				Vue.nextTick(() => {
					if (this.shouldValidate) {
						this.validateAddress();
					}
				});
			},
			useAutoCompleteSuggestion(suggestion) {
				this.address1 = suggestion.streetLine;
				this.city = suggestion.city;
				this.state = suggestion.state;
				this.suggestions = [];
			},
			validateAddress() {
				let lookup = new SmartyStreetsSDK.usStreet.Lookup();
				lookup.street = this.address1;
				lookup.street2 = this.address2;
				lookup.city = this.city;
				lookup.state = this.state;
				lookup.zipCode = this.zipCode;

				if (!!lookup.street) {
					usStreetClient.send(lookup)
						.then(this.updateStateFromValidatedAddress)
						.catch(e => this.error = e.error);
				} else {
					this.error = "A street address is required.";
				}
			},
			updateStateFromValidatedAddress(response) {
				const lookup = response.lookups[0];
				const isValid = sdkUtils.isValid(lookup);
				const isAmbiguous = sdkUtils.isAmbiguous(lookup);
				const isMissingSecondary = sdkUtils.isMissingSecondary(lookup);

				if (!isValid) {
					this.error = "The address is invalid.";
				} else if (isAmbiguous) {
					this.error = "The address is ambiguous.";
				} else if (isMissingSecondary) {
					this.error = "The address is missing a secondary number.";
				} else if (isValid) {
					const candidate = lookup.result[0];

					this.address1 = candidate.deliveryLine1;
					this.address2 = candidate.deliveryLine2;
					this.city = candidate.components.cityName;
					this.state = candidate.components.state;
					this.zipCode = candidate.components.zipCode + "-" + candidate.components.plus4Code;
					this.error = "";
				}
			},
		},
	};
</script>


<style lang="scss" scoped>
	@import "Autocomplete";
</style>