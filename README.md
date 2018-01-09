# P-values app

This is a web application for calculation of p-rationality values in simple 2 player games. It is a simple Django app, made with the [cookiecutter](https://github.com/pydanny/cookiecutter-django) framework and hosted on an AWS EC2 instance server.

## Python dependencies

First you need to install Python on the system. The best way to do this is by installing Miniconda, which will later be also used to manage environments. Make sure to select `yes` when asked if Miniconda path should be added to the `PATH` environmental variable

```
wget -c http://repo.continuum.io/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh
rm Miniconda3-latest-Linux-x86_64.sh
```

For some reason to install some packages gcc also needs to be installed, do it with [this](https://gist.github.com/application2000/73fd6f4bf1be6600a2cf9f56315a2d91#gistcomment-2119543) code.

After that, navigate to the project root directory. From there, create a new environment from the requirements file
```
conda env create -f requirements.txt
```
If the environment just needs to be updated, this can be done with
```
conda env update -f requirements.txt -n <env-name>
```

The environment on the server is called `pval` and can be actiavted and deactivated by executing
```
source activate pval
source deactivate pval
```

If new packages are installed in the environment, the requirements file can be updated with
```
conda env export > requirements.txt
```

## Using Gulp

First, you need to install Node.js and npm
```
sudo apt-get install nodejs
sudo apt-get install npm
```

Then install Gulp with
```
sudo npm install gulp-cli -g
npm install gulp -D
```

The gulpfile included with the cookiecutter template is complete enough so that we do not have to do anything else. All that remains is to run the default gulp task (described in development deployment section).

## Environmental variables and settings configuration
On the local development machine, you do not need to add any environmental variables, just make sure they are all in the `.env` file. On the server, add the following to `~/.bashrc`:
```
# Django stuff
export DJANGO_SETTINGS_MODULE="config.settings.production"
export DJANGO_SECRET_KEY="Fe]Y-?subj%AO}#K/stD$=$f|42S9T+FWhe2E.RQhYSo/mD1uG"
export DJANGO_ADMIN_URL="r'^admin/'"
export DJANGO_ALLOWED_HOSTS="['18.195.151.190', '.p-rationality.com']"
export DATABASE_URL="postgres://p_vales:pvalpass@localhost:5432/p_values"
```

## Accessing the server

To access the server (with SSH), first copy the private key `p_values.pem` to `~/.ssh/`. Then execute
```
chmod 400 ~/.ssh/p_values.pem
```
to set the required permission for the key.

After this, the server can be accessed by executing
```
ssh -i ~/.ssh/p_values.pem ubuntu@52.58.183.47
```

## Setting up a PostgreSQL database
To store the app data (in this case only user information), a local PostgreSQL database has to be set up. You can do this with.

First install the PostgreSQL on your system with
```
sudo apt-get install postgresql postgresql-contrib
```

Then, login as the postgres user:
```
sudo -u postgres psql
```

Now create a new user and a database
```
CREATE USER p_vales PASSWORD 'pvalpass' CREATEDB;
CREATE DATABASE p_values;
ALTER DATABASE p_values OWNER TO p_vales;
```

From then on you can access the database with
```
psql -h localhost -U p_vales -W -d p_values
```

## Running the app - development
When running the app in development mode, it's best to run it with Gulp:
```
gulp
```

Gulp then automatically runs some tasks (css compilation, js minification...), and also performs a `python manage.py runserver` command, and uses browsersync for live reload when any of the static files change (as it watches for changes).

## Running the app - deployment
The app is deployed using gunicorn, gnix and supervisor. We'll also use a SSL certificate.
