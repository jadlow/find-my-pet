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
import json
import os
import traceback
import uuid

from nqgcs import NQGCS

from py4web import action, request, abort, redirect, URL, Field
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from py4web.utils.url_signer import URLSigner
from .models import get_user_email, get_time
from .settings import APP_FOLDER
from .gcs_url import gcs_url
from py4web.utils.form import Form, FormStyleBulma

url_signer = URLSigner(session)

BUCKET = '/fmp-uploads'
# GCS keys.  You have to create them for this to work.  See README.md
GCS_KEY_PATH = os.path.join(APP_FOLDER, 'private/gcs_keys.json')
with open(GCS_KEY_PATH) as gcs_key_f:
    GCS_KEYS = json.load(gcs_key_f)

# I create a handle to gcs, to perform the various operations.
gcs = NQGCS(json_key_path=GCS_KEY_PATH)


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
    # makes sure user is logged in before accessing website
    if get_user_email() is None:
        redirect(URL('auth', 'login'))
    auth_users = db(db.auth_user.email == get_user_email).select()
    users = db(db.user).select()
    user_created = False
    for auth_user in auth_users:
        for user in users:
            if user.auth_user_id == auth_user.id:
                user_created = True
    if user_created is False:
        redirect(URL('settings'))
    return dict(
        load_posts_url=URL('load_posts', signer=url_signer),
        load_comments_url=URL('load_comments', signer=url_signer),
        load_users_url=URL('load_users', signer=url_signer),
        add_comment_url=URL('add_comment', signer=url_signer),
        delete_comment_url=URL('delete_comment', signer=url_signer),
        edit_comment_url=URL('edit_comment', signer=url_signer),
        current_user_email=get_user_email(),
        url_signer=url_signer
    )


# Main API Functions
@action('load_posts')
@action.uses(url_signer.verify(), db)
def load_posts():
    rows = db(db.pet.user_email == db.auth_user.email).select(orderby=~db.pet.creation_date)
    users = db(db.user).select()
    for row in rows:
        u_row = db(db.upload.id == row.pet.photo).select().as_list()
        file_path = u_row[0]['file_path']
        row['edit_url'] = URL('edit', row.pet['id'], signer=url_signer)
        row['delete_url'] = URL('delete', row.pet['id'], signer=url_signer)
        row['map_url'] = "https://google.com/maps/place/" + str(row.pet.pet_lat) + "," + str(row.pet.pet_lng) + "/"
        row['map_display_url'] = "https://google.com/maps?q=" + str(row.pet.pet_lat) + "," + str(row.pet.pet_lng) + "&z=12&output=embed"
        row.pet["signed_url"] = None if file_path is None else gcs_url(GCS_KEYS, file_path, verb='GET')
        for user in users:
            if user.auth_user_id.email == row.pet.user_email:
                row['contact_name'] = user.username
    li = rows.as_list()
    return dict(pets=li)


@action('load_comments')
@action.uses(url_signer.verify(), db)
def load_comments():
    comments = db(db.comment).select()
    return dict(comments=comments)


@action('load_users')
@action.uses(url_signer.verify(), db)
def load_users():
    users = db(db.auth_user).select()
    return dict(users=users)


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
    print(request.params.get('status'))
    print(request.params.get('radius'))
    print(request.params.get('new_lat'))
    print(request.params.get('new_lon'))

    petlost = request.params.get('status') == "lost" 
    pets = db((db.pet.pet_lost == petlost) & (db.pet.is_reunited == False)).select().as_list()

    cur_lat = float(request.params.get('new_lat'))
    cur_lon = float(request.params.get('new_lon'))
    rad_mi = float(request.params.get('radius'))

    nor_lat = 0
    if(cur_lat + rad_mi/69 > 90):
        excess_lat = cur_lat + rad_mi/69 - 90
        nor_lat = 90 - excess_lat
    else:
        nor_lat = cur_lat + rad_mi/69

    sou_lat = 0
    if(cur_lat - rad_mi/69 < -90):
        excess_lat = abs(cur_lat - rad_mi/69 + 90)
        sou_lat = -90 +  excess_lat
    else:
        sou_lat = cur_lat - rad_mi/69

    print(nor_lat)
    print(sou_lat)

    east_lon = 0
    if(cur_lon + rad_mi/54.6 > 180):
        excess_lon = cur_lon + rad_mi/54.6 - 180
        east_lon = 180 - excess_lon
    else:
        east_lon = cur_lon + rad_mi/54.6

    west_lon = 0
    if(cur_lon - rad_mi/54.6 < -180):
        excess_lon = abs(cur_lon - rad_mi/54.6 + 180)
        west_lon = -180 +  excess_lat
    else:
        west_lon = cur_lon - rad_mi/54.6

    print(east_lon)
    print(west_lon)
    #36.9557504  -122.0476928

    petCoords = []     
    for p in pets:
        if( (p['pet_lat'] <= nor_lat) and (p['pet_lat'] >= sou_lat) and (p['pet_lng'] <= east_lon) and (p['pet_lng'] >= west_lon)):
            petCoords.append(str(p['pet_lat']) + ", " + str(p['pet_lng']))

    print(petCoords)
    return dict(
        petArr = petCoords,
    )


@action('settings')
@action.uses('../components/settings.html', db, session, auth.user, url_signer)
def settings():
    return dict(
        settings_url=URL("user_settings", signer=url_signer),
        load_user_settings_url=URL("load_user_settings", signer=url_signer),
        url_signer=url_signer,
    )


@action('load_user_settings', method=["GET"])
@action.uses(db, session, auth.user, url_signer)
def load_user_settings():
    rows = db(db.user.auth_user_id == db.auth_user.id).select()
    user = None
    for row in rows:
        if row.auth_user.email == get_user_email():
            user = row.user
    if user is not None:
        return dict(
            username=user.username,
            phone_num=user.phone_num,
            radius=user.radius,
            latitude=user.latitude,
            longitude=user.longitude
        )
    else:
        return dict(
            username="",
            phone_num="",
            radius="",
            latitude="",
            longitude=""
        )


@action('user_settings', method=["GET", "POST"])
@action.uses(db, session, auth.user, url_signer)
def user_settings():
    auth_user_id = db(db.auth_user.email == get_user_email()).select().first()
    db.user.update_or_insert(
        db.user.auth_user_id == auth_user_id,
        auth_user_id = auth_user_id,
        username = request.json.get("first_name"),
        phone_num = request.json.get("phone_num"),
        radius = request.json.get("radius"),
        latitude = request.json.get("latitude"),
        longitude = request.json.get("longitude")
    )
    return dict(
        current_user_email=get_user_email(),
        url_signer=url_signer
    )


# PETS

# Add a pet page load controller, done by Chen W.
@action("add")
@action.uses("../components/add.html", db, session, auth.user, url_signer)
def serve_add():
    return dict(
        add_post_url=URL("add_post", signer=url_signer),
        url_signer=url_signer,
        # GCS
        file_info_url=URL('file_info', signer=url_signer),
        obtain_gcs_url=URL('obtain_gcs', signer=url_signer),
        notify_url=URL('notify_upload', signer=url_signer),
        delete_url=URL('notify_delete', signer=url_signer),
    )


# Add a pet post controller, done by Chen W.
@action("add_post", method="POST")
@action.uses(db, session, auth.user, url_signer.verify())
def add_post():
    db.pet.insert(
        pet_name = request.json.get("new_pet_name"),
        pet_type = request.json.get("new_pet_type"),
        pet_lost = request.json.get("new_pet_lost"),
        pet_lostfound_date = datetime.datetime(request.json.get("new_pet_lostfound_date_y"), request.json.get("new_pet_lostfound_date_m"), request.json.get("new_pet_lostfound_date_d")),
        description = request.json.get("new_pet_description"),
        pet_lat = request.json.get("new_pet_lat"),
        pet_lng = request.json.get("new_pet_lng"),
        photo = request.json.get("photo"),
    )
    return dict()


@action('file_info')
@action.uses(url_signer.verify(), db)
def file_info():
    print("file_info")
    """Returns to the web app the information about the file currently
    uploaded, if any, so that the user can download it or replace it with
    another file if desired."""
    row = db(db.upload.owner == get_user_email()).select().first()
    # The file is present if the row is not None, and if the upload was
    # confirmed.  Otherwise, the file has not been confirmed as uploaded,
    # and should be deleted.
    if row is not None and not row.confirmed:
        # We need to try to delete the old file content.
        delete_path(row.file_path)
        row.delete_record()
        row = {}
    if row is None:
        # There is no file.
        row = {}
    file_path = row.get('file_path')
    return dict(
        file_name=row.get('file_name'),
        file_type=row.get('file_type'),
        file_date=row.get('file_date'),
        file_size=row.get('file_size'),
        file_path=file_path,
        download_url=None if file_path is None else gcs_url(GCS_KEYS, file_path),
        # These two could be controlled to get other things done.
        upload_enabled=True,
        download_enabled=True,
    )


@action('get_file_info/<photo_id:int>')
@action.uses(url_signer.verify(), db)
def get_file_info(photo_id = None):
    """Returns to the web app the information about the file currently
    uploaded, if any, so that the user can download it or replace it with
    another file if desired."""
    row = db(db.upload.id == photo_id).select().first()
    # The file is present if the row is not None, and if the upload was
    # confirmed.  Otherwise, the file has not been confirmed as uploaded,
    # and should be deleted.
    if row is None:
        # There is no file.
        row = {}
    file_path = row.get('file_path')
    return dict(
        file_name=row.get('file_name'),
        file_type=row.get('file_type'),
        file_date=row.get('file_date'),
        file_size=row.get('file_size'),
        file_path=file_path,
        download_url=None if file_path is None else gcs_url(GCS_KEYS, file_path),
        # These two could be controlled to get other things done.
        upload_enabled=True,
        download_enabled=True,
    )


@action('obtain_gcs', method="POST")
@action.uses(url_signer.verify(), db)
def obtain_gcs():
    """Returns the URL to do download / upload / delete for GCS."""
    print("obtain_gcs")
    verb = request.json.get("action")
    if verb == "PUT":
        mimetype = request.json.get("mimetype", "")
        file_name = request.json.get("file_name")
        extension = os.path.splitext(file_name)[1]
        # Use + and not join for Windows, thanks Blayke Larue
        file_path = BUCKET + "/" + str(uuid.uuid1()) + extension
        # Marks that the path may be used to upload a file.
        mark_possible_upload(file_path)
        upload_url = gcs_url(GCS_KEYS, file_path, verb='PUT',
                             content_type=mimetype)
        return dict(
            signed_url=upload_url,
            file_path=file_path
        )
    elif verb in ["GET", "DELETE"]:
        file_path = request.json.get("file_path")
        if file_path is not None:
            # We check that the file_path belongs to the user.
            r = db(db.upload.file_path == file_path).select().first()
            if r is not None and r.owner == get_user_email():
                # Yes, we can let the deletion happen.
                signed_url = gcs_url(GCS_KEYS, file_path, verb=verb)
                return dict(signed_url=signed_url)
        # Otherwise, we return no URL, so we don't authorize the deletion.
        return dict(signer_url=None)


@action('notify_upload', method="POST")
@action.uses(url_signer.verify(), db)
def notify_upload():
    print("notify_upload")
    """We get the notification that the file has been uploaded."""
    file_type = request.json.get("file_type")
    file_name = request.json.get("file_name")
    file_path = request.json.get("file_path")
    file_size = request.json.get("file_size")
    # Deletes any previous file.
    rows = db(db.upload.owner == get_user_email()).select()
    for r in rows:
        if r.file_path != file_path:
            delete_path(r.file_path)
    # Marks the upload as confirmed.
    d = datetime.datetime.utcnow()
    db.upload.update_or_insert(
        ((db.upload.owner == get_user_email()) &
         (db.upload.file_path == file_path)),
        owner=get_user_email(),
        file_path=file_path,
        file_name=file_name,
        file_type=file_type,
        file_date=d,
        file_size=file_size,
        confirmed=True,
    )
    # save the id of the uploaded image for pet reference
    upload = db(db.upload.file_path == file_path).select().first()
    upload_id = upload.id
    signed_url = gcs_url(GCS_KEYS, file_path, verb='GET')
    # Returns the file information.
    return dict(
        preview_url=signed_url,
        upload_id=upload_id,
        download_url=gcs_url(GCS_KEYS, file_path, verb='GET'),
        file_date=d,
    )

@action('notify_delete', method="POST")
@action.uses(url_signer.verify(), db)
def notify_delete():
    file_path = request.json.get("file_path")
    # We check that the owner matches to prevent DDOS.
    print("notify_delete")
    db((db.upload.owner == get_user_email()) &
       (db.upload.file_path == file_path)).delete()
    return dict()

def delete_path(file_path):
    print("delete_path")
    """Deletes a file given the path, without giving error if the file
    is missing."""
    try:
        bucket, id = os.path.split(file_path)
        gcs.delete(bucket[1:], id)
    except:
        # Ignores errors due to missing file.
        pass

def delete_previous_uploads():
    print("delete_previous_uploads")
    """Deletes all previous uploads for a user, to be ready to upload a new file."""
    previous = db(db.upload.owner == get_user_email()).select()
    for p in previous:
        # There should be only one, but let's delete them all.
        delete_path(p.file_path)
    db(db.upload.owner == get_user_email()).delete()

def mark_possible_upload(file_path):
    print("mark_possible_upload")
    """Marks that a file might be uploaded next."""
    # delete_previous_uploads()
    db.upload.insert(
        owner=get_user_email(),
        file_path=file_path,
        confirmed=False,
    )

# This endpoint will be used for URLS of the form /edit/k where k is the product id.
@action('edit/<pet_id:int>', method=["GET", "POST"])
@action.uses('../components/edit.html', db, session, auth.user, url_signer.verify())
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
    return dict(
        edit_post_url=URL("edit_post", str(pet_id), signer=url_signer),
        get_pet_info_url=URL("get_pet_info", str(pet_id), signer=url_signer),
        get_file_info_url=URL("get_file_info", str(p.photo), signer=url_signer),
        url_signer=url_signer,
        # GCS
        file_info_url=URL('file_info', signer=url_signer),
        obtain_gcs_url=URL('obtain_gcs', signer=url_signer),
        notify_url=URL('notify_upload', signer=url_signer),
        delete_url=URL('notify_delete', signer=url_signer)
    )

@action("get_pet_info/<pet_id:int>")
@action.uses(db, session, auth.user, url_signer.verify())
def get_pet_info(pet_id = None):
    p = db.pet[pet_id]
    if p is None:
        redirect(URL("main-page"))
    if p.user_email != get_user_email():
        redirect(URL("main-page"))
    return dict(
        cur_pet_name = p.pet_name,
        cur_pet_type = p.pet_type,
        cur_pet_lost = p.pet_lost,
        cur_pet_lostfound_date = p.pet_lostfound_date,
        cur_pet_description = p.description,
        cur_pet_lat = p.pet_lat,
        cur_pet_lng = p.pet_lng,
        cur_pet_photo = p.photo,
    )

@action("edit_post/<pet_id:int>", method="POST")
@action.uses(db, session, auth.user, url_signer.verify())
def edit_post(pet_id=None):
    p = db.pet[pet_id]
    if p is None:
        redirect(URL("main-page"))
    if p.user_email != get_user_email():
        redirect(URL("main-page"))
    db(db.pet.id == pet_id).update(
        pet_name = request.json.get("cur_pet_name"),
        pet_type = request.json.get("cur_pet_type"),
        pet_lost = request.json.get("cur_pet_lost"),
        pet_lostfound_date = datetime.datetime(request.json.get("cur_pet_lostfound_date_y"), request.json.get("cur_pet_lostfound_date_m"), request.json.get("cur_pet_lostfound_date_d")),
        description = request.json.get("cur_pet_description"),
        pet_lat = request.json.get("cur_pet_lat"),
        pet_lng = request.json.get("cur_pet_lng"),
        photo = request.json.get("photo")
    )


@action('delete/<pet_id:int>')
@action.uses(db, session, auth.user, url_signer.verify())
def delete(pet_id=None):
    assert pet_id is not None
    p = db.pet[pet_id]
    if p.user_email != get_user_email():
        redirect(URL('main-page'))
    u_row = db(db.upload.id == p.photo).select().as_list()
    file_path = u_row[0]['file_path']
    print(file_path)
    if file_path is not None:
        # We check that the file_path belongs to the user.
        r = db(db.upload.file_path == file_path).select().first()
        if r is not None and r.owner == get_user_email():
            # Yes, we can let the deletion happen.
            signed_url = gcs_url(GCS_KEYS, file_path, verb='DELETE')
    db(db.upload.id == p.photo).delete()
    db(db.pet.id == pet_id).delete()
    redirect(URL('main-page'))
