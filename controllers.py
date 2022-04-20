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

from py4web import action, request, abort, redirect, URL
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from py4web.utils.url_signer import URLSigner
from .models import get_user_email
from py4web.utils.form import Form, FormStyleBulma

url_signer = URLSigner(session)


@action('index')
@action.uses(db, auth, url_signer, 'index.html')
def index():
    rows = db(db.pet).select()
    return dict(rows=rows, url_signer=url_signer)


@action('main-page')
@action.uses('../components/main.html')
def serve_main():
    return dict()


@action('about')
@action.uses('../components/about.html')
def serve_about():
    return dict()


@action('howto')
@action.uses('../components/howto.html')
def serve_howto():
    return dict()


@action('map')
@action.uses('../components/map.html')
def serve_map():
    return dict()


@action('settings')
@action.uses('../components/settings.html')
def serve_settings():
    return dict()


@action('add', method=["GET", "POST"])
@action.uses(db, session, auth.user, '../components/add.html')
def add():
    # Insert form: no record init
    form = Form(db.pet, csrf_session=session, formstyle=FormStyleBulma)
    if form.accepted:
        # We simply redirect; the insertion already happened
        redirect(URL('index'))
    # Either this is a GET request, or this is a POST but not accepted with errors.
    return dict(form=form)
    # if request.method == "GET":
    #     return dict()
    # else:
    #     # This is a form submission.
    #     print("User: ", get_user_email(), " Product: ", request.params.get("product_name"))
    #     # Insert product
    #     db.product.insert(product_name=request.params.get("product_name"))
    #     redirect(URL('add'))
    #     # We always redirect after successful form processing.


# This endpoint will be used for URLS of the form /edit/k where k is the product id.
@action('edit/<pet_id:int>', method=["GET", "POST"])
@action.uses(db, session, auth.user, '../components/edit.html')
def edit(pet_id=None):
    assert pet_id is not None
    # We read the product being edited from the db.
    p = db.pet[pet_id]
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
    db(db.pet.id == pet_id).delete()
    redirect(URL('index'))

