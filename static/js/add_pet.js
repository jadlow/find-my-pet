// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};


// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        // Complete as you see fit.
        post_success: false,
        new_pet_name: "",
        new_pet_type: "",
        new_pet_lostfound_date_m: -1,
        new_pet_lostfound_date_d: -1,
        new_pet_lostfound_date_y: -1,
        new_description: "",
        new_pet_lat_lng: "",
        err_name: false,
        err_name_i: "",
        err_type: false,
        err_type_i: "",
        err_date: false,
        err_date_i: "",
        err_description: false,
        err_description_i: "",
        err_coord: false,
        err_coord_i: "",
    };

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };


    app.new_post = function(){
        app.vue.err_name = false;
        app.vue.err_type = false;
        app.vue.err_date = false;
        app.vue.err_description = false;
        app.vue.err_coord = false;
        if(app.vue.new_pet_name.replace(/\s/g, "").length == 0){
            app.vue.err_name_i = "empty pet name. Please specify a pet name that contains 1 or more characters."
            app.vue.err_name = true;
            return -1;
        }
        if(app.vue.new_pet_type.replace(/\s/g, "").length == 0){
            app.vue.err_type_i = "empty pet type. Please specify a pet type that contains 1 or more characters."
            app.vue.err_type = true;
            return -1;
        }
        if(isNaN(app.vue.new_pet_lostfound_date_m) || (app.vue.new_pet_lostfound_date_m.length == 0)){
            app.vue.err_date_i = "month is not a number. Please specify a month with a number.";
            app.vue.err_date = true;
            return -1;
        }
        app.vue.new_pet_lostfound_date_m = parseInt(app.vue.new_pet_lostfound_date_m);
        if((app.vue.new_pet_lostfound_date_m < 1) || (app.vue.new_pet_lostfound_date_m > 12)){
            app.vue.err_date_i = "month not in range. Please specify a month with a number between 1 to 12.";
            app.vue.err_date = true;
            return -1;
        }
        if(isNaN(app.vue.new_pet_lostfound_date_d) || (app.vue.new_pet_lostfound_date_d.length == 0)){
            app.vue.err_date_i = "date is not a number. Please specify a date with a number.";
            app.vue.err_date = true;
            return -1;
        }
        app.vue.new_pet_lostfound_date_d = parseInt(app.vue.new_pet_lostfound_date_d);
        if(isNaN(app.vue.new_pet_lostfound_date_y) || (app.vue.new_pet_lostfound_date_y.length == 0)){
            app.vue.err_date_i = "year is not a number. Please specify a year with a number";
            app.vue.err_date = true;
            return -1;
        }
        app.vue.new_pet_lostfound_date_y = parseInt(app.vue.new_pet_lostfound_date_y);
        if((app.vue.new_pet_lostfound_date_y < 2017) || (app.vue.new_pet_lostfound_date_y > 2022)){
            app.vue.err_date_i = "year not in range. Please specify a year with a number between 2017 to 2022.";
            app.vue.err_date = true;
            return -1;
        }
        let month_upp = -1;
        if([1, 3, 5, 7, 8, 10, 12].includes(app.vue.new_pet_lostfound_date_m)){
            month_upp = 31;
        }
        else if(app.vue.new_pet_lostfound_date_m > 2){
            month_upp = 30;
        }
        else{
            const leap_year = (0 == app.vue.new_pet_lostfound_date_y % 4) && (0 != app.vue.new_pet_lostfound_date_y % 100) || (0 == app.vue.new_pet_lostfound_date_y % 400);
            month_upp = !leap_year ? 28 : 29;
        }
        const today_date = new Date();
        const in_date = new Date(app.vue.new_pet_lostfound_date_y, app.vue.new_pet_lostfound_date_m - 1, app.vue.new_pet_lostfound_date_d);
        if(in_date.getTime() > today_date.getTime()){
            app.vue.err_date_i = "date is in the future. Please specify a date between January 1, 2017 to today.";
            app.vue.err_date = true;
            return -1;
        }
        if(app.vue.new_pet_lostfound_date_d < 1 || app.vue.new_pet_lostfound_date_d > month_upp){
            app.vue.err_date_i = "date not in range. Please specify a date with a number between 1 and " + month_upp + ".";
            app.vue.err_date = true;
            return -1;
        }
        if(app.vue.new_description.replace(/\s/g, "").length == 0){
            app.vue.err_description_i = "description is empty. Please provide a description about your pet.";
            app.vue.err_description = true;
            return -1;
        }
        const new_pet_lat_lng_cleaned = app.vue.new_pet_lat_lng.replace(/\s/g, "");
        new_pet_lat_lng_split = new_pet_lat_lng_cleaned.split(",");
        if(new_pet_lat_lng_split.length != 2){
            app.vue.err_coord_i = "coordinate length invalid. Please specify a coordinate with two numbers separated by a comma.";
            app.vue.err_coord = true;
            return -1;
        }
        let new_pet_lat = new_pet_lat_lng_split[0];
        let new_pet_lng = new_pet_lat_lng_split[1];
        if(isNaN(new_pet_lat)){
            app.vue.err_coord_i = "latutide is not a number. Please specify a number for the latitude.";
            app.vue.err_coord = true;
            return -1;
        }
        else{
            new_pet_lat = parseFloat(new_pet_lat);
        }
        if(isNaN(new_pet_lng)){
            app.vue.err_coord_i = "longitude is not a number. Please specify a number for the longitude.";
            app.vue.err_coord = true;
            return -1;
        }
        else{
            new_pet_lng = parseFloat(new_pet_lng);
        }
        if(new_pet_lat < -90 || new_pet_lat > 90){
            app.vue.err_coord_i = "latitude is not in range. Please specify a number for the latitude between -90 to 90.";
            app.vue.err_coord = true;
            return -1;
        }
        if(new_pet_lng < -180 || new_pet_lng > 180){
            app.vue.err_coord_i = "longitude is not in range. Please specify a number for the longitude between -180 to 180.";
            app.vue.err_coord = true;
            return -1;
        }
        axios.post(add_post_url,
            {
                new_pet_name: app.vue.new_pet_name,
                new_pet_type: app.vue.new_pet_type,
                new_pet_lostfound_date_m: app.vue.new_pet_lostfound_date_m,
                new_pet_lostfound_date_d: app.vue.new_pet_lostfound_date_d,
                new_pet_lostfound_date_y: app.vue.new_pet_lostfound_date_y,
                new_pet_description: app.vue.new_pet_description,
                new_pet_lat: new_pet_lat,
                new_pet_lng: new_pet_lng,
            }    
        );
        app.vue.post_success = true;
    }

    // This contains all the methods.
    app.methods = {
        // Complete as you see fit.
        add_post: app.new_post,
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target-newpost",
        data: app.data,
        methods: app.methods
    });

    // And this initializes it.
    app.init = () => {
        // Put here any initialization code.
        // Typically this is a server GET call to load the data.
        const today = new Date();
        app.vue.new_pet_lostfound_date_m = String(today.getMonth() + 1).padStart(2, '0');
        app.vue.new_pet_lostfound_date_d = String(today.getDate()).padStart(2, '0');
        app.vue.new_pet_lostfound_date_y = today.getFullYear();
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);