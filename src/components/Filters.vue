<template>
  <div class="filter-side flex flex-wrap w-full lg:w-5/6">
    <div class="relative m-2" v-for="(item, i) in selectedFilters" :key="i">
      <button
        class="relative py-2 px-4 focus:outline-none rounded-lg border hover:bg-light hover:border-blue hover:text-blue"
        :class="(showActiveFilter === i) ? 'bg-light border-blue text-blue' : 'bg-lightGray border-borderGray text-textBlack'"
        @click="toggleActiveFilter(i)"
        @mouseover="showClose = i"
        @mouseleave="showClose = -1"
      >
        <span>
          <i class="icon" :class="'ion-md-' + item.icon"></i>
          <span class="ml-2 font-semibold">{{ item.label }} </span>
          {{ comparisons[item.type][item.cmp].label }} {{ printValue(item) }}
        </span>
        <div v-if="showClose === i" @click="deleteFilter(i)" class="absolute right-0 top-0 text-blue py-2 px-3 bg-grad rounded-r-lg">
          <i class="icon ion-md-close"></i>
        </div>
      </button>
      <div class="bg-white shadow-lg absolute left-0 top-0 w-56 z-10 rounded-lg mt-10 pt-2 border border-gray-100" v-if="showActiveFilter == i">
        <ul>
          <li class="text-black px-4 py-2" v-for="(filter, x) in comparisons[item.type]" :key="x">
            <input type="radio" class="form-radio focus:outline-none" :id="filter.abb" v-model="item.cmp" :value="x" @change="updateComparison(i, filter.abb, x)"/>
            <label class="ml-2" :for="filter.abb">
              {{ filter.label }}
            </label>
            <div class="flex items-center mt-2" v-if="item.cmp === x && item.type !== 'boolean' && (item.comparison !== 'unknown' && item.comparison !== 'any')">
              <vue-timepicker v-if="item.type === 'time'" :value="item.value || '00:00'" @input="updateFilter($event, i, 'time')"></vue-timepicker>
              <input v-else class="border border-gray-200 focus:outline-none focus:border-blue rounded w-full px-4 py-1" :type="(item.type === 'date') ? 'number' : 'text'" :value="item.value" @input="updateFilter($event, i, 'simple')" />
              <span class="ml-2 flex-nowrap" v-if="item.type === 'date'">days ago</span>
            </div>
          </li>
        </ul>
        <button
          class="text-mainColor hover:bg-gray-100 rounded-b-lg px-6 py-2 border-t border-gray-200 w-full text-left"
          @click="deleteFilter(i)"
        >
          <i class="icon ion-md-trash"></i>
          <span class="ml-4">Delete filter</span>
        </button>
      </div>
    </div>
    <div class="relative m-2">
      <button
        class="text-mainColor focus:outline-none py-2"
        @click="toggleFilterMenu"
        v-on-clickaway="awayButton"
      >
        <span class="mr-2 hover:underline">Add filter</span>
        <i class="icon ion-md-add-circle-outline"></i>
      </button>
      <div
        class="bg-white shadow-lg absolute left-0 top-0 w-48 rounded-lg mt-10 py-2 border border-gray-100"
        v-if="showFilterMenu"
      >
        <ul>
          <li
            class="text-black px-4 py-2"
            v-for="(item, i) in fields"
            :key="i"
          >
            <button
              class="focus:outline-none w-full text-left"
              @click="pushFilter(item)"
            >
              <i class="icon" :class="'ion-md-' + item.icon"></i>
              <span class="ml-2">{{ item.label }}</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
// All This is for preview
import { mixin as clickaway } from 'vue-clickaway';
import VueTimepicker from 'vue2-timepicker';
import 'vue2-timepicker/dist/VueTimepicker.css';

export default {
  name: "Filters",
  props: ["value", "fields"],
  mixins: [ clickaway ],
  components: {
    VueTimepicker
  },
  data() {
    return {
      showClose: -1,
      showActiveFilter: -1,
      selectedFilters: [],
      showFilterMenu: false,
      comparisons: {
        number: [
          { label: "greater than", abb: "gt" },
          { label: "less than", abb: "lt" },
          { label: "is", abb: "is" },
          { label: "is not", abb: "is_not" },
          { label: "is unknown", abb: "unknown" },
          { label: "has any value", abb: "any" }
        ],
        string: [
          { label: "is", abb: "is" },
          { label: "is not", abb: "is_not" },
          { label: "starts with", abb: "starts_with" },
          { label: "ends with", abb: "ends_with" },
          { label: "contains", abb: "contains" },
          { label: "does not contain", abb: "not_contain" },
          { label: "is unknown", abb: "unknown" },
          { label: "has any value", abb: "any" }
        ],
        boolean: [
          { label: "true", abb: "true" },
          { label: "false", abb: "false" }
        ],
        date: [
          { label: "less than", abb: "gt_relative" },
          { label: "more than", abb: "lt_relative" },
          { label: "exactly", abb: "is_relative" },
          { label: "after", abb: "gt" },
          { label: "before", abb: "lt" },
          { label: "is", abb: "on" },
          { label: "is unknown", abb: "unknown" },
          { label: "has any value", abb: "any" }
        ],
        time: [
          { label: "after", abb: "gt" },
          { label: "before", abb: "lt" },
          { label: "is", abb: "on" },
          { label: "is unknown", abb: "unknown" },
          { label: "has any value", abb: "any" }
        ]
      }
    };
  },
  methods: {
    // this method for printing the value with the correct type and style
    printValue(item) {
      if (item.type === "string")
        return '"' + item.value + '"';
      if (item.type === "time")
        return item.value;
      if (item.type === "date")
        return item.value + " days ago";
      if (item.value)
        return parseInt(item.value);
      return "";
    },
    // this method for click away dropdown (Only for preview)
    awayButton() {
      this.showFilterMenu = false;
    },
    // this method is a helper method to clean filters before emit
    getFilters() {
      // Copy the selected filters and prepare it to emit
      const filters = JSON.parse(JSON.stringify(this.selectedFilters)).map((e)=>{
        // check if type is boolean and delete the value and change the comparison from string to boolean
        if (e.type === "boolean") {
          delete e.value;
          e.comparison = (e.comparison == "true") ? true : false;
        }
        // check if comparison is unknown and change value to null
        if (e.comparison === "unknown") {
          e.value = null
        }
        // check if type is number and change value type to integer
        if (e.type === "number") {
          // check if value empty and change it from NaN to 0
          e.value = (e.value === "") ? 0 : parseInt(e.value);
        }
        // delete unused data
        delete e.cmp;
        delete e.icon;
        delete e.label;
        return e;
      });
      return filters;
    },
    // this method is a toggler for add filter button
    toggleFilterMenu() {
      this.showActiveFilter = -1;
      this.showFilterMenu = !this.showFilterMenu;
    },
    // this method is a toggler for the filters buttons
    toggleActiveFilter(i) {
      this.showActiveFilter = (this.showActiveFilter === i) ? -1 : i;
      this.showFilterMenu = false;
    },
    // this method can push the needed data to the selected filters
    pushFilter(item) {
      // hide dropdown after choosing a filter
      this.showFilterMenu = false;
      // set the active filter to show it's menu
      this.showActiveFilter = this.selectedFilters.length;
      // push all necessary data to the selected filters
      this.selectedFilters.push({...item, comparison: this.comparisons[item.type][0].abb, value: "", cmp: 0});
      // get the filters after clean and prepare it to emit if we need
      const filters = this.getFilters();
      // check if the type is boolean and emit the clean version of filters without the value
      if (item.type === "boolean") {
        this.$emit("input", filters);
      }
    },
    // this method can delete any filter
    deleteFilter(i) {
      // delete the selected filter
      this.selectedFilters.splice(i, 1);
      // get the filters after clean and prepare it to emit
      const filters = this.getFilters();
      // emit the new filters after clean and delete
      this.$emit("input", filters);
      // hide the close icon
      this.showClose = -1;
      // hide the filter menu
      this.showActiveFilter = -1;
    },
    // this method can emit the filters at input
    updateFilter(e, index, eventType) {
      // get the correct value depend on the type of the input (changable depends on the plugin used for time input)
      this.selectedFilters[index].value = (eventType === "simple") ?  e.target.value : e;
      // get the filters after clean and prepare it to emit
      const filters = this.getFilters();
      // emit the new filters after clean
      this.$emit("input", filters);
    },
    // this method can select the comparison
    updateComparison(index, comparison, x) {
      // check if comparsion is unknown or any and make value empty
      if (comparison === "unknown" || comparison === "any") {
        this.selectedFilters[index].value = "";
      }
      // add checked to the selected radio box
      this.selectedFilters[index].cmp = x;
      // update the comparison fields in selected fields
      this.selectedFilters[index].comparison = comparison;
      // get the filters after clean and prepare it to emit
      const filters = this.getFilters();
      // emit the filters after clean if the type is boolean or comparison is unknown or any or there is a value
      if (this.selectedFilters[index].value || this.selectedFilters[index].type === "boolean" || comparison === "unknown" || comparison === "any")
        this.$emit("input", filters);
    }
  },
  // this watcher can filter the correct data and push it to the selected filters (needed when we read data from url)
  watch: {
    value(newVal, oldVal) {
      // delete all filters
      this.selectedFilters = [];
      // read data from the new Value (the one readed from url and also any other changes)
      newVal.map(e => {
        // get the correct filters by key and type
        const res = this.fields.filter(el => (el.key === e.key && el.type === e.type))[0];
        // check if we have any filter
        if (res) {
          // push the correct data to the selected filters
          this.selectedFilters.push({...e, label: res.label, icon: res.icon, cmp: this.comparisons[e.type].findIndex(x => x.abb == e.comparison.toString())});
        }
      });
    }
  }
};
</script>
