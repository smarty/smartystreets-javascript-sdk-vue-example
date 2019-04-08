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
	import * as SmartyStreetsSDK from "smartystreets-javascript-sdk";
	import Vue from "vue";
	import InputForm from "./InputForm";

	const SmartyStreetsCore = SmartyStreetsSDK.core;
	const websiteKey = ""; // Your website key here
	const smartyStreetsSharedCredentials = new SmartyStreetsCore.SharedCredentials(websiteKey);
	const autoCompleteClientBuilder = new SmartyStreetsCore.ClientBuilder(smartyStreetsSharedCredentials);
	const usStreetClientBuilder = new SmartyStreetsCore.ClientBuilder(smartyStreetsSharedCredentials);
	const internationalStreetClientBuilder = new SmartyStreetsCore.ClientBuilder(smartyStreetsSharedCredentials);

	const autoCompleteClient = autoCompleteClientBuilder.buildUsAutocompleteClient();
	const usStreetClient = usStreetClientBuilder.buildUsStreetApiClient();
	const internationalStreetClient = internationalStreetClientBuilder.buildInternationalStreetClient();

	export default {
		name: "Autocomplete",
		components: {InputForm},
		data() {
			return {
				shouldValidate: true,
				address1: "",
				address2: "",
				locality: "",
				administrativeArea: "",
				postalCode: "",
				country: "US",
				suggestions: [],
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
				this.locality = suggestion.city;
				this.administrativeArea = suggestion.state;
				this.suggestions = [];
			},
			validateAddress() {
				let lookup = new SmartyStreetsSDK.usStreet.Lookup();
				lookup.street = this.address1;
				lookup.street2 = this.address2;
				lookup.city = this.locality;
				lookup.state = this.administrativeArea;
				lookup.zipCode = this.postalCode;

				usStreetClient.send(lookup)
					.then(this.updateStateFromValidatedAddress)
					.catch(console.warn);
			},
			updateStateFromValidatedAddress(response) {
				const candidate = response.lookups[0].result[0];
				this.address1 = candidate.deliveryLine1;
				this.address2 = candidate.deliveryLine2;
				this.locality = candidate.components.cityName;
				this.administrativeArea = candidate.components.state;
				this.postalCode = candidate.components.zipCode + "-" + candidate.components.plus4Code;
			},
		},
	};
</script>


<style lang="scss" scoped>
	@import "Autocomplete";
</style>