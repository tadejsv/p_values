#!/bin/bash

### Define script variables
### =====================================================================================================================

NAME="p_values"                                         # Name of the application
DJANGODIR="/home/ubuntu/p_values"                               # Django Project Directory
USER=ubuntu                                            # the user to run as
GROUP=ubuntu                                           # the group to run as
NUM_WORKERS=3                                                   # No. of worker processes Gunicorn should spawn
DJANGO_SETTINGS_MODULE=config.settings.production               # Settings file that Gunicorn should use
DJANGO_WSGI_MODULE=config.wsgi                                  # WSGI module name

### Activate virtualenv and create environment variables
### =====================================================================================================================

echo "Starting $NAME as `whoami`"
# Activatecd  the virtual environment and load environment variables
source ~/.bashrc
source activate app

cd $DJANGODIR
# Django Environment Variables

### Start Gunicorn
### =====================================================================================================================

exec gunicorn ${DJANGO_WSGI_MODULE}:application \
        --name $NAME \
        --workers $NUM_WORKERS \
        --user=$USER --group=$GROUP \
        --log-level=debug \
        --bind=127.0.0.1:8000
