# Kubernetes

## Install Ingress-nginx setup

Latest documentations at https://kubernetes.github.io/ingress-nginx/deploy/

`kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.0/deploy/static/provider/cloud/deploy.yaml`

NB - Digital Ocean has their own installation

## Nginx/Ingress infrastructure

Before adding a new deployment don't forget to `npm run build` `npm run push` in the new service. This will run the first `docker build` and `docker push` to initialize the image.

trigger-change:1

## Manage secrets

`JWT_KEY` and `STRIPE_KEY` should be added to docker desktop cluster secrets and deployed (DigitalOcean) cluster secrets. Switch `context` between them to deploy to both.

### Create kubernetes secret for jwt

create jwt-secret manually, better to use ENV_VARS in the config

`kubectl create secret generic jwt-secret --from-literal=JWT_KEY=XXXXX`

the secret is used in the `/infrastructure/k8s/*-depl.yaml` files

### Create kubernetes secret for (stripe) secret key

create jwt-secret manually, better to use ENV_VARS in the config

`kubectl create secret generic stripe-secret --from-literal STRIPE_KEY=sk_test_XXXX`

### Commands

`kubectl delete secret jwt-secret`

`kubectl get secrets`
