"""
This file defines the database models
"""

import datetime
from .common import db, Field, auth, T
from pydal.validators import *


def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None


def get_time():
    return datetime.datetime.utcnow()


### Define your table below

db.define_table('pet',
                Field('pet_name', 'string', requires=IS_NOT_EMPTY(), label=T('Pet Name')),
                Field('auth_user_id', 'reference auth_user'),  # Alternative
                Field('is_reunited', 'boolean', default=False),
                Field('description', 'text', requires=IS_NOT_EMPTY(), label=T('Description')),
                Field('photo', 'text'),  # This contains the image URL, see Unit 18
                Field('pet_latlng_square', 'string'),  # This is the ~1KM square.
                Field('pet_lat', 'double'),
                Field('pet_lng', 'double'),
                Field('user_email', readable=False, writable=False, default=get_user_email),
                Field('creation_date', 'datetime', readable=False, writable=False, default=get_time)
                )

# db.define_table('comment',
#                 Field('auth_user_id', 'reference auth_user'),  # Alternative
#                 Field('pet_id', 'reference pet'),
#                 Field('post_date', 'datetime', default=get_time)
#                 )
#
# db.define_table('user',
#                 Field('auth_user_id', 'reference auth_user'),
#                 Field('photo', 'text'),  # This contains the image URL, see Unit 18
#                 Field('user_phone_num', 'integer', requires=IS_NOT_EMPTY()),
#                 Field('user_radius', 'integer', default=1),
#                 Field('user_latlng_square', 'string'),  # This is the ~1KM square.
#                 Field('user_lat', 'double'),
#                 Field('user_lng', 'double'),
#                 )


## always commit your models to avoid problems later

db.commit()
