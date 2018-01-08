export DJANGO_SETTINGS_MODULE="config.settings.production"
export DJANGO_SECRET_KEY="Fe]Y-?subj%AO}#K/stD$=$f|42S9T+FWhe2E.RQhYSo/mD1uG"
export DJANGO_ADMIN_URL="r'^admin/'"
export DJANGO_ALLOWED_HOSTS="['18.195.151.190', '.p-rationality.com']"
export DATABASE_URL="postgres://p_vales:pvalpass@localhost:5432/p_values"
export PATH="/home/ubuntu/miniconda3/bin:$PATH"

NAME="p_vales"                                         # Name of the application
DJANGODIR="/home/ubuntu/p_values"                      # Django Project Directory
USER=ubuntu                                            # the user to run as
GROUP=ubuntu                                           # the group to run as
NUM_WORKERS=3                                                   # No. of worker processes Gunicorn should spawn
DJANGO_SETTINGS_MODULE=config.settings.production               # Settings file that Gunicorn should use
DJANGO_WSGI_MODULE=config.wsgi                                  # WSGI module name

source activate pval

gunicorn ${DJANGO_WSGI_MODULE}:application \
        --name $NAME \
        --workers $NUM_WORKERS \
        --user=$USER --group=$GROUP \
        --log-level=debug \
        --bind=unix:/home/ubuntu/p_values/app.sock
