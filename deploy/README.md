# Ecommerce API deployment

The API runs as the `ecommerce-api` systemd service on the existing Aivora EC2 host.

- Public origin: `https://shop-api.54-90-159-53.sslip.io`
- API base URL: `https://shop-api.54-90-159-53.sslip.io/api/v1`
- Health check: `https://shop-api.54-90-159-53.sslip.io/health`
- Application directory: `/opt/ecommerce-api/current`
- Persistent environment: `/opt/ecommerce-api/shared/.env`
- Persistent reports: `/opt/ecommerce-api/shared/reports`

The TLS certificate renews through the `certbot.timer` systemd timer. Until the EC2 security group allows inbound TCP port 443, the same endpoints remain available over `http://`.

Deployments are stored under `/opt/ecommerce-api/releases`. The `current` symlink points to the active release so a previous release can be restored without rebuilding it.
