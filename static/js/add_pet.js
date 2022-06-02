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
        new_pet_name: "",
        new_pet_type: "Dog",
        new_pet_lostfound_date_m: -1,
        new_pet_lostfound_date_d: -1,
        new_pet_lostfound_date_y: -1,
        new_pet_lost: "true",
        new_pet_description: "",
        new_pet_lat_lng: "",
        err_name: false,
        err_name_i: "",
        err_type: false,
        err_type_i: "",
        err_lost: false,
        err_lost_i: "",
        war_lost: "",
        err_date: false,
        err_date_i: "",
        err_description: false,
        err_description_i: "",
        err_coord: false,
        err_coord_i: "",
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
        app.vue.err_lost = false;
        app.vue.err_date = false;
        app.vue.err_description = false;
        app.vue.err_coord = false;
        
        // Check name.
        if(app.vue.new_pet_name.replace(/\s/g, "").length === 0){
            app.vue.err_name_i = "empty pet name. Please specify a pet name that contains 1 or more characters."
            app.vue.err_name = true;
            return -1;
        }

        // Check type.
        if(!["Dog", "Cat", "Bird", "Rodent", "Reptile", "Rabbit", "Pet Livestock", "Aquatic", "Other"].includes(app.vue.new_pet_type)){
            app.vue.err_type_i = "invalid pet type. Please select a pet type from the given options."
            app.vue.err_type = true;
            return -1;
        }

        // Check lost.
        if(!["true", "false"].includes(app.vue.new_pet_lost)){
            app.vue.err_lost_i = "invalid pet lost or found value. Please select whether the pet was lost or found.";
            app.vue.err_lost = true;
            return -1;
        }
        let new_pet_lost_bool = true;
        if(app.vue.new_pet_lost === "false"){
            new_pet_lost_bool = false;
        }

        // Check date.
        if(isNaN(app.vue.new_pet_lostfound_date_m) || (app.vue.new_pet_lostfound_date_m.length === 0)){
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
        if(isNaN(app.vue.new_pet_lostfound_date_d) || (app.vue.new_pet_lostfound_date_d.length === 0)){
            app.vue.err_date_i = "date is not a number. Please specify a date with a number.";
            app.vue.err_date = true;
            return -1;
        }
        app.vue.new_pet_lostfound_date_d = parseInt(app.vue.new_pet_lostfound_date_d);
        if(isNaN(app.vue.new_pet_lostfound_date_y) || (app.vue.new_pet_lostfound_date_y.length === 0)){
            app.vue.err_date_i = "year is not a number. Please specify a year with a number";
            app.vue.err_date = true;
            return -1;
        }
        app.vue.new_pet_lostfound_date_y = parseInt(app.vue.new_pet_lostfound_date_y);
        if((app.vue.new_pet_lostfound_date_y < 2012) || (app.vue.new_pet_lostfound_date_y > 2022)){
            app.vue.err_date_i = "year not in range. Please specify a year with a number between 2012 to 2022.";
            app.vue.err_date = true;
            return -1;
        }
        let month_upp;
        if([1, 3, 5, 7, 8, 10, 12].includes(app.vue.new_pet_lostfound_date_m)){
            month_upp = 31;
        }
        else if(app.vue.new_pet_lostfound_date_m > 2){
            month_upp = 30;
        }
        else{
            const leap_year = (0 === app.vue.new_pet_lostfound_date_y % 4) && (0 !== app.vue.new_pet_lostfound_date_y % 100) || (0 === app.vue.new_pet_lostfound_date_y % 400);
            month_upp = !leap_year ? 28 : 29;
        }
        const today_date = new Date();
        const in_date = new Date(app.vue.new_pet_lostfound_date_y, app.vue.new_pet_lostfound_date_m - 1, app.vue.new_pet_lostfound_date_d);
        if(in_date.getTime() > today_date.getTime()){
            app.vue.err_date_i = "date is in the future. Please specify a date between January 1, 2012 to today.";
            app.vue.err_date = true;
            return -1;
        }
        if(app.vue.new_pet_lostfound_date_d < 1 || app.vue.new_pet_lostfound_date_d > month_upp){
            app.vue.err_date_i = "date not in range. Please specify a date with a number between 1 and " + month_upp + ".";
            app.vue.err_date = true;
            return -1;
        }

        // Check description.
        if(app.vue.new_pet_description.replace(/\s/g, "").length === 0){
            app.vue.err_description_i = "description is empty. Please provide a description about your pet.";
            app.vue.err_description = true;
            return -1;
        }

        // Check coordinates.
        const new_pet_lat_lng_cleaned = app.vue.new_pet_lat_lng.replace(/\s/g, "");
        let new_pet_lat_lng_split = new_pet_lat_lng_cleaned.split(",");
        if(new_pet_lat_lng_split.length !== 2){
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

        // Everything alright, add entry.
        axios.post(add_post_url,
            {
                new_pet_name: app.vue.new_pet_name,
                new_pet_type: app.vue.new_pet_type,
                new_pet_lost: new_pet_lost_bool,
                new_pet_lostfound_date_m: app.vue.new_pet_lostfound_date_m,
                new_pet_lostfound_date_d: app.vue.new_pet_lostfound_date_d,
                new_pet_lostfound_date_y: app.vue.new_pet_lostfound_date_y,
                new_pet_description: app.vue.new_pet_description,
                new_pet_lat: new_pet_lat,
                new_pet_lng: new_pet_lng,
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
        let input = event.target;
        let file = input.files[0];
        if (file) {
            app.vue.uploading = true;
            let file_type = file.type;
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
            app.vue.upload_id = null;
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
    };

    // This contains all the methods.
    app.methods = {
        // Complete as you see fit.
        add_post: app.new_post,
        // GCS
        upload_file: app.upload_file, // Uploads a selected file
        delete_file: app.delete_file, // Delete the file.
        download_file: app.download_file, // Downloads it.
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target-newpost",
        data: app.data,
        // GCS
        computed: app.computed,
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
        axios.get(file_info_url)
            .then(function (r) {
                app.set_result(r);
            });
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);