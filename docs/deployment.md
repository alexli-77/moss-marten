# Deployment

## Local Node.js

```bash
cp .env.example .env
cp config/config.example.yaml config/config.yaml
npm install
npm run build
npm start
```

## Docker Compose

```bash
cp .env.example .env
cp config/config.example.yaml config/config.yaml
docker compose up -d --build
```

## Discord Bot Setup

Create a Discord application and bot, then invite it to your server with permissions to:

- read messages
- send messages
- read message history

Enable the Message Content Intent in the Discord developer portal if you want Discord history to be useful.

## Configuration Files

- `.env`: secrets and deployment-specific values
- `config/config.yaml`: local runtime configuration
- `config/config.example.yaml`: safe template committed to git

Never commit `.env`, `config/config.yaml`, or `data/`.
