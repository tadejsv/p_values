NAME="p_values"                                         # Name of the application
DJANGODIR="/home/ubuntu/p_values"                      # Django Project Directory
USER=ubuntu                                            # the user to run as
GROUP=ubuntu                                           # the group to run as
NUM_WORKERS=3                                                   # No. of worker processes Gunicorn should spawn
DJANGO_SETTINGS_MODULE=config.settings.production               # Settings file that Gunicorn should use
DJANGO_WSGI_MODULE=config.wsgi

export PATH="/home/ubuntu/miniconda3/bin:$PATH"

source activate pvals

gunicorn ${DJANGO_WSGI_MODULE}:application \
        --name $NAME \
        --workers $NUM_WORKERS \
        --user=$USER --group=$GROUP \
        --log-level=debug \
        --bind=unix:/home/ubuntu/p_values/app.sock
