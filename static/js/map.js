// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};


// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        // Complete as you see fit.
        new_coord: "",
        new_radius: 0.5,
        search_lorf: "lost",
        coord_inv: false,
        error_message: "",
    };

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };

    app.load_pins = function(){
        console.log("hi");
        app.vue.coord_inv = false;
        new_coord_cleaned = app.vue.new_coord.replace(/\s/g, "");
        const new_coord_split = new_coord_cleaned.split(",");
        if(new_coord_split.length != 2){
            app.vue.error_message = "coordinate length incorrect. Please specify a number for the latitude and longitude, separated by a comma.";
            app.vue.coord_inv = true;
            return -1;
        }
        let new_lat = new_coord_split[0];
        let new_lon = new_coord_split[1];
        if(isNaN(new_lat)){
            app.vue.error_message = "latitude not a number. Please specify a number for the latitude.";
            app.vue.coord_inv = true;
            return -1;
        }
        else{
            new_lat = parseFloat(new_lat);
        }
        if(isNaN(new_lon)){
            app.vue.error_message = "longitude not a number. Please specify a number for the longitude.";
            app.vue.coord_inv = true;
            return -1;
        }
        else{
            new_lon = parseFloat(new_lon);
        }
        if(new_lat < -90 || new_lat > 90){
            app.vue.error_message = "latitude is not in range. Please specify a number for the latitude from -90 to 90.";
            app.vue.coord_inv = true;
            return -1;
        }
        if(new_lon < -180 || new_lon > 180){
            app.vue.error_message = "longtitude is not in range. Please specify a number for the longitude from -180 to 180.";
            app.vue.coord_inv = true;
            return -1;
        }

        axios.get(load_pins_url, {params: {status: app.vue.search_lorf, radius: app.vue.new_radius, new_lat: new_lat, new_lon: new_lon}})
            .then(function (response) {
                console.log(app.vue.new_radius);
            });
    }

    // This contains all the methods.
    app.methods = {
        // Complete as you see fit.
        load_pins: app.load_pins,
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target-map",
        data: app.data,
        methods: app.methods
    });

    // And this initializes it.
    app.init = () => {
        // Put here any initialization code.
        // Typically this is a server GET call to load the data.

    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);
