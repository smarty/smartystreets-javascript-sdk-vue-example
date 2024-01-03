<template>
  <form class="autocomplete--input-form">
    <div class="autocomplete--input-group">
      <label for="shouldValidate" class="autocomplete--input-label">
        Validate on Selection
      </label>

      <input
        autocomplete="false"
        class="autocomplete--input-field"
        id="shouldValidate"
        type="checkbox"
        v-model="data.shouldValidate"
      />
    </div>

    <div class="autocomplete--input-group" v-for="inputField in inputFields">
      <label class="autocomplete--input-label" :for="inputField.fieldName">
        {{ inputField.fieldLabel }}
      </label>

      <input
        class="autocomplete--input-field"
        type="text"
        :id="inputField.fieldName"
        v-model="data[inputField.fieldName]"
        @input="data.queryAutocompleteForSuggestions(data.address1)"
      />
    </div>
    <div class="autocomplete--input-group">
      <label class="autocomplete--input-label" for="country">
        Country
      </label>
      <select
          id="country"
          class="autocomplete--input-field"
          v-model=data.country
      >
        <option v-for="(country, index) in countries" :key="index" :value="country">
          {{ country.name }}
        </option>
      </select>
    </div>

    <button v-on:click="e => {e.preventDefault(); data.validateAddress();}">Validate</button>
  </form>
</template>

<script>
import inputFields from "../data/input_fields";
import countries from "../data/countries";

export default {
  name: "InputForm",
  data() {
    return {
      inputFields,
      countries,
    };
  },
  props: {
    "data": Object,
  },
};
</script>

<style scoped>
  .autocomplete--input-label {
    display: inline-block;
    font-family: Helvetica, Arial, sans-serif;
    padding-right: 15px;
    text-align: right;
    width: 200px;
  }

  .autocomplete--input-field {
    display: inline-block;
    width: calc(100% - 230px);
  }

  button {
    margin-top: 10px;
  }
</style>
