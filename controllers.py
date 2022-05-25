"""
This file defines actions, i.e. functions the URLs are mapped into
The @action(path) decorator exposed the function at URL:

    http://127.0.0.1:8000/{app_name}/{path}

If app_name == '_default' then simply

    http://127.0.0.1:8000/{path}

If path == 'index' it can be omitted:

    http://127.0.0.1:8000/

The path follows the bottlepy syntax.

@action.uses('generic.html')  indicates that the action uses the generic.html template
@action.uses(session)         indicates that the action uses the session
@action.uses(db)              indicates that the action uses the db
@action.uses(T)               indicates that the action uses the i18n & pluralization
@action.uses(auth.user)       indicates that the action requires a logged in user
@action.uses(auth)            indicates that the action requires the auth object

session, db, T, auth, and tempates are examples of Fixtures.
Warning: Fixtures MUST be declared with @action.uses({fixtures}) else your app will result in undefined behavior
"""

import datetime
from py4web import action, request, abort, redirect, URL, Field
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from py4web.utils.url_signer import URLSigner
from .models import get_user_email, get_time
from py4web.utils.form import Form, FormStyleBulma

url_signer = URLSigner(session)


@action('index')
@action.uses('index.html', db, auth, url_signer)
def index():
    pets = db(db.pet).select()
    comments = db(db.comment).select()
    return dict(
        comments=comments,
        pets=pets, url_signer=url_signer
    )


@action('main-page')
@action.uses('../components/main.html', db, auth, url_signer)
def serve_main():
    pets = db(db.pet.user_email == db.auth_user.email).select()
    comments = db(db.comment).select()
    return dict(
        load_posts_url=URL('load_posts', signer=url_signer),
        load_comments_url=URL('load_comments', signer=url_signer),
        add_comment_url=URL('add_comment', signer=url_signer),
        delete_comment_url=URL('delete_comment', signer=url_signer),
        edit_comment_url=URL('edit_comment', signer=url_signer),
        current_user_email=get_user_email(),
        pets=pets,
        comments=comments,
        url_signer=url_signer
    )


# Main API Functions
@action('load_posts')
@action.uses(url_signer.verify(), db)
def load_posts():
    pets = db(db.pet.user_email == db.auth_user.email).select(orderby=~db.pet.creation_date).as_list()
    return dict(pets=pets)


@action('load_comments')
@action.uses(url_signer.verify(), db)
def load_comments():
    comments = db(db.comment).select()
    return dict(comments=comments)


@action('add_comment', method="POST")
@action.uses(url_signer.verify(), db)
def add_comment():
    if get_user_email() is None:
        redirect(URL('auth', 'login'))
    author_email = get_user_email()
    post_date = get_time()
    author_first_name = db(db.auth_user.email == get_user_email()).select().first().first_name
    author_last_name = db(db.auth_user.email == get_user_email()).select().first().last_name
    id = db.comment.insert(
        user_email=author_email,
        pet_id=request.json.get('pet_id'),
        post_text=request.json.get('comment_content'),
    )
    return dict(
        id=id,
        user_email=author_email,
        author_first_name=author_first_name,
        author_last_name=author_last_name,
        post_date=post_date,
    )


@action('delete_comment')
@action.uses(url_signer.verify(), db)
def delete_comment():
    id = request.params.get('comment_id')
    assert id is not None
    db(db.comment.id == id).delete()
    return "ok"


@action('edit_comment', method="POST")
@action.uses(url_signer.verify(), db)
def edit_comment():
    id = request.json.get('id')
    value = request.json.get('value')
    db(db.comment.id == id).update(**{'post_text': value})
    return "ok"


@action('about')
@action.uses('../components/about.html')
def serve_about():
    return dict()


@action('howto')
@action.uses('../components/howto.html')
def serve_howto():
    return dict()

# Map page load controller, done by Chen W.
@action("map")
@action.uses("../components/map.html", url_signer)
def serve_map():
    return dict(
        load_pins_url=URL('load_pins', signer=url_signer),
        url_signer=url_signer
    )

# Map load pins controller, done by Chen W.
@action("load_pins")
@action.uses(db)
def map_load_pins():
    return dict()

@action('settings')
@action.uses(db, session, auth.user, '../components/settings.html')
def serve_settings():
    form = Form(db.user, csrf_session=session, formstyle=FormStyleBulma)
    if form.accepted:
        redirect(URL('../components/settings.html'))

    return dict(form=form)


# PETS

# Add a pet page load controller, done by Chen W.
@action("add")
@action.uses(db, session, auth.user, "../components/add.html", url_signer)
def serve_add():
    return dict(
        add_post_url=URL("add_post", signer=url_signer),
        url_signer=url_signer
    )

# Add a pet post controller, done by Chen W.
@action("add_post", method=["GET", "POST"])
@action.uses(db, session, auth.user, url_signer.verify())
def add_post():
    db.pet.insert(
        pet_name = request.json.get("new_pet_name"),
        pet_type = request.json.get("new_pet_type"),
        pet_lost = request.json.get("new_pet_lost"),
        pet_lostfound_date = datetime.datetime(request.json.get("new_pet_lostfound_date_y"), request.json.get("new_pet_lostfound_date_m"), request.json.get("new_pet_lostfound_date_d")),
        description = request.json.get("new_pet_description"),
        pet_lat = request.json.get("new_pet_lat"),
        pet_lng = request.json.get("new_pet_lng")
    )
    return dict()

"""
# Add a pet post success page load controller, done by Chen W.
@action("add_success")
@action.uses("../components/add_success.html", url_signer)
def add_success_serve():
    print("naqui @ 187 @ add_success")
    return dict(url_signer = url_signer)
"""

# This endpoint will be used for URLS of the form /edit/k where k is the product id.
@action('edit/<pet_id:int>', method=["GET", "POST"])
@action.uses(db, session, auth.user, url_signer.verify(), '../components/edit.html')
def edit(pet_id=None):
    assert pet_id is not None
    # We read the product being edited from the db.
    p = db.pet[pet_id]
    if p.user_email != get_user_email():
        redirect(URL('index'))
    if p is None:
        # Nothing found to be edited
        redirect(URL('index'))
    # Edit form: record initialized
    form = Form(db.pet, record=p, deletable=False, csrf_session=session, formstyle=FormStyleBulma)
    if form.accepted:
        # The update already happened
        redirect(URL('index'))
    return dict(form=form)


@action('delete/<pet_id:int>')
@action.uses(db, session, auth.user, url_signer.verify())
def delete(pet_id=None):
    assert pet_id is not None
    p = db.pet[pet_id]
    if p.user_email != get_user_email():
        redirect(URL('index'))
    db(db.pet.id == pet_id).delete()
    redirect(URL('index'))


# COMMENTS


@action('add_comment/<pet_id:int>', method=["GET", "POST"])
@action.uses(db, session, auth.user, '../components/add_comment.html')
def add_comment(pet_id=None):
    assert pet_id is not None
    form = Form([Field('post_text', 'text')], csrf_session=session,
                formstyle=FormStyleBulma)
    if form.accepted:
        pet = db(db.pet.id == pet_id).select().first()
        db.comment.insert(
            user_email=get_user_email(),
            pet_id=pet_id,
            post_date=get_time(),
            post_text=form.vars["post_text"],
        )
        redirect(URL('main-page'))
    # # Insert form: no record init
    # form = Form(db.comment, csrf_session=session, formstyle=FormStyleBulma)
    # if form.accepted:
    #     # We simply redirect; the insertion already happened
    #     redirect(URL('index'))
    # # Either this is a GET request, or this is a POST but not accepted with errors.
    return dict(form=form)


@action('edit_comment/<comment_id:int>', method=["GET", "POST"])
@action.uses(db, session, auth.user, url_signer.verify(), '../components/edit_comment.html')
def edit_comment(comment_id=None):
    assert comment_id is not None
    # We read the product being edited from the db.
    p = db.comment[comment_id]
    if p.user_email != get_user_email():
        redirect(URL('index'))
    if p is None:
        # Nothing found to be edited
        redirect(URL('index'))
    # Edit form: record initialized
    form = Form(db.comment, record=p, deletable=False, csrf_session=session, formstyle=FormStyleBulma)
    if form.accepted:
        # The update already happened
        redirect(URL('main-page'))
    return dict(form=form)


@action('delete_comment/<comment_id:int>')
@action.uses(db, session, auth.user, url_signer.verify())
def delete(comment_id=None):
    assert comment_id is not None
    p = db.comment[comment_id]
    if p.user_email != get_user_email():
        redirect(URL('index'))
    db(db.comment.id == comment_id).delete()
    redirect(URL('main-page'))