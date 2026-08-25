# Trading Hub

## Environment Setup

Create the following files in `secrets/`:

- `secrets/auth_client_id` (discord app client id)
- `secrets/auth_client_secret` (discord app client secret)
- `secrets/auth_redirect` (e.g. https://example.com/api/auth)
- `secrets/redis_cache_lifespan` (e.g. 43200)
- `secrets/redis_session_lifespan` (e.g. 604800)

And make sure the `assets/` folder exists at the project root before starting the stack, as the Next.js container mounts the folder and uses it to render asset images from the `/api/assets/...` endpoint.

## Build Project

```bash
docker compose up -d
```

Access the app at `http://localhost:3000`.

## Import MongoDB Data

Generate dump files from old MongoDB database:
```bash
mongodump --host 127.0.0.1 --port 27017 --username <USER> --password <PASS> --authenticationDatabase admin --db flagwars --out /root/dump
```

Copy dump files into the new MongoDB container:
```bash
docker cp ./dump tradinghub-mongodb:/tmp/dump
```

Restore database:
```bash
docker compose exec -T mongodb mongorestore --drop --db flagwars /tmp/dump/flagwars
```

Clear all Redis cache:
```bash
docker compose exec -T redis redis-cli FLUSHALL
```

Recreate Next.js so build-time data is refreshed:
```bash
docker compose up -d --force-recreate website
```

## Optional: Clean Slate

Warning: this removes persisted DB/cache data.
```bash
rm -rf storage/mongodb/* storage/redis/*
docker compose up -d --force-recreate
```