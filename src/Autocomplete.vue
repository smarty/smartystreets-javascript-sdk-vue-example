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

				usStreetClient.send(lookup)
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

				internationalStreetClient.send(lookup)
					.then(this.updateStateFromValidatedInternationalAddress)
					.catch(console.warn);
			},
			updateStateFromValidatedInternationalAddress(response) {
				const validatedAddress = response.lookups[0].result[0];

				this.locality = validatedAddress.components.locality;
				this.administrativeArea = validatedAddress.components.administrativeArea;
				this.postalCode = validatedAddress.components.postalCode;
				this.country = validatedAddress.components.countryIso3;
				this.removeComponentsFromAddressLines(validatedAddress);
				this.address1 = validatedAddress.address1;
				this.address2 = this.buildAddress2(validatedAddress);
			},
			removeComponentsFromAddressLines(validatedAddress) {
				if (validatedAddress.metadata.addressFormat !== "undefined") {
					const addressFormatLines = validatedAddress.metadata.addressFormat.split("|");

					for (const addressLineNumber in addressFormatLines) {
						const componentsToRemove = [
							"locality",
							"administrative_area",
							"postal_code",
							"country",
						];
						const addressComponent = addressFormatLines[addressLineNumber];
						const lineNumberAsInt = parseInt(addressLineNumber) + 1;
						const addressLineComponent = "address" + lineNumberAsInt;

						componentsToRemove.forEach((componentName) => {
							this.removeComponentFromAddressLine(addressComponent, componentName, addressLineComponent, validatedAddress);
						});
						this.removeExtraWhitespace(addressLineComponent, validatedAddress);
					}
				} else {
					this.emptyLastNonEmptyAddressLine(validatedAddress);
				}
			},
			removeComponentFromAddressLine(addressComponent, componentName, addressLineComponent, validatedAddress) {
				if (addressComponent.includes(componentName)) {
					const regex = new RegExp(validatedAddress.components[componentName], "g");
					const newAddressLine = validatedAddress[addressLineComponent].replace(regex, "");
					validatedAddress[addressLineComponent] = newAddressLine;
				}
			},
			removeExtraWhitespace(addressLineComponent, validatedAddress) {
				let addressLine = validatedAddress[addressLineComponent];

				removeLeadingWhitespace();
				removeTrailingWhitespace();
				replaceMultipleWhitespaceWithSingle();
				validatedAddress[addressLineComponent] = addressLine;

				function removeLeadingWhitespace() {
					addressLine = addressLine.replace(/^\s+/g, "");
				}

				function removeTrailingWhitespace() {
					addressLine = addressLine.replace(/\s+$/g, "");
				}

				function replaceMultipleWhitespaceWithSingle() {
					addressLine = addressLine.replace(/\s+/g, " ");
				}
			},
			emptyLastNonEmptyAddressLine(validatedAddress) {
				const addressLineComponent = "address2";

				if (validatedAddress[addressLineComponent] !== "undefined" && validatedAddress[addressLineComponent] !== "") {
					validatedAddress[addressLineComponent] = "";
				}
			},
			buildAddress2(validatedAddress) {
				let addressLine2 = validatedAddress.address2;

				for (let i = 3; i <= 12; i++) {
					addAddressLine(validatedAddress["address" + i], validatedAddress["address" + (i + 1)]);
				}

				return addressLine2;

				function addAddressLine(addressLine, nextAddressLine) {
					if (addressLine !== "undefined" && nextAddressLine !== "undefined") {
						if (addressLine2 !== "") {
							addressLine2 += ", ";
						}
						addressLine2 += addressLine;
					}
				}
			},
		},
		props: {
			Autocomplete: {},
		},
	};
</script>