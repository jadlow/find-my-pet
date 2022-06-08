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
        first_name: "",
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
        // GCS
        file_name: null, // File name
        file_type: null, // File type
        file_date: null, // Date when file uploaded
        file_path: null, // Path of file in GCS
        file_size: null, // Size of uploaded file
        download_url: null, // URL to download a file
        uploading: false, // upload in progress
        deleting: false, // delete in progress
        delete_confirmation: false, // Show the delete confirmation thing.
        upload_id: -1,
        preview_url: null
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

    app.file_info = function () {
        if (app.vue.file_path) {
            let info = "";
            if (app.vue.file_size) {
                info = humanFileSize(app.vue.file_size.toString(), si=true);
            }
            if (app.vue.file_type) {
                if (info) {
                    info += " " + app.vue.file_type;
                } else {
                    info = app.vue.file_type;
                }
            }
            if (info) {
                info = " (" + info + ")";
            }
            if (app.vue.file_date) {
                let d = new Sugar.Date(app.vue.file_date + "+00:00");
                info += ", uploaded " + d.relative();
            }
            return app.vue.file_name + info;
        } else {
            return "";
        }
    }


    app.set_result = function (r) {
        // Sets the results after a server call.
        app.vue.file_name = r.data.file_name;
        app.vue.file_type = r.data.file_type;
        app.vue.file_date = r.data.file_date;
        app.vue.file_path = r.data.file_path;
        app.vue.file_size = r.data.file_size;
        app.vue.download_url = r.data.download_url;
        app.vue.upload_id = r.data.upload_id;
    }

    app.upload_file = function (event) {
        app.vue.err_photo_bad_type = false;
        let input = event.target;
        let file = input.files[0];
        if (file) {
            app.vue.uploading = true;
            let file_type = file.type;
            if(!app.vue.photo_extensions.includes(file_type.toLowerCase().split("/")[1])){
                app.vue.err_photo_bad_type = true;
                app.vue.file_name = null;
                app.vue.file_type = null;
                app.vue.file_date = null;
                app.vue.file_path = null;
                app.vue.file_size = null;
                app.vue.download_url = null;
                app.vue.uploading = false;
                app.vue.deleting = false;
                app.vue.delete_confirmation = false;
                app.vue.upload_id = -1;
                app.vue.preview_url = null;
                return -1;
            }
            let file_name = file.name;
            let file_size = file.size;
            // Requests the upload URL.
            axios.post(obtain_gcs_url, {
                action: "PUT",
                mimetype: file_type,
                file_name: file_name
            }).then ((r) => {
                let upload_url = r.data.signed_url;
                let file_path = r.data.file_path;
                // Uploads the file, using the low-level interface.
                let req = new XMLHttpRequest();
                // We listen to the load event = the file is uploaded, and we call upload_complete.
                // That function will notify the server `of the location of the image.
                req.addEventListener("load", function () {
                    app.upload_complete(file_name, file_type, file_size, file_path);
                });
                // TODO: if you like, add a listener for "error" to detect failure.
                req.open("PUT", upload_url, true);
                req.send(file);
            });
        }
    }

    app.upload_complete = function (file_name, file_type, file_size, file_path) {
        // We need to let the server know that the upload was complete;
        axios.post(notify_url, {
            file_name: file_name,
            file_type: file_type,
            file_path: file_path,
            file_size: file_size,
        }).then( function (r) {
            app.vue.uploading = false;
            app.vue.file_name = file_name;
            app.vue.file_type = file_type;
            app.vue.file_path = file_path;
            app.vue.file_size = file_size;
            app.vue.file_date = r.data.file_date;
            app.vue.download_url = r.data.download_url;
            app.vue.upload_id = r.data.upload_id;
        });
    }

    app.delete_file = function () {
        if (!app.vue.delete_confirmation) {
            // Ask for confirmation before deleting it.
            app.vue.delete_confirmation = true;
        } else {
            // It's confirmed.
            app.vue.delete_confirmation = false;
            app.vue.deleting = true;
            // Obtains the delete URL.
            let file_path = app.vue.file_path;
            axios.post(obtain_gcs_url, {
                action: "DELETE",
                file_path: file_path,
            }).then(function (r) {
                let delete_url = r.data.signed_url;
                if (delete_url) {
                    // Performs the deletion request.
                    let req = new XMLHttpRequest();
                    req.addEventListener("load", function () {
                        app.deletion_complete(file_path);
                    });
                    // TODO: if you like, add a listener for "error" to detect failure.
                    req.open("DELETE", delete_url);
                    req.send();

                }
            });
        }
    };

    app.deletion_complete = function (file_path) {
        // We need to notify the server that the file has been deleted on GCS.
        axios.post(delete_url, {
            file_path: file_path,
        }).then (function (r) {
            // Poof, no more file.
            app.vue.deleting =  false;
            app.vue.file_name = null;
            app.vue.file_type = null;
            app.vue.file_date = null;
            app.vue.file_path = null;
            app.vue.download_url = null;
            app.vue.upload_id = -1;
        })
    }

    app.download_file = function () {
        if (app.vue.download_url) {
            let req = new XMLHttpRequest();
            req.addEventListener("load", function () {
                app.do_download(req);
            });
            req.responseType = 'blob';
            req.open("GET", app.vue.download_url, true);
            req.send();
        }
    };

    app.do_download = function (req) {
        // This Machiavellic implementation is thanks to Massimo DiPierro.
        // This creates a data URL out of the file we downloaded.
        let data_url = URL.createObjectURL(req.response);
        // Let us now build an a tag, not attached to anything,
        // that looks like this:
        // <a href="my data url" download="myfile.jpg"></a>
        let a = document.createElement('a');
        a.href = data_url;
        a.download = app.vue.file_name;
        // and let's click on it, to do the download!
        a.click();
        // we clean up our act.
        a.remove();
        URL.revokeObjectURL(data_url);
    };

    app.computed = {
        file_info: app.file_info,
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

    app.get_user_info = function(){
        axios.get(get_user_info_url)
            .then(function(res){
                app.vue.first_name = res.data.first_name;
            });
    };

    // This contains all the methods.
    app.methods = {
        // Complete as you see fit.
        settings: app.settings,
        get_user_info: app.get_user_info,
        location_preview: app.location_preview,
        current_location: app.current_location,
        // GCS
        upload_file: app.upload_file, // Uploads a selected file
        delete_file: app.delete_file, // Delete the file.
        download_file: app.download_file, // Downloads it.
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
        axios.get(get_user_info_url)
            .then(function(res){
                app.vue.first_name = res.data.first_name;
                app.vue.last_name = res.data.last_name;
                app.vue.email = res.data.email;
                app.vue.phone_num = res.data.phone_num;
                app.vue.radius = res.data.radius;
                app.vue.coordinates = res.data.coordinates;
                // app.vue.latitude = res.data.latitude;
                // app.vue.longitude = res.data.longitude;
                app.vue.upload_id = parseInt(res.data.photo);
                app.vue.upload_id_temp = app.vue.upload_id;
                app.location_preview();
            }).then(axios.get(get_file_info_url)
                .then(function (r) {
                    app.vue.file_name = r.data.file_name;
                    app.vue.file_type = r.data.file_type;
                    app.vue.file_date = r.data.file_date;
                    app.vue.file_path = r.data.file_path;
                    app.vue.file_size = r.data.file_size;
                    app.vue.download_url = r.data.download_url;
                    app.vue.uploading = false;
                    app.vue.deleting = false;
                    app.vue.delete_confirmation = false;
                    app.vue.preview_url = null;
                    app.vue.temp_file_path = app.vue.file_path;
                })
            );
        return -1;
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);