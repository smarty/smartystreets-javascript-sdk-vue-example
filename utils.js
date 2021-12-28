import * as SmartyStreetsSDK from "smartystreets-javascript-sdk";
import * as sdkUtils from "smartystreets-javascript-sdk-utils";

const SmartyStreetsCore = SmartyStreetsSDK.core;
const websiteKey = ""; // Your website key here
const smartyStreetsSharedCredentials = new SmartyStreetsCore.SharedCredentials(websiteKey);
const autoCompleteClientBuilder = new SmartyStreetsCore.ClientBuilder(smartyStreetsSharedCredentials);
const usStreetClientBuilder = new SmartyStreetsCore.ClientBuilder(smartyStreetsSharedCredentials);

const autoCompleteClient = autoCompleteClientBuilder.buildUsAutocompleteProClient();
const usStreetClient = usStreetClientBuilder.buildUsStreetApiClient();
export function formatSuggestion(suggestion) {
  const secondary = suggestion.secondary ? ` ${suggestion.secondary}` : "";
  const entries = suggestion.entries > 1 ? ` (${suggestion.entries} more entries)` : "";
  const address = suggestion.streetLine + secondary + entries + " " + suggestion.city + ", " + suggestion.state + " " + suggestion.zipcode;
  const selected = suggestion.streetLine + secondary + " (" + suggestion.entries + ") " + suggestion.city + ", " + suggestion.state + " " + suggestion.zipcode;

  return {
    address,
    selected,
  };
}

export function queryAutocompleteForSuggestions(query) {
  const lookup = new SmartyStreetsSDK.usAutocompletePro.Lookup(query);
  if (query.entries > 1) {
    lookup.selected = formatSuggestion(query).selected;
  }

  if (query) {
    autoCompleteClient.send(lookup).then(response => {
      this.suggestions = response.result;
    })
      .catch((e) => this.error = e.error);
  } else {
    this.suggestions = [];
  }
}

function useAutocompleteSuggestion(suggestion, here) {
  const secondary = suggestion.secondary ? ` ${suggestion.secondary}` : "";
  here.address1 = suggestion.streetLine + secondary;
  here.city = suggestion.city;
  here.state = suggestion.state;
  here.zipCode = suggestion.zipcode;
  here.suggestions = [];
}

export function selectSuggestion(suggestion) {
  if (suggestion.entries > 1) {
    this.queryAutocompleteForSuggestions(suggestion);
  } else {
    useAutocompleteSuggestion(suggestion, this);
  }
}


export function validateAddress() {
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
}

export function updateStateFromValidatedAddress(response) {
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
}
