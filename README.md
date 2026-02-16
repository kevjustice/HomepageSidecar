# Homepage Helper (Sidecar) 🚀

A powerful, visual configuration UI for the [gethomepage/homepage](https://github.com/gethomepage/homepage) dashboard.

Homepage Helper acts as a "Sidecar" to your Homepage instance, allowing you to manage services, bookmarks, widgets, and raw configuration files through a modern, responsive web interface.

## ✨ Features

- **Visual Board**: Organize your services with drag-and-drop reordering and compact, dense card layouts.
- **Tree Editor**: Manage nested groups and hierarchy with ease.
- **Widget Catalog**: Discover and configure information widgets with direct template support.
- **Expert Mode**: Direct YAML access for power users with real-time preview.
- **Docker/K8s/Proxmox**: First-class support for infrastructure-specific configurations.
- **Custom Branding**: Fully dark-mode themed with a premium UI.

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose
- An existing Homepage installation

### Installation

1. Clone this repository and update the `docker-compose.yml`.
2. Update your `docker-compose.yml` to mount your Homepage config directory.

```yaml
services:
  homepage-helper:
    image: kevjustice/homepage-helper:latest
    container_name: homepage-helper
    ports:
      - "8080:8080"
    volumes:
      - /path/to/your/homepage/config:/app/config
    restart: unless-stopped
```

3. Run `docker compose up -d`.
4. Visit `http://localhost:8080`.

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Vite, Lucide, Dnd-kit.
- **Backend**: Fastify, Node.js, TypeScript, Zod.
- **Branding**: Custom Minimalist UX.

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---
Created with ❤️ by [Kevin Justice](https://github.com/kevjustice)
