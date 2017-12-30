# P-values app

This is a web application for calculation of p-rationality values in simple 2 player games. It is a simple Django app, made with the [cookiecutter](https://github.com/pydanny/cookiecutter-django) framework and hosted on an AWS EC2 instance server.

## Python dependencies

## Environmental variables and settings configuration

## Accessing the server

To access the server (with SSH), first copy the private key `p_values.pem` to `~/.ssh/`. Then execute
```
chmod 400 ~/.ssh/gindumac-mis.pem
```
to set the required permission for the key.

After this, the server can be accessed by executing
```ssh -i ~/.ssh/gindumac-mis.pem ubuntu@18.195.156.201
```

## Setting up a PostgreSQL database

## Running the app - development

## Running the app - deployment
