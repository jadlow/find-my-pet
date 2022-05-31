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
        new_pet_lost: "true",
        new_pet_description: "",
        new_pet_lat_lng: "",
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
        err_coord: false,
        err_coord_i: "",
        war_geoloc: false,
        prg_geoloc: false,
        location_preview_zoom: 12,
        show_get_coord_info: false
    };

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };


    app.new_post = function(){
        app.vue.err_main = false;
        app.vue.err_name = false;
        app.vue.err_type = false;
        app.vue.err_lost = false;
        app.vue.err_date = false;
        app.vue.err_description = false;
        app.vue.err_coord = false;
        app.vue.war_geoloc = false;
        
        // Check name.
        if(app.vue.new_pet_name.replace(/\s/g, "").length == 0){
            app.vue.err_name_i = "empty pet name. Please specify a pet name that contains 1 or more characters."
            app.vue.err_name = true;
            app.vue.err_main = true;
            return -1;
        }

        // Check type.
        if(!["Dog", "Cat", "Bird", "Rodent", "Reptile", "Rabbit", "Pet Livestock", "Aquatic", "Other"].includes(app.vue.new_pet_type)){
            app.vue.err_type_i = "invalid pet type. Please select a pet type from the given options."
            app.vue.err_type = true;
            app.vue.err_main = true;
            return -1;
        }

        // Check lost.
        if(!["true", "false"].includes(app.vue.new_pet_lost)){
            app.vue.err_lost_i = "invalid pet lost or found value. Please select whether the pet was lost or found.";
            app.vue.err_lost = true;
            app.vue.err_main = true;
            return -1;
        }
        let new_pet_lost_bool = true;
        if(app.vue.new_pet_lost == "false"){
            new_pet_lost_bool = false;
        }

        // Check date.
        if(isNaN(app.vue.new_pet_lostfound_date_m) || isNaN(parseInt(app.vue.new_pet_lostfound_date_m))){
            app.vue.err_date_i = "month is not a number. Please specify a month with a number.";
            app.vue.err_date = true;
            app.vue.err_main = true;
            return -1;
        }
        app.vue.new_pet_lostfound_date_m = parseInt(app.vue.new_pet_lostfound_date_m);
        if((app.vue.new_pet_lostfound_date_m < 1) || (app.vue.new_pet_lostfound_date_m > 12)){
            app.vue.err_date_i = "month not in range. Please specify a month with a number between 1 to 12.";
            app.vue.err_date = true;
            app.vue.err_main = true;
            return -1;
        }
        if(isNaN(app.vue.new_pet_lostfound_date_d) || isNaN(parseInt(app.vue.new_pet_lostfound_date_d))){
            app.vue.err_date_i = "date is not a number. Please specify a date with a number.";
            app.vue.err_date = true;
            app.vue.err_main = true;
            return -1;
        }
        app.vue.new_pet_lostfound_date_d = parseInt(app.vue.new_pet_lostfound_date_d);
        if(isNaN(app.vue.new_pet_lostfound_date_y) || isNaN(parseInt(app.vue.new_pet_lostfound_date_y))){
            app.vue.err_date_i = "year is not a number. Please specify a year with a number";
            app.vue.err_date = true;
            app.vue.err_main = true;
            return -1;
        }
        app.vue.new_pet_lostfound_date_y = parseInt(app.vue.new_pet_lostfound_date_y);
        if((app.vue.new_pet_lostfound_date_y < 2012) || (app.vue.new_pet_lostfound_date_y > 2022)){
            app.vue.err_date_i = "year not in range. Please specify a year with a number between 2012 to 2022.";
            app.vue.err_date = true;
            app.vue.err_main = true;
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
            app.vue.err_date_i = "date is in the future. Please specify a date between January 1, 2012 to today.";
            app.vue.err_date = true;
            app.vue.err_main = true;
            return -1;
        }
        if(app.vue.new_pet_lostfound_date_d < 1 || app.vue.new_pet_lostfound_date_d > month_upp){
            app.vue.err_date_i = "date not in range. Please specify a date with a number between 1 and " + month_upp + ".";
            app.vue.err_date = true;
            app.vue.err_main = true;
            return -1;
        }

        // Check description.
        if(app.vue.new_pet_description.replace(/\s/g, "").length < 20){
            app.vue.err_description_i = "description does not reach length requirement. Please provide a description about the pet with at least 20 characters, excluding spaces.";
            app.vue.err_description = true;
            app.vue.err_main = true;
            return -1;
        }

        // Check coordinates.
        const new_pet_lat_lng_cleaned = app.vue.new_pet_lat_lng.replace(/\s/g, "");
        new_pet_lat_lng_split = new_pet_lat_lng_cleaned.split(",");
        if(new_pet_lat_lng_split.length != 2){
            app.vue.err_coord_i = "coordinate length invalid. Please specify a coordinate with two numbers separated by a comma.";
            app.vue.err_coord = true;
            app.vue.err_main = true;
            return -1;
        }
        let new_pet_lat = new_pet_lat_lng_split[0];
        let new_pet_lng = new_pet_lat_lng_split[1];
        if(isNaN(new_pet_lat) || isNaN(parseFloat(new_pet_lat))){
            app.vue.err_coord_i = "latitude is not a number. Please specify a number for the latitude.";
            app.vue.err_coord = true;
            app.vue.err_main = true;
            return -1;
        }
        else{
            new_pet_lat = parseFloat(new_pet_lat);
        }
        if(isNaN(new_pet_lng) || isNaN(parseFloat(new_pet_lng))){
            app.vue.err_coord_i = "longitude is not a number. Please specify a number for the longitude.";
            app.vue.err_coord = true;
            app.vue.err_main = true;
            return -1;
        }
        else{
            new_pet_lng = parseFloat(new_pet_lng);
        }
        if(new_pet_lat < -90 || new_pet_lat > 90){
            app.vue.err_coord_i = "latitude is not in range. Please specify a number for the latitude between -90 to 90.";
            app.vue.err_coord = true;
            app.vue.err_main = true;
            return -1;
        }
        if(new_pet_lng < -180 || new_pet_lng > 180){
            app.vue.err_coord_i = "longitude is not in range. Please specify a number for the longitude between -180 to 180.";
            app.vue.err_coord = true;
            app.vue.err_main = true;
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
                new_pet_lng: new_pet_lng
            }    
        );
        app.vue.post_success = true;
    }

    app.location_preview = function(){
        document.getElementById("display_location").style.border="3px solid #60cc60";
        const new_pet_lat_lng_cleaned = app.vue.new_pet_lat_lng.replace(/\s/g, "");
        const new_pet_lat_lng_split = new_pet_lat_lng_cleaned.split(",");
        if(new_pet_lat_lng_split.length != 2){
            document.getElementById("display_location").style.border="3px solid #d00000";
            return -1;
        }
        const new_pet_lat = new_pet_lat_lng_split[0];
        if(isNaN(new_pet_lat) || isNaN(parseFloat(new_pet_lat)) || parseFloat(new_pet_lat) < -90 || parseFloat(new_pet_lat) > 90){
            document.getElementById("display_location").style.border="3px solid #d00000";
            return -1;
        }
        const new_pet_lng = new_pet_lat_lng_split[1];
        if(isNaN(new_pet_lng) || isNaN(parseFloat(new_pet_lng)) || parseFloat(new_pet_lng) < -180 || parseFloat(new_pet_lng) > 180){
            document.getElementById("display_location").style.border="3px solid #d00000";
            return -1;
        }
        document.getElementById("display_location").src = "https://maps.google.com/maps?q=" + new_pet_lat + "," + new_pet_lng + "&z=" + app.vue.location_preview_zoom + "&output=embed";
    };

    app.current_location = function(){
        app.vue.war_geoloc = false;
        navigator.geolocation.getCurrentPosition(
            function(pos_obj){
                app.vue.new_pet_lat_lng = pos_obj.coords.latitude + ", " + pos_obj.coords.longitude;
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
        const new_pet_description_length = app.vue.new_pet_description.replace(/\s/g, "").length;
        const new_pet_description_min_length_reached = new_pet_description_length >= 20 ? "reached" : "not reached";
        document.querySelector("#show_description_length").innerHTML = "<span style=\"color: " + (new_pet_description_length >= 20 ? "#00aa00" : "#ff0000") + "\"><i class=\"fa fa-pencil-square\"></i></span>&ensp;" + new_pet_description_length + " characters inputted, excluding spaces (20 minimum requirement " + new_pet_description_min_length_reached + ")";
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
            "<_num+ne1_> meters high", "<_num+ne1_> meters tall", "<_num+eq1_> meter high", "<_num+eq1_> meter tall",
            // --- Height foot
            "<_num+ne1_> feet high", "<_num+ne1_> feet tall", "<_num+eq1_> foot high", "<_num+eq1_> foot tall", 
            // --- Height inch
            "<_num+ne1_> inches high", "<_num+ne1_> inches tall", "<_num+eq1_> inch high", "<_num+eq1_> inch tall",
            // --- Height centimeter
            "<_num+ne1_> centimeters high", "<_num+ne1_> centimeters tall", "<_num+eq1_> centimeter high", "<_num+eq1_> centimeter tall",
            // Weight
            // --- Weight pound
            "weight <_num+ne1_> pounds", "weight <_num+eq1_> pound",
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
        if(app.vue.new_pet_description.length == 0){
            app.vue.description_rec_words = ["age", "height", "weight", "Dog", "Cat", "Bird", "Reptile", "Rabbit"];
            return 1;
        }
        const desElement = document.querySelector("#in_description");
        const desElementSelEnd = desElement.selectionEnd - 1;
        if(isNaN(desElementSelEnd) || isNaN(parseInt(desElementSelEnd))){
            return 1;
        }
        if(app.vue.new_pet_description[desElementSelEnd] == " "){
            return 1;
        }
        else{
            app.vue.description_rec_words = [];
            let curr_word = app.vue.new_pet_description[desElementSelEnd];
            let temp_des_ind = desElementSelEnd - 1;
            while(true){
                if(temp_des_ind < 0){
                    break;
                }
                if(app.vue.new_pet_description[temp_des_ind] == " "){
                    break;
                }
                curr_word = app.vue.new_pet_description[temp_des_ind] + curr_word;
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
                if(words_split_lower.includes(curr_word)){
                    const words_ind = words_split_lower.indexOf(curr_word);
                    for(let w = words_ind + 1; w < words_split.length; w++){
                        if(!app.vue.description_rec_words.includes(words_split[w]) && (words_split[w] != "<_num+eq1_>") && (words_split[w] != "<_num+ne1_>")){
                            app.vue.description_rec_words.push(words_split[w]);
                        }
                        else if(!app.vue.description_rec_words.includes(words_split[w])){
                            for(let i = 1; i < 11; i++){
                                if(!app.vue.description_rec_words.includes(i)){
                                    app.vue.description_rec_words.push(i);
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

    app.put_description_rec = function(new_word){
        new_word = new_word["word"];
        const desElement = document.querySelector("#in_description");
        const desElementSelEnd = desElement.selectionEnd;
        app.vue.new_pet_description = app.vue.new_pet_description.slice(0, desElementSelEnd) + (app.vue.new_pet_description[desElementSelEnd - 1] == " " ? "": " ") + new_word + app.vue.new_pet_description.slice(desElementSelEnd);
        desElement.focus();
    };

    // This contains all the methods.
    app.methods = {
        // Complete as you see fit.
        add_post: app.new_post,
        location_preview: app.location_preview,
        current_location: app.current_location,
        calc_description_length: app.calc_description_length,
        gen_description_rec: app.gen_description_rec,
        put_description_rec: app.put_description_rec
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