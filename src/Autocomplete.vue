<template>
	<div>
		<div>Autocomplete</div>
		<!--<InputForm-->
		<!--updateField={this.updateField}-->
		<!--updateCheckbox={this.updateCheckbox}-->
		<!--queryAutocompleteForSuggestions={this.queryAutocompleteForSuggestions}-->
		<!--state={this.state}-->
		<!--/>-->
		<!--<Suggestions-->
		<!--suggestions={this.state.suggestions}-->
		<!--selectSuggestion={this.selectSuggestion}-->
		<!--/>-->
	</div>
</template>
<script>
	import * as SmartyStreetsSDK from "smartystreets-javascript-sdk";
	import Vue from "vue";

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
			updateField(e) {
				this[e.target.id] = e.target.value;
			},
			updateCheckbox(e) {
				this[e.target.id] = e.target.checked;
			},
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
				if (this.country === "US") {
					this.validateUsAddress();
				} else {
					this.validateInternationalAddress();
				}
			},
			validateUsAddress() {
				let lookup = new SmartyStreetsSDK.usStreet.Lookup();
				lookup.street = this.address1;
				lookup.street2 = this.address2;
				lookup.city = this.locality;
				lookup.state = this.administrativeArea;
				lookup.zipCode = this.postalCode;

				this.usStreetClient.send(lookup)
					.then(this.updateStateFromValidatedUsAddress)
					.catch(console.warn);
			},
			updateStateFromValidatedUsAddress(response) {
				const candidate = response.lookups[0].result[0];
				this.address1 = candidate.deliveryLine1;
				this.address2 = candidate.deliveryLine2;
				this.locality = candidate.components.cityName;
				this.administrativeArea = candidate.components.state;
				this.postalCode = candidate.components.zipCode + "-" + candidate.components.plus4Code;
			},
			validateInternationalAddress() {
				let lookup = new SmartyStreetsSDK.internationalStreet.Lookup();
				lookup.address1 = this.address1;
				lookup.address2 = this.address2;
				lookup.locality = this.locality;
				lookup.administrativeArea = this.province;
				lookup.postalCode = this.postalCode;
				lookup.country = this.country;

				this.internationalStreetClient.send(lookup)
					.then(this.updateStateFromValidatedInternationalAddress)
					.catch(console.warn);
			},
			updateStateFromValidatedInternationalAddress() {
				// TODO: refer to the jquery plugin for how this should work. It's complicated for the international side of things
				const candidate = response.lookups[0].result[0];
				// this.address1 = candidate.address1;
				// this.address2 = candidate.address2;
				// this.locality = candidate.components.locality;
				// this.administrativeArea = candidate.components.administrativeArea;
				// this.postalCode = candidate.components.postalCode;
				// this.country = candidate.components.countryIso3;
			},
		},
		props: {
			Autocomplete: {},
		},
	};
</script>