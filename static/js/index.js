// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        // Complete as you see fit.
        pets: [],
        comments: [],
    };

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };

    app.complete = (a) => {
        a.map((e) => {e.add_comment_content= "";});
        a.map((e) => {e.show_details = false;});
    };

    // This decorates the comments
    // adding information on their state
    // - clean: read-only, the value is saved on the server
    // - edit: the value is being edited
    // - pending: a save is pending
    app.decorate = (a) => {
        a.map((e) => {e._state = 'clean';});
        return a;
    };

    app.add_comment = function (pet_idx) {
        let row = app.vue.pets[pet_idx];
        axios.post(add_comment_url,
            {
                pet_id: row.pet.id,
                comment_content: row.add_comment_content,
            }).then(function (response) {
                app.vue.comments.push({
                    user_email: response.data.user_email,
                    pet_id: row.pet.id,
                    id: response.data.id,
                    post_text: row.add_comment_content,
                    post_date: response.data.post_date,
                    _state: 'clean',
                });
                app.enumerate(app.vue.comments);
                app.reset_form(pet_idx);
                });

    };

    app.delete_comment = function (comment_idx) {
        let id = app.vue.comments[comment_idx].id;
        axios.get(delete_comment_url, {params: {comment_id: id}})
            .then(function (response) {
                for (let i = 0; i < app.vue.comments.length; i++) {
                    if (app.vue.comments[i].id === id) {
                        app.vue.comments.splice(i, 1);
                        app.enumerate(app.vue.comments);
                        break;
                    }
                }
        });
    };

    app.show_details = function (pet_idx, details_status) {
        let pet = app.vue.pets[pet_idx];
        pet.show_details = details_status;
    };

    app.start_edit = function (comment_idx) {
        let comment = app.vue.comments[comment_idx];
        comment._state = 'edit';
    };

    app.stop_edit = function (comment_idx) {
        let comment = app.vue.comments[comment_idx];
        if (comment._state === 'edit') {
            comment._state = 'pending';
            axios.post(edit_comment_url,
                {
                    id: comment.id,
                    value: comment.post_text,
                })
                .then(function (result) {
                    comment._state = 'clean';
                });
        }
        // If I was not editing, there is nothing that needs saving

    };

    app.reset_form = function (pet_idx) {
        let pet = app.vue.pets[pet_idx];
        pet.add_comment_content = "";
    };

    // This contains all the methods.
    app.methods = {
        // Complete as you see fit.
        add_comment: app.add_comment,
        delete_comment: app.delete_comment,
        show_details: app.show_details,
        start_edit: app.start_edit,
        stop_edit: app.stop_edit,
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    // And this initializes it.
    app.init = () => {
        // Put here any initialization code.
        // Typically this is a server GET call to load the data.
        axios.get(load_posts_url)
            .then(function (response) {
                let pets = response.data.pets;
                app.enumerate(pets);
                app.complete(pets);
                app.vue.pets = pets;
            });
        axios.get(load_comments_url)
            .then(function (response) {
                let comments = response.data.comments;
                app.decorate(app.enumerate(comments));
                app.vue.comments= comments;
            });
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);