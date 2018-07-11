# P-values app

This is a web application for calculation of p-rationality values in simple 2 player games. It is a simple Django app, made with the [cookiecutter](https://github.com/pydanny/cookiecutter-django) framework and hosted on an AWS EC2 instance server. Frontend is mainly in Vue, and the bundling is done by webpack.

## Python dependencies

First you need to install Python on the system. The best way to do this is by installing Miniconda, which will later be also used to manage environments. Make sure to select `yes` when asked if Miniconda path should be added to the `PATH` environmental variable

```
wget -c http://repo.continuum.io/miniconda/Miniconda3-latest-Linux-x86_64.sh
sudo apt-get install bzip2
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

The environment on the server is called `pvals` and can be activated and deactivated by executing
```
source activate pvals
source deactivate pvals
```

If new packages are installed in the environment, the requirements file can be updated with
```
conda env export > requirements.txt
```

## Installing Webpack and dependencies

First, you need to install Node.js and npm
```
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Then install all the dependencies with
```
npm install
```

The gulpfile included with the cookiecutter template is complete enough so that we do not have to do anything else. All that remains is to run the default gulp task (described in development deployment section).

## Environmental variables and settings configuration
On the local development machine, you do not need to add any environmental variables, just make sure they are all in the `.env` file.

On the server, the environmental variables will be activated together with the conda environment. To do that, we first have to create activate/deactivate scripts.

```
cd ~/miniconda3/envs/pvals
mkdir -p ./etc/conda/activate.d
mkdir -p ./etc/conda/deactivate.d
touch ./etc/conda/activate.d/env_vars.sh
touch ./etc/conda/deactivate.d/env_vars.sh
```

Now, first in the `./etc/conda/deactivate.d/env_vars.sh` put
```
#!/bin/sh

unset DJANGO_DEBUG
unset DJANGO_SETTINGS_MODULE
unset DJANGO_SECRET_KEY
unset DJANGO_ALLOWED_HOSTS
unset DATABASE_URL
```

Then put the following in `./etc/conda/activate.d/env_vars.sh`:
```
#!/bin/sh

export DJANGO_SETTINGS_MODULE="config.settings.production"
export DJANGO_SECRET_KEY="SECRET_KEY_HERE"
export DJANGO_ADMIN_URL="r'^admin/'"
export DJANGO_ALLOWED_HOSTS="52.58.183.47",".p-rationality.com"
export DATABASE_URL="postgres://p_values:pvals@localhost:5432/p_values"
```

## Accessing the server

To access the server (with SSH), first copy the private key `p_value.pem` to `~/.ssh/`. Then execute
```
chmod 400 ~/.ssh/p_value.pem
```
to set the required permission for the key.

After this, the server can be accessed by executing
```
ssh -i ~/.ssh/p-value.pem ubuntu@ec2-52-57-190-228.eu-central-1.compute.amazonaws.com
```

## Setting up a PostgreSQL database
To store the app data (in this case only user information), a local PostgreSQL database has to be set up. You can do this with.

First get the PostgreSQL repository using
```
sudo add-apt-repository 'deb http://apt.postgresql.org/pub/repos/apt/ xenial-pgdg main'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | \
  sudo apt-key add -
sudo apt-get update
```
After that, you can install it using
```
sudo apt-get install postgresql-10
```

Then, login as the postgres user:
```
sudo -u postgres psql
```

Now create a new user and a database
```
CREATE USER p_values PASSWORD 'pvals' CREATEDB;
CREATE DATABASE p_values;
ALTER DATABASE p_values OWNER TO p_values;
```

From then on you can access the database with
```
psql -h localhost -U p_values -W -d p_values
```

## Running the app - development
When running the app in development mode, it's best to run it with webpack:
```
npm run devrun
```
This runs the webpack in watch mode (so it recompiles files on change), as well as launching browser-sync (to reload files on change) and python server.

## Running the app - deployment
The app is deployed using gunicorn and ngnix. We'll also use a SSL certificate.

First, we install ngnix (as done in [this tutorial](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-16-04)):
```
sudo apt-get update
sudo apt-get install nginx
```

### Installing SSL certificate
Now we get the SSL certificate for our website (as done in [this tutorial](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-16-04)). First, we install Certbot

```
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install python-certbot-nginx
```

Then, we edit the default nginx configuration file and change `server_name` to `p-rationality.com www.p-rationality.com;`:
```
sudo nano /etc/nginx/sites-available/default
```

After that, check that everything is ok and reload nginx with
```
sudo nginx -t
sudo systemctl reload nginx
```

And finally, install the certificate with (be sure to add HTTP and HTTPS inbound rules for the server before!)
```
sudo certbot --nginx -d p-rationality.com -d www.p-rationality.com
```

Now go to https://www.p-rationality.com/ to check that the certificate and nginx indeed work (you should get the default nginx welcome page, and the browser should report that the website is secure).

### Generating static files
We also need to generate the static files for deployment. To do this, first run (install webpack dependencies first)
```
npm run build
```

and then activate the environment and run
```
python manage.py collectstatic
```

### Configuring supervisor and gunicorn
First, install supervisor and gunicorn
```
sudo apt-get install supervisor gunicorn
```
Now create a directory where supervisor will log events:
```
sudo mkdir /var/log/gunicorn
```

Also, copy the supervisor conf (which makes sure supervisor executes gunicorn) file to its directory:
```
sudo cp  ~/p_values/deploy/supervisor.conf /etc/supervisor/conf.d
```

Now update supervisor:
```
sudo supervisorctl reread
sudo supervisorctl update
```

### Configuring nginx
Finally, we configure nginx again. Let's copy the nginx conf file to its distribution and create a link:
```
sudo cp ~/p_values/deploy/p_values.conf /etc/nginx/sites-available
sudo ln -s /etc/nginx/sites-available/p_values.conf /etc/nginx/sites-enabled
```

Then, go back to default nginx config and change `server_name` to `_;`:
```
sudo nano /etc/nginx/sites-available/default
```

Check that the configuration is ok with
```
sudo nginx -t
```
and after that restart nginx using
```
sudo systemctl restart nginx
```

If all went well, the website should now be live!

## Future improvements

* Move all the common js code to a separate file
* Use Vue-router and make the app a SPA
* Related to previous, leave the template compilation to webpack (this reqires hardcoding a few links)
* Related to previous, have only one django app (computation), which allows to share python code efficiently
* Try using webpack server for hot reload (with proxy option, probably), instead of browser-sync
