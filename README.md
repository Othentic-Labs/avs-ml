# 🦓 Decentra AI

## What is Decentra AI?

Decentra AI is a marketplace for open source artificial intelligence development. Decentra utilizes cryptocurrency economics for positive incentive alignment to coordinate communities of developers to push AI innovation even further.

Project owners can publish the architecture of the neural network they want to develop and provide the code that will be used to test the models. Developers can then use this information to suggest new models with the potential to earn token rewards. These new suggested models are then checked by a network of attesters to confirm the validity of the improvements.

## ▶️ Run the demo

We provide a sample docker-compose configuration which sets up the following
services:

- Aggregator node
- 3 Attester nodes
- AVS WebAPI endpoint
- TaskPerformer endpoint

To set up the environment, create a `.env` file with the usual Othentic
configurations (see the `.env.example`), then run:
```console
docker-compose up --build
```

> [!NOTE]
> This might take a few minutes when building the images

### Updating the Othentic node version
To update the `othentic-cli` inside the docker images to the latest version, you
need to rebuild the images using the following command:
```console
docker-compose build --no-cache
```

## 🏗️ Architecture
The Othentic Attester nodes communicate with an AVS WebAPI endpoint which
validates tasks on behalf of the nodes. The attesters then sign the tasks based
on the AVS WebAPI response.

Attester nodes can either all communicate with a centralized endpoint or each
implement their own validation logic.

### AVS WebAPI
```
POST task/validate returns (bool) {"proofOfTask": "{proofOfTask}"};
```
