# Fullstack application with Optimizely integration

A sample fullstack application created as part of Optimizely certification

## Demo

Please refer https://optimisely-full-stack.herokuapp.com/

### Prerequisites

Clone the folder using 
```
git clone https://github.com/neenu-kurian/optimisely-full-stack.git
```

Install node packages by using below command

```
cd client then do npm install. cd server/src/ then do npm install
```

### Installing

To start server

```
cd server; node app.js
```

And to start client

```
cd client ; npm run dev
```

### About
The aim of this project is to create experiments using optimisely and setup feature tests based on audience.

Here my audience is "logged in" audience.
If you login with any userid that has user1 in it , then they will see variation1 and if your userid has user2, they see variation 2.
Feature flag is setup , so that logged in audience also see a feature and there responses will be tracked by optimisely.

Webhooks are also setup to notify when the datafile is updated (the file that has all optimisely info related to the project, such as experiment details, feature test details, audience condition etc) so that user will see the latest changes made in optimisely full stack app.
