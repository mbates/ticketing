## Hosts files

For local development add a local loopback to your hosts file

    127.0.0.1 tickets.local

## Skaffold

When disabling push (see below), remeber to build the docker image `docker build -t mikebates/ticketing-auth .`

```yaml
build:
  local:
    push: false
```

## Docker authentication

`docker login` needs to be run in the WSL2 terminal

## Kubernetes

### Install Ingress-nginx setup

Latest documentations at https://kubernetes.github.io/ingress-nginx/deploy/

`kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.0/deploy/static/provider/cloud/deploy.yaml`

NB - Digital Ocean has their own installation

### Manage secrets

`JWT_KEY` and `STRIPE_KEY` should be added to docker desktop cluster secrets and deployed (DigitalOcean) cluster secrets. Switch `context` between them to deploy to both.

#### Create kubernetes secret for jwt

create jwt-secret manually, better to use ENV_VARS in the config

`kubectl create secret generic jwt-secret --from-literal=JWT_KEY=XXXXX`

the secret is used in the `/infrastructure/k8s/*-depl.yaml` files

#### Create kubernetes secret for (stripe) secret key

create jwt-secret manually, better to use ENV_VARS in the config

`kubectl create secret generic stripe-secret --from-literal STRIPE_KEY=sk_test_XXXX`

#### Commands

`kubectl delete secret jwt-secret`

`kubectl get secrets`

### Pods

`kubectl get pods`

```
NAME                               READY   STATUS    RESTARTS   AGE
auth-depl-65bb4949bd-lgcrk         1/1     Running   0          6m48s
auth-mongo-depl-5b8857b4fc-j7kc5   1/1     Running   0          6m48s
client-depl-5485c68cfd-8wzrg       1/1     Running   0          3s
nats-depl-6754898fbd-sgr4j         1/1     Running   0          2m3s
```

**Debug XxxXxxxError pods**

`kubectl describe pod auth-depl-65bb4949bd-lgcrk`

**Reset a pod**

`kubectl delete pod client-depl-5485c68cfd-8wzrg`

**Shell access to a pod**

`kubectl exec -it auth-depl-65bb4949bd-lgcrk -- sh`

**Forward port to a pod**

_---only do this for local development---_

`kubectl port-forward nats-depl-7449bd8fc4-wtvct 4222:4222`

### Namespaces

`kubectl get namespace`

```
NAME              STATUS   AGE
default           Active   2d
ingress-nginx     Active   46h
kube-node-lease   Active   2d
kube-public       Active   2d
kube-system       Active   2d
```

`kubectl get services -n ingress-nginx`

```
NAME                                 TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)                      AGE
ingress-nginx-controller             LoadBalancer   10.101.175.179   localhost     80:31240/TCP,443:32562/TCP   46h
ingress-nginx-controller-admission   ClusterIP      10.105.35.60     <none>        443/TCP                      46h
```

url to get to ingress-nginx from another pod

http://SERVICE.NAMESPACE.svc.cluster.local

http://ingress-nginx.ingress.nginx.svc.cluster.local

ingress-nginx-controller

## NATS

to get more info on a channel:

- open `https://localhost:8222/streaming`
- click on channels
- add `?subs=1` to the end of the url

## Mongo

### Exec into mongo pod

`kubectl get pods`

```
NAME                                  READY   STATUS    RESTARTS       AGE
auth-depl-7df976f677-cv4c4            1/1     Running   0              116m
auth-mongo-depl-7685848cd8-7mfvf      1/1     Running   0              116m
client-depl-58ddcdb66-bh7lh           1/1     Running   0              116m
nats-depl-557f7fcc84-rx6sf            1/1     Running   0              116m
orders-depl-d45f46769-9q2cd           1/1     Running   1 (116m ago)   116m
orders-mongo-depl-67b655bdd4-hpn7x    1/1     Running   0              116m
tickets-depl-7cb6d4dc99-kb4wz         1/1     Running   1 (116m ago)   116m
tickets-mongo-depl-6dcdbf8c88-k5d5v   1/1     Running   0              116m
```

`kubectl exec -it orders-mongo-depl-67b655bdd4-hpn7x -- mongosh`

### Set database

```
test> show dbs
admin   40.00 KiB
config  60.00 KiB
local   40.00 KiB
orders  48.00 KiB
test> use orders;
switched to db orders
orders> db.tickets
orders.tickets
orders>
```

### Find Tickets

`db.tickets.find()`
`db.tickets.find({price: 15})`

## Digital Ocean

https://digitalocean.com

create an API key at https://cloud.digitalocean.com/account/api/tokens then run `doctl auth init` and paste in the generated token

### switch contexts

use this to debug deployed cluster

`kubectl config view`

```
apiVersion: v1
...
contexts:
- context:
    cluster: do-sfo3-ticketing
    user: do-sfo3-ticketing-admin
  name: do-sfo3-ticketing
- context:
    cluster: docker-desktop
    user: docker-desktop
  name: docker-desktop
...
```

#### Switch to local

use `contexts.name` for final arg

`kubectl config use-context docker-desktop`

#### Switch to Digital Ocean

`kubectl config use-context do-sfo3-ticketing`

## Delete zone files created by Windows

`find . -name "*:Zone.Identifier" -type f -delete`

## Github / Docker authentication

Add authentication to https://github.com/[ACCOUNT]/[REPO]/settings/secrets/actions

- Add `DOCKER_USERNAME` as a repository action variable
- Add `DOCKER_PASSWORD` as a repository action secret
