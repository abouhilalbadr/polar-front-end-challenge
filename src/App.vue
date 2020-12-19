<template>
  <div id="app">
    <div class="my-12">
      <div class="container mx-auto">
        <div class="flex flex-col lg:flex-row flex-wrap mb-4">
          <button :class="filterType === 'accounts' ? 'bg-blue text-white' : 'text-blue'" class="border border-blue px-8 py-2 w-32 focus:outline-none mr-2 rounded-lg" @click="changeFilter('accounts')">Accounts</button>
          <button :class="filterType === 'posts' ? 'bg-blue text-white' : 'text-blue'" class="border border-blue px-8 py-2 w-32 focus:outline-none rounded-lg" @click="changeFilter('posts')">Posts</button>
        </div>
        <div class="bg-white px-6 py-3 shadow-sm rounded-lg mb-12">
          <div class="flex flex-col items-center justify-center h-40">
            <h1 class="text-2xl mb-3 text-black">Track any Instagram {{ (filterType === "accounts") ? "account" : "account posts" }}</h1>
            <input
              v-if="filterType === 'accounts'"
              class="w-1/3 px-4 py-2 border rounded-md focus:outline-none focus:border-blue focus:placeholder-blue"
              :class="inputError ? 'border-mainColor text-mainColor placeholder-mainColor' : 'border-gray-300 text-gray-600'"
              type="text"
              placeholder="user ID"
              v-model="userId"
              @input="sendRequest"
            />
            <input
              v-else
              class="w-1/3 px-4 py-2 border rounded-md focus:outline-none focus:border-blue focus:placeholder-blue"
              :class="inputError ? 'border-mainColor text-mainColor placeholder-mainColor' : 'border-gray-300 text-gray-600'"
              type="text"
              placeholder="username"
              v-model="username"
              @input="sendRequest"
            />
            <p class="text-mainColor my-1" v-if="inputError">please fill this field</p>
          </div>
        </div>
        <div>
          <div class="bg-white px-6 py-3 shadow-sm rounded-lg mb-6">
            <div class="flex justify-between items-center flex-col lg:flex-row">
              <Filters v-if="filterType === 'accounts'" v-model="filters" :fields="filterOptions" @input="sendRequest" />
              <Filters v-else v-model="filters" :fields="filterPost" @input="sendRequest" />
              <div class="sort-side flex flex-wrap justify-end w-full lg:w-1/6">
                <select class="focus:outline-none border border-gray-200 px-4 py-2 rounded-lg" v-model="sort.by" @change="changeSort">
                  <option disabled="disabled">Sort posts</option>
                  <option value="posted_at" selected="selected">Posting date ▼</option>
                  <option value="like_count">Likes ▼</option>
                  <option value="comment_count">Comments ▼</option>
                  <option value="view_count">Views ▼</option>
                </select>
              </div>
            </div>
          </div>
            <div v-if="loading" class="h-24 flex items-center justify-center">
              <div class="loading" />
            </div>
            <div v-else>
              <div v-if="userData.length > 0">
                <div class="flex flex-col lg:flex-row flex-wrap" v-if="filterType === 'accounts'">
                  <div class="w-full lg:w-1/3" v-for="item in userData" :key="item.id">
                    <div class="bg-white rounded-lg m-2">
                      <img class="w-full h-64 object-cover rounded-t-lg" :src="item.profile_picture_cached" :alt="item.name">
                      <div class="px-4 py-2">
                        <h2 class="text-black text-2xl font-bold"> {{ item.name }} </h2>
                        <p class="mt-2 text-gray-400"> {{ item.biography }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex flex-col lg:flex-row flex-wrap" v-else>
                  <div class="w-full lg:w-1/3" v-for="item in userData" :key="item.id">
                    <div class="bg-white rounded-lg m-2">
                      <img class="w-full h-64 object-cover rounded-t-lg" :src="item.thumbnail_cached_src" :alt="item.caption">
                      <div class="px-4 py-2">
                        <h2 class="text-black text-2xl font-bold"> @{{ username }} </h2>
                        <p class="mt-2 text-gray-400"> {{ item.caption }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="h-24 flex items-center justify-center">
                <h2 class="text-gray-500">There are no posts in the selected date range</h2>
              </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Filters from "./components/Filters.vue";

export default {
  name: "App",
  data() {
    return {
      loading: false,
      inputError: false,
      filterType: "accounts",
      username: "cristiano",
      userId: "124124",
      filters: [],
      userData: [],
      page: 1,
      sort: {
        by: "posted_at",
        desc: true
      },
      filterOptions: [
        {
          icon: "stats",
          label: "Followers",
          key: "follower_count",
          type: "number"
        },
        {
          icon: "stats",
          label: "Followings",
          key: "following_count",
          type: "number"
        },
        {
          icon: "stats",
          label: "Posts",
          key: "media_count",
          type: "number"
        },
        {
          icon: "stats",
          label: "Engagement rate",
          key: "engagement_rate",
          type: "number"
        },
        {
          icon: "lock",
          label: "Is private",
          key: "is_private",
          type: "boolean"
        },
        {
          icon: "link",
          label: "Profile link",
          key: "external_url",
          type: "string"
        },
        {
          icon: "checkmark-circle",
          label: "Is verified",
          key: "is_verified",
          type: "boolean"
        },
        {
          icon: "business",
          label: "Is business",
          key: "is_business",
          type: "boolean"
        },
        {
          icon: "list",
          label: "Biography",
          key: "biography",
          type: "string"
        }
      ],
      filterPost: [
        {
          icon: "thumbs-up",
          "key":"like_count",
          "label":"Likes",
          "type":"number"
        },
        {
          icon: "chatboxes",
          "key":"comment_count",
          "label":"Comments",
          "type":"number"
        },
        {
          icon: "videocam",
          "key":"view_count",
          "label":"Video views",
          "type":"number"
        },
        {
          icon: "list-box",
          "key":"caption",
          "label":"Caption",
          "type":"string"
        },
        {
          icon: "calendar",
          "key":"posted_at",
          "label":"Posted",
          "type":"date"
        },
        {
          icon: "time",
          "key":"posted_at",
          "label":"Time of day",
          "type":"time"
        }
      ]
    };
  },
  components: {
    Filters
  },
  methods: {
    // this method can take the filters and push it to the url
    saveURI() {
      // Here i add all data thati want to add to url
      const data = {
        filters: this.filters,
        sort_by: this.sort.by,
        sort_desc: this.sort.desc,
        // this filterType is only for preview
        filterType: this.filterType
      };
      let out = [];
      for (var key in data) {
        // check if filters has data change it to base64 if not delete it
        if (key === "filters") {
          if (data["filters"].length > 0) data["filters"] = btoa(JSON.stringify(data["filters"]));
          else delete data[key];
        }
        // double check if data has his own property
        if (data.hasOwnProperty(key)) {
          // encode each value
          out.push(key + '=' + encodeURIComponent(data[key]));
        }
      }
      // take the encoded and base64 data and join it to query format
      const query = '?' + out.join('&');
      // Add the query to url
      history.replaceState({}, null, query);
    },
    // this method can get data from igblade servers
    sendRequest() {
      // Run the saveURI method every time we send a query
      this.saveURI();
      // Hide Input Error (Only for preview)
      this.inputError = false;
      // Validate Input (Only for preview)
      if (this.filterType === "accounts") {
        if (this.userId === "") {
          this.inputError = true;
          return
        }
      } else {
        if (this.username === "") {
          this.inputError = true;
          return
        }
      }
      // Start Loading
      this.loading = true;
      // Prepare Data to send it
      const data = {
        filters: this.filters,
        page: this.page,
        sort_by: this.sort.by,
        sort_desc: this.sort.desc
      };
      // Prepare Headers
      const headers = {
        "Content-Type": "application/json;charset=UTF-8",
        "Authorization": "Bearer ehf27Xfp7pk99Lk6QCX5GMZLRKzrGheP818rG7wyuImVOerSFWkf7Wsx21qG"
      };
      // Send request depends on the type (Only for preview)
      const url = (this.filterType === "accounts") ? `https://igblade.com/api/v3/users/${this.userId}/accounts/searches` : `https://igblade.com/api/v3/instagram/accounts/${this.username}/posts/searches`;
      axios.post(url, data, { headers })
        .then((response) => {
          // Save for pagination
          this.page = response.data.current_page;
          // save the response
          this.userData= response.data.data;
          // Stop Loading
          this.loading = false;
        })
        .catch((error) => {
          // Stop Loading
          this.loading = false;
          console.log(error);
        });
    },
    // this method can change the sort type (Only for preview)
    changeSort(e) {
      // Change Sort Type (Only for preview)
      this.sort.by = e.target.value;
      // Send the request again if you change the sort type (Only for preview)
      this.sendRequest();
    },
    // this method can change the filter type (Only for preview)
    changeFilter(type) {
      // Change filter type (Only for preview)
      this.filterType = type;
      // delete all filters (Only for preview)
      this.filters = [];
      // make a default username (Only for preview)
      this.username = "cristiano";
      // make a default user id (Only for preview)
      this.userId = "124124";
      // delete all data (Only for preview)
      this.userData = [];
      // hide errors (Only for preview)
      this.inputError = false;
      // Send request after changing the type (Only for preview)
      this.sendRequest();
    },
    // this method can read the url query and save it
    readURI() {
      // get query from the url
      const uri = window.location.href.split('?');
      // Check if there is any query
      if (uri.length === 2) {
        // split the query to an array by &
        const vars = uri[1].split('&');
        let getVars = {};
        let tmp = '';
        vars.map((e) => {
          tmp = e.split('=');
          if(tmp.length == 2)
            getVars[tmp[0]] = tmp[1];
        });
        // Save sort by query
        this.sort.by = getVars.sort_by;
        // Save sort desc query
        this.sort.desc = getVars.sort_desc;
        // this filterType is only for preview
        this.filterType = getVars.filterType;
        // Decode filters from base 64 to an array and save it
        try {
          // Decode FIlters
          let filters = JSON.parse(atob(decodeURIComponent(getVars.filters)));
          // check if there is any filter
          if (filters.length > 0) {
            // Double check and filter the filters and push the correct filter
            filters = filters.filter((e, i) => {
              if (e.hasOwnProperty("key") && e.hasOwnProperty("comparison") && e.hasOwnProperty("type")) {
                this.$set(this.filters, i, e);
                return true;
              }
              return false;
            });
          }
        } catch (error) {}
      }
      // Send Request to fetch data
      this.sendRequest();
    }
  },
  mounted() {
    this.readURI();
  },
};
</script>
