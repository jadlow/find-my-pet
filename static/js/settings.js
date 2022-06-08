// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// GCS Function
// Thanks to https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string
/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
function humanFileSize(bytes, si=false, dp=1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10**dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


  return bytes.toFixed(dp) + ' ' + units[u];
}

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        // Complete as you see fit.
        post_success: false,
        username: "",
        last_name: "",
        email: "",
        phone_num: "",
        radius: "",
        coordinates: "",
        latitude: "",
        longitude: "",
        err_main: false,
        err_first_name: false,
        err_first_name_i: "",
        err_last_name: false,
        err_last_name_i: "",
        err_email: false,
        err_email_i: "",
        err_phone_num: false,
        err_phone_num_i: "",
        err_radius: false,
        err_radius_i: "",
        err_coordinates: false,
        err_coordinates_i: "",
        err_photo_null: false,
        err_photo_bad_type: false,
        photo_extensions: ["gif", "jpg", "jpeg", "png", "svg", "tif", "webp"],
        war_geoloc: false,
        prg_geoloc: false,
        location_preview_zoom: 12,
        show_get_coord_info: false,
    };

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };


    app.settings = function(){
        app.vue.err_main = false;
        app.vue.err_first_name = false;
        app.vue.err_last_name = false;
        app.vue.err_email = false;
        app.vue.err_phone_num = false;
        app.vue.err_radius = false;
        app.vue.err_coordinates = false;
        app.vue.err_photo_null = false;
        app.vue.err_photo_bad_type = false;
        app.vue.err_coord = false;
        app.vue.war_geoloc = false;
        
        // Check name.
        if(app.vue.first_name.replace(/\s/g, "").length == 0) {
            app.vue.err_first_name_i = "Empty first name. Please specify a first name that contains 1 or more characters."
            app.vue.err_first_name = true;
            app.vue.err_main = true;
            return -1;
        }

        if(app.vue.last_name.replace(/\s/g, "").length == 0) {
            app.vue.err_last_name_i = "Empty last name. Please specify a last name that contains 1 or more characters."
            app.vue.err_last_name = true;
            app.vue.err_main = true;
            return -1;
        }

        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(app.vue.email)) {
            app.vue.err_email_i = "Invalid email."
        }

        let new_pet_lost_bool = true;
        if(app.vue.new_pet_lost == "false"){
            new_pet_lost_bool = false;
        }

        // Check photo
        if(app.vue.file_name == null || app.vue.file_name == ""){
            app.vue.err_photo_null = true;
            app.vue.err_main = true;
            return -1;
        }

        // Check coordinates.
        const coordinates_cleaned = app.vue.coordinates.replace(/\s/g, "");
        coordinates_split = coordinates_cleaned.split(",");
        if(coordinates_split.length != 2){
            app.vue.err_coordinates_i = "coordinate length invalid. Please specify a coordinate with two numbers separated by a comma.";
            app.vue.err_coordinates = true;
            app.vue.err_main = true;
            return -1;
        }
        
        let latitude = coordinates_split[0];
        let longitude = coordinates_split[1];
        if(isNaN(latitude) || isNaN(parseFloat(latitude))) {
            app.vue.err_coordinates_i = "latitude is not a number. Please specify a number for the latitude.";
            app.vue.err_coordinates = true;
            app.vue.err_main = true;
            return -1;
        }
        else {
            latitude = parseFloat(latitude);
        }
        if(isNaN(longitude) || isNaN(parseFloat(longitude))) {
            app.vue.err_coordinates_i = "longitude is not a number. Please specify a number for the longitude.";
            app.vue.err_coordinates = true;
            app.vue.err_main = true;
            return -1;
        }
        else{
            longitude = parseFloat(longitude);
        }
        if(latitude < -90 || latitude > 90){
            app.vue.err_coordinates_i = "latitude is not in range. Please specify a number for the latitude between -90 to 90.";
            app.vue.err_coordinates = true;
            app.vue.err_main = true;
            return -1;
        }
        if(longitude < -180 || longitude > 180){
            app.vue.err_coordinates_i = "longitude is not in range. Please specify a number for the longitude between -180 to 180.";
            app.vue.err_coordinates = true;
            app.vue.err_main = true;
            return -1;
        }

        // Everything alright, add entry.
        axios.post(add_post_url,
            {
                first_name: app.vue.first_name,
                last_name: app.vue.last_name,
                email: app.vue.email,
                phone_num: app.vue.phone_num,
                radius: app.vue.radius,
                coordinates: app.vue.coordinates,
                latitude: latitude,
                longitude: longitude,
                photo: app.vue.upload_id,
            }    
        );
        app.vue.post_success = true;
    }

    app.location_preview = function(){
        document.getElementById("display_location").style.border="3px solid #60cc60";
        const coordinates_cleaned = app.vue.coordinates.replace(/\s/g, "");
        const coordinates_split = coordinates_cleaned.split(",");
        if(coordinates_split.length != 2){
            document.getElementById("display_location").style.border="3px solid #d00000";
            return -1;
        }
        const latitude = coordinates_split[0];
        if(isNaN(latitude) || isNaN(parseFloat(latitude)) || parseFloat(latitude) < -90 || parseFloat(latitude) > 90){
            document.getElementById("display_location").style.border="3px solid #d00000";
            return -1;
        }
        const longitude = coordinates_split[1];
        if(isNaN(longitude) || isNaN(parseFloat(longitude)) || parseFloat(longitude) < -180 || parseFloat(longitude) > 180){
            document.getElementById("display_location").style.border="3px solid #d00000";
            return -1;
        }
        document.getElementById("display_location").src = "https://maps.google.com/maps?q=" + latitude + "," + longitude + "&z=" + app.vue.location_preview_zoom + "&output=embed";
    };

    app.current_location = function(){
        app.vue.war_geoloc = false;
        navigator.geolocation.getCurrentPosition(
            function(pos_obj){
                app.vue.coordinates = pos_obj.coordinates.latitude + ", " + pos_obj.coordinates.longitude;
                app.vue.prg_geoloc = false;
                app.location_preview();
            },
            function(err){
                app.vue.war_geoloc = true;
                app.vue.prg_geoloc = false;
                return -1;
            }
        );
    };

    // This contains all the methods.
    app.methods = {
        // Complete as you see fit.
        settings: app.settings,
        location_preview: app.location_preview,
        current_location: app.current_location,
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target-settings",
        data: app.data,
        methods: app.methods,
        // GCS
        computed: app.computed,
    });

    // And this initializes it.
    app.init = () => {
        // Put here any initialization code.
        // Typically this is a server GET call to load the data.
        const today = new Date();
        app.vue.new_pet_lostfound_date_m = String(today.getMonth() + 1).padStart(2, "0");
        app.vue.new_pet_lostfound_date_d = String(today.getDate()).padStart(2, "0");
        app.vue.new_pet_lostfound_date_y = today.getFullYear();
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);