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
        cur_pet_name: "",
        cur_pet_type: "",
        cur_pet_lostfound_date_m: -1,
        cur_pet_lostfound_date_d: -1,
        cur_pet_lostfound_date_y: -1,
        cur_pet_lost: "true",
        cur_pet_description: "",
        cur_pet_lat_lng: "",
        err_main: false,
        err_name: false,
        err_name_i: "",
        err_type: false,
        err_type_i: "",
        err_lost: false,
        err_lost_i: "",
        err_date: false,
        err_date_i: "",
        err_description: false,
        err_description_i: "",
        description_rec_words: [],
        err_photo_null: false,
        err_photo_bad_type: false,
        photo_extensions: ["gif", "jpg", "jpeg", "png", "svg", "tif", "webp"],
        err_coord: false,
        err_coord_i: "",
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
        upload_id_temp: -1,
        temp_file_path: null,
        preview_url: null,
        new_img_post: false,
        new_img_post_check_other: false
    };

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };


    app.edit_post = function(){
        app.vue.err_main = false;
        app.vue.err_name = false;
        app.vue.err_type = false;
        app.vue.err_lost = false;
        app.vue.err_date = false;
        app.vue.err_description = false;
        app.vue.err_photo_null = false;
        app.vue.err_photo_bad_type = false;
        app.vue.err_coord = false;
        app.vue.war_geoloc = false;
        
        // Check name.
        if(app.vue.cur_pet_name.replace(/\s/g, "").length == 0){
            app.vue.err_name_i = "empty pet name. Please specify a pet name that contains 1 or more characters."
            app.vue.err_name = true;
            app.vue.err_main = true;
            return -1;
        }

        // Check type.
        if(!["Dog", "Cat", "Bird", "Rodent", "Reptile", "Rabbit", "Pet Livestock", "Aquatic", "Other"].includes(app.vue.cur_pet_type)){
            app.vue.err_type_i = "invalid pet type. Please select a pet type from the given options."
            app.vue.err_type = true;
            app.vue.err_main = true;
            return -1;
        }

        // Check lost.
        if(!["true", "false"].includes(app.vue.cur_pet_lost)){
            app.vue.err_lost_i = "invalid pet lost or found value. Please select whether the pet was lost or found.";
            app.vue.err_lost = true;
            app.vue.err_main = true;
            return -1;
        }
        let cur_pet_lost_bool = true;
        if(app.vue.cur_pet_lost == "false"){
            cur_pet_lost_bool = false;
        }

        // Check date.
        if(isNaN(app.vue.cur_pet_lostfound_date_m) || isNaN(parseInt(app.vue.cur_pet_lostfound_date_m))){
            app.vue.err_date_i = "month is not a number. Please specify a month with a number.";
            app.vue.err_date = true;
            app.vue.err_main = true;
            return -1;
        }
        app.vue.cur_pet_lostfound_date_m = parseInt(app.vue.cur_pet_lostfound_date_m);
        if((app.vue.cur_pet_lostfound_date_m < 1) || (app.vue.cur_pet_lostfound_date_m > 12)){
            app.vue.err_date_i = "month not in range. Please specify a month with a number between 1 to 12.";
            app.vue.err_date = true;
            app.vue.err_main = true;
            return -1;
        }
        if(isNaN(app.vue.cur_pet_lostfound_date_d) || isNaN(parseInt(app.vue.cur_pet_lostfound_date_d))){
            app.vue.err_date_i = "date is not a number. Please specify a date with a number.";
            app.vue.err_date = true;
            app.vue.err_main = true;
            return -1;
        }
        app.vue.cur_pet_lostfound_date_d = parseInt(app.vue.cur_pet_lostfound_date_d);
        if(isNaN(app.vue.cur_pet_lostfound_date_y) || isNaN(parseInt(app.vue.cur_pet_lostfound_date_y))){
            app.vue.err_date_i = "year is not a number. Please specify a year with a number";
            app.vue.err_date = true;
            app.vue.err_main = true;
            return -1;
        }
        app.vue.cur_pet_lostfound_date_y = parseInt(app.vue.cur_pet_lostfound_date_y);
        if((app.vue.cur_pet_lostfound_date_y < 2012) || (app.vue.cur_pet_lostfound_date_y > 2022)){
            app.vue.err_date_i = "year not in range. Please specify a year with a number between 2012 to 2022.";
            app.vue.err_date = true;
            app.vue.err_main = true;
            return -1;
        }
        let month_upp = -1;
        if([1, 3, 5, 7, 8, 10, 12].includes(app.vue.cur_pet_lostfound_date_m)){
            month_upp = 31;
        }
        else if(app.vue.cur_pet_lostfound_date_m > 2){
            month_upp = 30;
        }
        else{
            const leap_year = (0 == app.vue.cur_pet_lostfound_date_y % 4) && (0 != app.vue.cur_pet_lostfound_date_y % 100) || (0 == app.vue.cur_pet_lostfound_date_y % 400);
            month_upp = !leap_year ? 28 : 29;
        }
        const today_date = new Date();
        const in_date = new Date(app.vue.cur_pet_lostfound_date_y, app.vue.cur_pet_lostfound_date_m - 1, app.vue.cur_pet_lostfound_date_d);
        if(in_date.getTime() > today_date.getTime()){
            app.vue.err_date_i = "date is in the future. Please specify a date between January 1, 2012 to today.";
            app.vue.err_date = true;
            app.vue.err_main = true;
            return -1;
        }
        if(app.vue.cur_pet_lostfound_date_d < 1 || app.vue.cur_pet_lostfound_date_d > month_upp){
            app.vue.err_date_i = "date not in range. Please specify a date with a number between 1 and " + month_upp + ".";
            app.vue.err_date = true;
            app.vue.err_main = true;
            return -1;
        }

        // Check description.
        if(app.vue.cur_pet_description.replace(/\s/g, "").length < 20){
            app.vue.err_description_i = "description does not reach length requirement. Please provide a description about the pet with at least 20 characters, excluding spaces.";
            app.vue.err_description = true;
            app.vue.err_main = true;
            return -1;
        }

        // Check photo
        if(!app.vue.new_img_post_check_other){
            if(app.vue.file_name == null || app.vue.file_name == ""){
                app.vue.err_photo_null = true;
                app.vue.err_main = true;
                return -1;
            }
        }

        // Check coordinates.
        const cur_pet_lat_lng_cleaned = app.vue.cur_pet_lat_lng.replace(/\s/g, "");
        cur_pet_lat_lng_split = cur_pet_lat_lng_cleaned.split(",");
        if(cur_pet_lat_lng_split.length != 2){
            app.vue.err_coord_i = "coordinate length invalid. Please specify a coordinate with two numbers separated by a comma.";
            app.vue.err_coord = true;
            app.vue.err_main = true;
            return -1;
        }
        let cur_pet_lat = cur_pet_lat_lng_split[0];
        let cur_pet_lng = cur_pet_lat_lng_split[1];
        if(isNaN(cur_pet_lat) || isNaN(parseFloat(cur_pet_lat))){
            app.vue.err_coord_i = "latitude is not a number. Please specify a number for the latitude.";
            app.vue.err_coord = true;
            app.vue.err_main = true;
            return -1;
        }
        else{
            cur_pet_lat = parseFloat(cur_pet_lat);
        }
        if(isNaN(cur_pet_lng) || isNaN(parseFloat(cur_pet_lng))){
            app.vue.err_coord_i = "longitude is not a number. Please specify a number for the longitude.";
            app.vue.err_coord = true;
            app.vue.err_main = true;
            return -1;
        }
        else{
            cur_pet_lng = parseFloat(cur_pet_lng);
        }
        if(cur_pet_lat < -90 || cur_pet_lat > 90){
            app.vue.err_coord_i = "latitude is not in range. Please specify a number for the latitude between -90 to 90.";
            app.vue.err_coord = true;
            app.vue.err_main = true;
            return -1;
        }
        if(cur_pet_lng < -180 || cur_pet_lng > 180){
            app.vue.err_coord_i = "longitude is not in range. Please specify a number for the longitude between -180 to 180.";
            app.vue.err_coord = true;
            app.vue.err_main = true;
            return -1;
        }

        if(!app.vue.new_img_post_check_other){
            // Everything alright, edit entry.
            axios.post(edit_post_url,
                {
                    cur_pet_name: app.vue.cur_pet_name,
                    cur_pet_type: app.vue.cur_pet_type,
                    cur_pet_lost: cur_pet_lost_bool,
                    cur_pet_lostfound_date_m: app.vue.cur_pet_lostfound_date_m,
                    cur_pet_lostfound_date_d: app.vue.cur_pet_lostfound_date_d,
                    cur_pet_lostfound_date_y: app.vue.cur_pet_lostfound_date_y,
                    cur_pet_description: app.vue.cur_pet_description,
                    cur_pet_lat: cur_pet_lat,
                    cur_pet_lng: cur_pet_lng,
                    photo: app.vue.upload_id,
                }    
            );
        }

        if(!app.vue.new_img_post && !app.vue.new_img_post_check_other){
            app.vue.post_success = true;
        }
        else{
            app.vue.new_img_post = false;
        }
    };

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
    };


    app.set_result = function (r) {
        // Sets the results after a server call.
        app.vue.file_name = r.data.file_name;
        app.vue.file_type = r.data.file_type;
        app.vue.file_date = r.data.file_date;
        app.vue.file_path = r.data.file_path;
        app.vue.file_size = r.data.file_size;
        app.vue.download_url = r.data.download_url;
        app.vue.upload_id = r.data.upload_id;
    };

    app.upload_file = function (event) {
        app.vue.err_photo_bad_type = false;
        app.vue.new_img_post_check_other = true;
        if(app.edit_post() == -1){
            app.vue.new_img_post_check_other = false;
            return -1;
        }
        app.vue.new_img_post_check_other = false;
        let input = event.target;
        let file = input.files[0];
        if (file) {
            app.vue.uploading = true;
            let file_type = file.type;
            if(!app.vue.photo_extensions.includes(file_type.toLowerCase().split("/")[1])){
                app.vue.err_photo_bad_type = true;
                app.vue.delete_confirmation = false;
                app.vue.deleting =  false;
                app.vue.file_name = null;
                app.vue.file_type = null;
                app.vue.file_date = null;
                app.vue.file_size = null;
                app.vue.file_info = null;
                app.vue.download_url = null;
                app.vue.uploading = false;
                app.vue.temp_file_path = false;
                app.vue.upload_id_temp = -1;
                return -1;
            }
            app.delete_file();
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
                app.vue.temp_file_path = r.data.file_path;
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
    };

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
            app.vue.upload_id_temp = app.vue.upload_id;
            app.vue.temp_file_path = app.vue.file_path;
            app.vue.new_img_post = true;
            app.edit_post();
        });
    };

    app.pseudo_delete_file = function () {
        if (!app.vue.delete_confirmation) {
            // Ask for confirmation before deleting it.
            app.vue.delete_confirmation = true;
        } else {
            app.vue.delete_confirmation = false;
            app.vue.deleting =  false;
            app.vue.file_name = null;
            app.vue.file_type = null;
            app.vue.file_date = null;
            app.vue.file_size = null;
            app.vue.file_info = null;
            app.vue.download_url = null;
            app.vue.uploading = false;
            app.vue.temp_file_path = false;
            app.vue.upload_id_temp = -1;
        }
    }

    app.delete_file = function(){
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
            app.vue.upload_id_temp = -1;
            app.vue.upload_id = -1;
            app.vue.temp_file_path = null;
        })
    };

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

    app.location_preview = function(){
        document.getElementById("display_location").style.border="3px solid #60cc60";
        const cur_pet_lat_lng_cleaned = app.vue.cur_pet_lat_lng.replace(/\s/g, "");
        const cur_pet_lat_lng_split = cur_pet_lat_lng_cleaned.split(",");
        if(cur_pet_lat_lng_split.length != 2){
            document.getElementById("display_location").style.border="3px solid #d00000";
            return -1;
        }
        const cur_pet_lat = cur_pet_lat_lng_split[0];
        if(isNaN(cur_pet_lat) || isNaN(parseFloat(cur_pet_lat)) || parseFloat(cur_pet_lat) < -90 || parseFloat(cur_pet_lat) > 90){
            document.getElementById("display_location").style.border="3px solid #d00000";
            return -1;
        }
        const cur_pet_lng = cur_pet_lat_lng_split[1];
        if(isNaN(cur_pet_lng) || isNaN(parseFloat(cur_pet_lng)) || parseFloat(cur_pet_lng) < -180 || parseFloat(cur_pet_lng) > 180){
            document.getElementById("display_location").style.border="3px solid #d00000";
            return -1;
        }
        document.getElementById("display_location").src = "https://maps.google.com/maps?q=" + cur_pet_lat + "," + cur_pet_lng + "&z=" + app.vue.location_preview_zoom + "&output=embed";
    };

    app.current_location = function(){
        app.vue.war_geoloc = false;
        navigator.geolocation.getCurrentPosition(
            function(pos_obj){
                app.vue.cur_pet_lat_lng = pos_obj.coords.latitude + ", " + pos_obj.coords.longitude;
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

    app.calc_description_length = function(){
        const cur_pet_description_length = app.vue.cur_pet_description.replace(/\s/g, "").length;
        const cur_pet_description_min_length_reached = cur_pet_description_length >= 20 ? "reached" : "not reached";
        document.querySelector("#show_description_length").innerHTML = "<span style=\"color: " + (cur_pet_description_length >= 20 ? "#00aa00" : "#ff0000") + "\"><i class=\"fa fa-pencil-square\"></i></span>&ensp;" + cur_pet_description_length + " characters inputted, excluding spaces (20 minimum requirement " + cur_pet_description_min_length_reached + ")";
    };

    app.gen_description_rec = function(){
        /*
        Description word recommendations work by going through a word pool, seeing if the word is in the
        phrase, if so, put the words after in the recommendations. <_num+ne1_> is token for numbers not 
        1, <_num+eq1_> is token for 1.
        */ 
        const words_pool = [
            // Age
            // --- Age year
            "age <_num+ne1_> years old", "age <_num+eq1_> year old",
            // --- Age month
            "age <_num+ne1_> months old", "age <_num+eq1_> month old",
            // --- Age week
            "age <_num+ne1_> weeks old", "age <_num+eq1_> week old",
            // --- Age day
            "age <_num+ne1_> days old", "age <_num+eq1_> day old",
            // Height
            // --- Height meter
            "height <_num+ne1_> meters high", "height <_num+ne1_> meters tall", "height <_num+eq1_> meter high", "height <_num+eq1_> meter tall",
            // --- Height foot
            "height <_num+ne1_> feet high", "height <_num+ne1_> feet tall", "height <_num+eq1_> foot high", "height <_num+eq1_> foot tall", 
            // --- Height inch
            "height <_num+ne1_> inches high", "height <_num+ne1_> inches tall", "height <_num+eq1_> inch high", "height <_num+eq1_> inch tall",
            // --- Height centimeter
            "height <_num+ne1_> centimeters high", "height <_num+ne1_> centimeters tall", "height <_num+eq1_> centimeter high", "height <_num+eq1_> centimeter tall",
            // Weight
            // --- Weight pound
            "weight <_num+ne1_> pounds", "weight <_num+eq1_> pound",
            // --- Weight ounce
            "weight <_num+ne1_> ounces", "weight <_num+eq1_> ounce",
            // --- Weight kilos
            "weight <_num+ne1_> kilos", "weight <_num+eq1_> kilo",
            // Colour
            // --- Colour red
            "red hair", "red fur", "red feathers",
            // --- Colour orange
            "orange hair", "orange fur", "orange feathers",
            // --- Colour yellow
            "yellow hair", "yellow fur", "yellow feathers",
            // --- Colour green
            "green hair", "green fur", "green feathers",
            // --- Colour blue
            "blue hair", "blue fur", "blue feathers",
            // --- Colour white
            "white hair", "white fur", "white feathers",
            // --- Colour gray
            "gray hair", "gray fur", "gray feathers", "grey hair", "grey fur",
            "grey feathers",
            // --- Colour black
            "black hair", "black fur", "black feathers",
            // Dogs (source: https://www.akc.org/expert-advice/dog-breeds/most-popular-dog-breeds-of-2021/)
            "Labrador Retriever dog", "French Bulldog dog", "Golden Retriever dog", "German Shepherd dog", "Poodle dog",
            "Bulldog dog", "Beagle dog", "Rottweiler dog", "German Shorthaired Pointer dog", "Dachshund dog",
            "Pembroke Welsh Corgi dog", "Australian Shepherd dog", "Yorkshire Terrier dog", "Boxer dog", "Cavalier King Charles Spaniel dog",
            "Doberman Pinscher dog", "Great Dane dog", "Miniature Schnauzer dog", "Siberian Husky dog", "Bernese Mountain dog",
            "Cane Corso dog", "Shih Tzu dog", "Boston Terrier dog", "Pomeranian dog", "Havanese dog",
            "English Springer Spaniel dog", "Brittany dog", "Shetland Sheepdog dog", "Cocker Spaniel dog", "Miniature American Shepherd dog",
            "Border Collie dog", "Vizsla dog", "Pug dog", "Basset Hound dog", "Mastiff dog",
            "Belgian Malinois dog", "Chihuahua dog", "Collie dog", "Maltese dog", "Weimaraner dog",
            // Cats (source: https://www.catbreedslist.com/)
            "Ragdoll cat", "Exotic Shorthair cat", "British Shorthair cat", "Persian cat", "Maine Coon cat",
            "American Shorthair cat", "Devon Rex cat", "Sphynx cat", "Scottish Fold cat", "Abyssinian cat",
            "Oriental cat", "Siamese cat", "Norwegian Forest cat", "Cornish Rex cat", "Bengal cat",
            "Russian Blue cat", "Siberian cat", "Burmese cat", "Birman cat", "Tonkinese cat",
            "Ocicat cat", "Selkirk Rex cat", "Ragamuffin cat", "American Curl cat", "Japanese Bobtail cat",
            "Manx cat", "Egyptian Mau cat", "Somali cat", "Balinese cat", "Singapura cat",
            "Colorpoint Shorthair cat", "Lykoi cat", "Chartreux cat", "Turkish Angora cat", "European Burmese cat",
            "Bombay cat", "Khao Manee cat", "Burmilla cat", "Korat cat", "American Bobtail cat",
            // Birds (source: https://www.thehappychickencoop.com/14-of-the-most-popular-companion-birds/)
            "Parakeet bird", "African Gray Parrot bird", "Lovebird bird", "Cockatoo bird", "Finch bird",
            "Dove bird", "Cockatiel bird", "Parrotlet bird", "Conure bird", "Monk Parakeet bird",
            "Amazon Parrot bird", "Pionus Parrot bird", "Hyacinth Macaw bird", "Hahn’s Macaw bird"
        ];
        if(app.vue.cur_pet_description.length == 0){
            app.vue.description_rec_words = ["age", "height", "weight", "dog", "cat", "bird", "rabbit"];
            return 1;
        }
        const desElement = document.querySelector("#in_description");
        const desElementSelEnd = desElement.selectionEnd - 1;
        if(isNaN(desElementSelEnd) || isNaN(parseInt(desElementSelEnd))){
            return 1;
        }
        if(app.vue.cur_pet_description[desElementSelEnd] == " "){
            return 1;
        }
        else{
            app.vue.description_rec_words = [];
            let curr_word = app.vue.cur_pet_description[desElementSelEnd];
            let temp_des_ind = desElementSelEnd - 1;
            let other_pets = ["dog", "cat", "bird"];
            if(other_pets.indexOf(app.vue.cur_pet_type.toLowerCase()) != -1){
                other_pets.splice(other_pets.indexOf(app.vue.cur_pet_type.toLowerCase()), 1);
            }
            else{
                other_pets = [];
            }
            while(true){
                if(temp_des_ind < 0){
                    break;
                }
                if(app.vue.cur_pet_description[temp_des_ind] == " "){
                    break;
                }
                curr_word = app.vue.cur_pet_description[temp_des_ind] + curr_word;
                temp_des_ind -= 1;
            }
            curr_word = curr_word.toLowerCase();
            if(!isNaN(curr_word) && !isNaN(parseFloat(curr_word))){
                if(parseFloat(curr_word) == 1){
                    curr_word = "<_num+eq1_>";
                }
                else{
                    curr_word = "<_num+ne1_>"
                }
            }
            for(let ws in words_pool){
                const words = words_pool[ws];
                const words_split = words.split(" ");
                let words_split_lower = [];
                for(let w in words_split){
                    words_split_lower.push(words_split[w].toLowerCase());
                }
                if(words_split_lower.includes(curr_word) && !(other_pets.some(r =>  words_split_lower.includes(r)))){
                    const words_ind = words_split_lower.indexOf(curr_word);
                    for(let w = words_ind + 1; w < words_split.length; w++){
                        if(!app.vue.description_rec_words.includes(words_split[w]) && (words_split[w] != "<_num+eq1_>") && (words_split[w] != "<_num+ne1_>")){
                            app.vue.description_rec_words.push(words_split[w]);
                        }
                        else if(!app.vue.description_rec_words.includes(words_split[w])){
                            for(let i = 1; i < 10; i++){
                                if(!app.vue.description_rec_words.includes("" + i)){
                                    app.vue.description_rec_words.push("" + i);
                                }
                            }
                        }
                    }
                }
            }
            app.vue.description_rec_words.sort(function(fw, sw){
                return fw.toLowerCase().localeCompare(sw.toLowerCase());
            });
        }
    };

    app.put_description_rec = function(cur_word){
        cur_word = cur_word["word"];
        const desElement = document.querySelector("#in_description");
        const desElementSelEnd = desElement.selectionEnd;
        if(app.vue.cur_pet_description.length == 0){
            app.vue.cur_pet_description = cur_word;
        }
        else{
            app.vue.cur_pet_description = app.vue.cur_pet_description.slice(0, desElementSelEnd) + (app.vue.cur_pet_description[desElementSelEnd - 1] == " " ? "": " ") + cur_word + app.vue.cur_pet_description.slice(desElementSelEnd);
        }
        desElement.focus();
    };

    app.get_pet_info = function(){
        axios.get(get_pet_info_url)
            .then(function(res){
                app.vue.cur_pet_name = res.data.cur_pet_name;
            });
    };

    // This contains all the methods.
    app.methods = {
        // Complete as you see fit.
        edit_post: app.edit_post,
        get_pet_info: app.get_pet_info,
        location_preview: app.location_preview,
        current_location: app.current_location,
        calc_description_length: app.calc_description_length,
        gen_description_rec: app.gen_description_rec,
        put_description_rec: app.put_description_rec,
        // GCS
        upload_file: app.upload_file, // Uploads a selected file
        delete_file: app.delete_file, // Delete the file.
        download_file: app.download_file, // Downloads it.
        location_preview: app.location_preview,
        current_location: app.current_location,
        calc_description_length: app.calc_description_length,
        gen_description_rec: app.gen_description_rec,
        put_description_rec: app.put_description_rec,
        pseudo_delete_file: app.pseudo_delete_file
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target-editpost",
        data: app.data,
        methods: app.methods,
        // GCS
        computed: app.computed,
    });

    // And this initializes it.
    app.init = () => {
        // Put here any initialization code.
        // Typically this is a server GET call to load the data.
        let photo_index = -1;
        axios.get(get_pet_info_url)
            .then(function(res){
                app.vue.cur_pet_name = res.data.cur_pet_name;
                app.vue.cur_pet_type = res.data.cur_pet_type;
                app.vue.cur_pet_lost = "" + res.data.cur_pet_lost;
                const cur_pet_lostfound_date_split = res.data.cur_pet_lostfound_date.split("-");
                app.vue.cur_pet_lostfound_date_d = cur_pet_lostfound_date_split[2];
                app.vue.cur_pet_lostfound_date_m = cur_pet_lostfound_date_split[1];
                app.vue.cur_pet_lostfound_date_y = cur_pet_lostfound_date_split[0];
                app.vue.cur_pet_description = res.data.cur_pet_description;
                app.vue.cur_pet_lat = res.data.cur_pet_lat;
                app.vue.cur_pet_lng = res.data.cur_pet_lng;
                app.vue.cur_pet_lat_lng = app.vue.cur_pet_lat + ", " + app.vue.cur_pet_lng;
                app.vue.upload_id = parseInt(res.data.cur_pet_photo);
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