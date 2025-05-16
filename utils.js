import * as SmartySDK from "smartystreets-javascript-sdk";
import * as sdkUtils from "smartystreets-javascript-sdk-utils";
import countries from "./src/data/countries";

const SmartyCore = SmartySDK.core;
const websiteKey = ""; // Your website key here
const smartySharedCredentials = new SmartyCore.SharedCredentials(websiteKey);

const autoCompleteClient = new SmartyCore.ClientBuilder(smartySharedCredentials).withLicenses(["us-autocomplete-pro-cloud"]).buildUsAutocompleteProClient();
const internationalAutocompleteClient = new SmartyCore.ClientBuilder(smartySharedCredentials).withLicenses(["international-autocomplete-v2-cloud"]).buildInternationalAddressAutocompleteClient();
const usStreetClient = new SmartyCore.ClientBuilder(smartySharedCredentials).buildUsStreetApiClient();
const internationalStreetClient = new SmartyCore.ClientBuilder(smartySharedCredentials).buildInternationalStreetClient();

export function formatSuggestion(suggestion, country) {
  const entries = suggestion.entries > 1 ? ` (${suggestion.entries} more entries)` : "";
  if (country === "US") {
    const secondary = suggestion.secondary ? ` ${suggestion.secondary}` : "";
    const address = suggestion.streetLine + secondary + entries + " " + suggestion.city + ", " + suggestion.state + " " + suggestion.zipcode;
    const selected = suggestion.streetLine + secondary + " (" + suggestion.entries + ") " + suggestion.city + ", " + suggestion.state + " " + suggestion.zipcode;

    return {
      address,
      selected,
    };
  } else {
    const address = suggestion.addressText + entries;
    const selected = suggestion.addressText;
    const addressId = suggestion.addressId;
    return {
      address,
      selected,
      addressId,
    }
  }
}

export function queryAutocompleteForSuggestions(query) {
  if (!this.country.iso2) this.country = countries[0]
  if (this.country.iso2 === "US") {
    this.client = autoCompleteClient;
    this.lookup = new SmartySDK.usAutocompletePro.Lookup(query);
    if (query.entries > 1) {
      this.lookup.selected = formatSuggestion(query, this.country.iso2).selected;
    }
  } else {
    this.client = internationalAutocompleteClient;
    if (query.entries > 1) {
      this.lookup = new SmartySDK.internationalAddressAutocomplete.Lookup({ addressId: formatSuggestion(query, this.country.iso2).addressId })
    }
    this.lookup = new SmartySDK.internationalAddressAutocomplete.Lookup(query);
    this.lookup.search = query;
    this.lookup.country = this.country.iso2;
  }

  if (query) {
    this.client.send(this.lookup).then(response => {
      this.suggestions = response.result;
    })
      .catch((e) => this.error = e.error);
  } else {
    this.suggestions = [];
  }
}

function useAutocompleteSuggestion(suggestion, here) {
  if (here.country.iso2 === "US") {
    const secondary = suggestion.secondary ? ` ${suggestion.secondary}` : "";
    here.address1 = suggestion.streetLine + secondary;
    here.city = suggestion.city;
    here.state = suggestion.state;
    here.zipCode = suggestion.zipcode;
    here.suggestions = [];
  } else {
    here.address1 = suggestion.addressText;
  }
}

export function selectSuggestion(suggestion) {
  if (suggestion.entries > 1) {
    this.queryAutocompleteForSuggestions(suggestion);
  } else {
    useAutocompleteSuggestion(suggestion, this);
  }
}

export function validateAddress() {
  if (this.country.iso2 === "US") {
    validateUSAddress(this)
  } else {
    validateInternationalAddress(this)
  }
}

export async function validateUSAddress(here) {
  let lookup = new SmartySDK.usStreet.Lookup();

  lookup.street = this.address1?.value ? this.address1.value : this.address1;
  lookup.street2 = this.address2?.value ? this.address2.value : "";
  lookup.city = this.city?.value ? this.city.value : this.city;
  lookup.state = this.state?.value ? this.state.value : this.state;
  lookup.zipCode = this.zipCode?.value ? this.zipCode.value : this.zipCode;

  if (!!lookup.street) {
    await usStreetClient.send(lookup)
      .then(updateStateFromValidatedAddress)
      .catch(e => this.error = e.error);
  } else {
    this.error = "A street address is required.";
  }

  if (!this.error) {
    const candidate = lookup.result[0];
    here.address1 = candidate.deliveryLine1;
    here.address2 = candidate.deliveryLine2;
    here.city = candidate.components.cityName;
    here.state = candidate.components.state;
    here.zipCode = candidate.components.zipCode + "-" + candidate.components.plus4Code;
  }
}

export function updateStateFromValidatedAddress(response) {
  const lookup = response.lookups[0];
  const isValid = sdkUtils.isValid(lookup);
  const isAmbiguous = sdkUtils.isAmbiguous(lookup);

  if (!isValid) {
    this.error = "The address is invalid.";
  } else if (isAmbiguous) {
    this.error = "The address is ambiguous.";
  } else if (isValid) {
    this.error = "";
  }
}

async function validateInternationalAddress(here) {
  let lookup = new SmartySDK.internationalStreet.Lookup();
  lookup.country = here.country.iso2;
  lookup.freeform = this.address1?.value ? this.address1.value : this.address1;

  await internationalStreetClient.send(lookup)
    .catch(e => this.error = e.error);

  const result = lookup.result[0];
  here.address1 = result.address1;
  here.address2 = result.address2;
  here.city = result.components.locality;
  here.state = result.components.administrativeArea;
  here.zipCode = result.components.postalCode;
}
