# P-values app

This is a web application for calculation of p-rationality values in simple 2 player games. It is a simple Django app, made with the [cookiecutter](https://github.com/pydanny/cookiecutter-django) framework and hosted on an AWS EC2 instance server.

## Python dependencies

First you need to install Python on the system. The best way to do this is by installing Miniconda, which will later be also used to manage environments. Make sure to select `yes` when asked if Miniconda path should be added to the `PATH` environmental variable

```
wget -c http://repo.continuum.io/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh
rm Miniconda3-latest-Linux-x86_64.sh
```

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
## Environmental variables and settings configuration

## Accessing the server

To access the server (with SSH), first copy the private key `p_values.pem` to `~/.ssh/`. Then execute
```
chmod 400 ~/.ssh/p_values.pem
```
to set the required permission for the key.

After this, the server can be accessed by executing
```
ssh -i ~/.ssh/p_values.pem ubuntu@18.195.151.190
```

## Setting up a PostgreSQL database

## Running the app - development

## Running the app - deployment
