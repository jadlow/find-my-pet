"""
This file defines the database models
"""

import datetime
from .common import db, Field, auth
from pydal.validators import *


def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None


def get_time():
    return datetime.datetime.utcnow()


### Define your table below

db.define_table('pet',
                Field('pet_name', 'string', requires=IS_NOT_EMPTY()),
                Field('user_email', 'string', default=get_user_email),  # Alternative
                Field('is_reunited', 'boolean'),
                Field('description', 'text'),
                Field('photo', 'text'),  # This contains the image URL, see Unit 18
                Field('pet_latlng_square', 'string'),  # This is the ~1KM square.
                Field('pet_lat', 'double'),
                Field('pet_lng', 'double'),
                )

db.define_table('comment',
                Field('user_email', 'string', default=get_user_email),  # Alternative
                Field('pet_id', 'reference pet'),
                Field('post_date', 'datetime')
                )

db.define_table('user',
                Field('auth_user_id', 'reference auth_user'),
                Field('photo', 'text'),  # This contains the image URL, see Unit 18
                Field('user_phone_num', 'integer'),
                Field('user_radius', 'integer'),
                Field('user_latlng_square', 'string'),  # This is the ~1KM square.
                Field('user_lat', 'double'),
                Field('user_lng', 'double'),
                )

## always commit your models to avoid problems later

db.commit()
