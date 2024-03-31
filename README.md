# Shows and Events Chelas Application


This repository contains the source code of the SECA application, developed throughout the first semester of the 2nd year's Introduction to Web Programming class of the Computer Engineering degree at Instituto Superior de Engenharia de Lisboa.

**Teacher:** Valderi Leithardt

![ISEL](images/isel-logo.png)

## Authors
- [50484 Afonso Santos](https://github.com/AfonsoSantos44)
- [50497 Francisco Antunes](https://github.com/HarvyDev)

## Table of Contents
- [Abstract](#abstract)
- [Introduction](#introduction)
- [Application Structure](#application-structure)
    - [Client Side Structure](#client-side-structure)
    - [Server Side Structure](#server-side-structure)
- [Web API](#web-api)
    - [Features](#features)
    - [Testing the API](#testing-the-api)
        - [Running with mock data](#running-with-mock-data)
- [ElasticSearch](#elasticsearch)
- [Running the application locally](#running-the-application-locally)

## Abstract

After completing the four phases of the work proposed for this semester, a brief and concise explanation of what was accomplished will be presented in this report, so that anyone can understand how it works, the many functionalities that it has and the tools used to create it.

## Introduction

In this work, we developed a single page Web application that allows you to manage events, using the TicketMaster API. The application contains several functionalities, all of them implemented by us and that will be explained later, not only from the point of view of the user but also from the server side of the application.

## Application Structure

The structure of the application is divided into two parts, the client side and the server side. The client side is the part that the user sees and interacts with, while the server side is the part that is not visible to the user and is responsible for all the operations that are performed in the application.

## Client Side Structure

From the clients point of view, the application presents the structure that was requested, with all the functionalities working. This structure presents a login page, where a user can create a user or login. After login, it presents a main page where you can view all available events and search for events through a search bar, it is on this main page that all the buttons are located to be able to perform all the existing functionalities, (create groups, view existing groups, delete groups, add and remove events, etc.).

## Server Side Structure

This part of the application is responsible for all the operations and functionalities that are performed in the application. We used the express framework to create the server and handle the multiple requests, and the JS standard library function fetch to make requests to the TicketMaster API. When it comes to storage, we used ElasticSearch to store all the necessary data. In order to authenticate a user and, we used the Passport middleware. Since this web application is a single page application, we used Handlebars to render the templates.

## Web API

One of the objectives of this work was to develop a web API that lets you manage groups of events. This API follows current REST standards and is documented using the OpenAPI standard. The documentation of this API is available in the docs folder.

### Features

The features of the API are separated into 3 categories. The first category is the user, where you can create a user, login and logout. The second category is the events, where you can search for events and view popular events. The third and last category is the groups, where you can create groups, delete groups, view groups, add events to groups and remove events from groups.

The paths of the API are the following:

| Path                         | Method | Parameters                    | Description             |
|------------------------------|--------|-------------------------------|-------------------------|
| `/api/users/create`          | `POST` | `username`, `password`        | Create a new user       |
| `/api/events/search`         | `GET`  | `keyword`, `size`, `page`     | Search for events       |
| `/api/events/popular-events` | `GET`  | None                          | View popular events     |
| `/api/groups/create`         | `POST` | `name`, `description`         | Create a group          |
| `/api/groups/delete`         | `POST` | `name`                        | Delete a group          |
| `/api/groups/edit`           | `POST` | `name`, `name`, `description` | Edit a group            |
| `/api/groups/details`        | `GET`  | `name`                        | View group details      |
| `/api/groups/add-event`      | `POST` | `name`, `eventId`             | Add event to group      |
| `/api/groups/remove-event`   | `POST` | `name`, `eventId`             | Remove event from group |


### Testing the API

In order to test the API, we used the Postman tool. This tool allows you to test the API by sending requests to the server and receiving responses. The tests collection used to test the application are available in the docs folder.

#### Running with mock data

If you want to run the application with mock data, uncomment the function call to genMockData() in the es-data-mem.mjs file. This function will generate mock data and store it in ElasticSearch.

## ElasticSearch

We used ElasticSearch to store all the data related to the application, such as users, groups and its events. We used the following indexes:

- `users` - stores all the users of the application, including their username, password and UUID. However, the password is not returned by the function that returns the user data.
- `groups` - stores all the groups of each user, using an array. Each group has a name, description and an array of events.

**Example of a user:**
```json
    {
        "example_user": {
          "username": "example_user",
          "password": "example_password",
          "uuid": "example_uuid"
        }
    }
```

**Example of a group:**
```json
    {
        "example_uuid": {
          "groups": [
              {
                  "name": "example_name",
                  "description": "example_description",
                  "events": [
                      {
                          "id": "example_id",
                          "name": "example_name",
                          "segment": "example_segment",
                          "genre": "example_genre"   
                      }
                  ] 
              }
          ]
        }
    }
```
## Running the application locally

#### Clone the repository:

```bash 
!#/bin/bash
git clone https://github.com/isel-leic-ipw/seca-ipw-p1-leic2324i-ipw32d-g10.git
```

#### Change directory to the repository folder:

```bash 
!#/bin/bash
cd seca-ipw-p1-leic2324i-ipw32d-g10
```

#### Install the dependencies:

```bash
!#/bin/bash
npm install
```

#### Make the following changes to your elasticsearch.yml file to run locally:

```xpack.security.enabled: false```

```network.host: 127.0.0.1```

```http.port: 9200```

#### Run elastic search:

```bash
!#/bin/bash
./bin/elasticsearch
```

#### Run the server:

```bash
!#/bin/bash
npm start
```

#### Access the application at:

```http://localhost:3000```
