// widgetRegistry.ts

export interface WidgetTemplate {
    id: string;
    name: string;
    type: string; // The key used in services.yaml (e.g. 'plex', 'proxmox')
    description: string;
    category: 'service' | 'info' | 'system' | 'media' | 'download' | 'arr' | 'network' | 'other';
    icon: string; // Iconify icon
    defaultConfig: any; // The structure to dump to YAML
}

export const WIDGET_REGISTRY: WidgetTemplate[] = [
    // --- CUSTOM ---
    {
        id: 'custom-widget',
        name: 'Custom / Manual Config',
        type: 'custom',
        category: 'other',
        description: 'Paste your own YAML configuration for any widget not listed here.',
        icon: 'mdi:code-braces',
        defaultConfig: {
            custom: {
                key: "value"
            }
        }
    },

    // --- SYSTEM & INFRASTRUCTURE ---
    {
        id: 'proxmox',
        name: 'Proxmox VE',
        type: 'proxmox',
        category: 'system',
        description: 'Monitor PVE nodes, CPU, RAM, and storage.',
        icon: 'simple-icons:proxmox',
        defaultConfig: {
            proxmox: {
                url: "https://proxmox.local:8006",
                user: "root@pam",
                password: "password",
                node: "pve"
            }
        }
    },
    {
        id: 'portainer',
        name: 'Portainer',
        type: 'portainer',
        category: 'system',
        description: 'Docker container management status.',
        icon: 'simple-icons:portainer',
        defaultConfig: {
            portainer: {
                url: "http://portainer.local:9000",
                env: 1,
                key: "apikey"
            }
        }
    },
    {
        id: 'glances',
        name: 'Glances',
        type: 'glances',
        category: 'system',
        description: 'Cross-platform system monitoring tool.',
        icon: 'simple-icons:glances',
        defaultConfig: {
            glances: {
                url: "http://glances.local:61208",
                version: 4
            }
        }
    },
    {
        id: 'netdata',
        name: 'Netdata',
        type: 'netdata',
        category: 'system',
        description: 'Real-time performance monitoring.',
        icon: 'simple-icons:netdata',
        defaultConfig: {
            netdata: {
                url: "http://netdata.local:19999"
            }
        }
    },
    {
        id: 'scrutiny',
        name: 'Scrutiny',
        type: 'scrutiny',
        category: 'system',
        description: 'Hard Drive S.M.A.R.T Monitoring.',
        icon: 'mdi:harddisk',
        defaultConfig: {
            scrutiny: {
                url: "http://scrutiny.local:8080"
            }
        }
    },
    {
        id: 'beszel',
        name: 'Beszel',
        type: 'beszel',
        category: 'system',
        description: 'Lightweight server monitoring hub.',
        icon: 'mdi:server-network',
        defaultConfig: {
            beszel: {
                url: "http://beszel.local:8090",
                user: "user",
                password: "password",
                system: "MyServer"
            }
        }
    },

    // --- NETWORKING ---
    {
        id: 'pihole',
        name: 'Pi-hole',
        type: 'pihole',
        category: 'network',
        description: 'Network-wide ad blocking stats.',
        icon: 'simple-icons:pihole',
        defaultConfig: {
            pihole: {
                url: "http://pihole.local",
                key: "apikey"
            }
        }
    },
    {
        id: 'adguard',
        name: 'AdGuard Home',
        type: 'adguard',
        category: 'network',
        description: 'Network-wide software for blocking ads & tracking.',
        icon: 'simple-icons:adguard',
        defaultConfig: {
            adguard: {
                url: "http://adguard.local",
                user: "admin",
                password: "password"
            }
        }
    },
    {
        id: 'unifi',
        name: 'UniFi Controller',
        type: 'unifi',
        category: 'network',
        description: 'Ubiquiti network controller stats.',
        icon: 'simple-icons:ubiquiti',
        defaultConfig: {
            unifi: {
                url: "https://unifi.local:8443",
                user: "admin",
                password: "password"
            }
        }
    },
    {
        id: 'traefik',
        name: 'Traefik',
        type: 'traefik',
        category: 'network',
        description: 'Cloud native application proxy.',
        icon: 'simple-icons:traefik',
        defaultConfig: {
            traefik: {
                url: "http://traefik.local:8080"
            }
        }
    },
    {
        id: 'nginxpm',
        name: 'Nginx Proxy Manager',
        type: 'nginxproxymanager',
        category: 'network',
        description: 'Manage Nginx proxy hosts with a simple interface.',
        icon: 'simple-icons:nginx',
        defaultConfig: {
            nginxproxymanager: {
                url: "http://npm.local:81",
                user: "admin@example.com",
                password: "password"
            }
        }
    },
    {
        id: 'tailscale',
        name: 'Tailscale',
        type: 'tailscale',
        category: 'network',
        description: 'Zero config VPN monitoring.',
        icon: 'simple-icons:tailscale',
        defaultConfig: {
            tailscale: {
                key: "tskey-api-..."
            }
        }
    },
    {
        id: 'cloudflaretunnel',
        name: 'Cloudflare Tunnel',
        type: 'cloudflaretunnel',
        category: 'network',
        description: 'Monitor Cloudflare Zero Trust Tunnels.',
        icon: 'simple-icons:cloudflare',
        defaultConfig: {
            cloudflaretunnel: {
                account_id: "your_account_id",
                tunnel_id: "your_tunnel_id",
                key: "api_token"
            }
        }
    },

    // --- MEDIA ---
    {
        id: 'plex',
        name: 'Plex',
        type: 'plex',
        category: 'media',
        description: 'Stream count and library stats.',
        icon: 'simple-icons:plex',
        defaultConfig: {
            plex: {
                url: "http://plex.local:32400",
                token: "plex-token"
            }
        }
    },
    {
        id: 'tautulli',
        name: 'Tautulli',
        type: 'tautulli',
        category: 'media',
        description: 'Monitoring and tracking for Plex Media Server.',
        icon: 'simple-icons:tautulli',
        defaultConfig: {
            tautulli: {
                url: "http://tautulli.local:8181",
                key: "apikey"
            }
        }
    },
    {
        id: 'jellyfin',
        name: 'Jellyfin',
        type: 'jellyfin',
        category: 'media',
        description: 'The Free Software Media System.',
        icon: 'simple-icons:jellyfin',
        defaultConfig: {
            jellyfin: {
                url: "http://jellyfin.local:8096",
                key: "apikey"
            }
        }
    },
    {
        id: 'emby',
        name: 'Emby',
        type: 'emby',
        category: 'media',
        description: 'Personal Media Server.',
        icon: 'simple-icons:emby',
        defaultConfig: {
            emby: {
                url: "http://emby.local:8096",
                key: "apikey"
            }
        }
    },
    {
        id: 'overseerr',
        name: 'Overseerr',
        type: 'overseerr',
        category: 'media',
        description: 'Request management and media discovery.',
        icon: 'mdi:eye-circle',
        defaultConfig: {
            overseerr: {
                url: "http://overseerr.local:5055",
                key: "apikey"
            }
        }
    },
    {
        id: 'jellyseerr',
        name: 'Jellyseerr',
        type: 'jellyseerr',
        category: 'media',
        description: 'Fork of Overseerr for Jellyfin.',
        icon: 'simple-icons:jellyfin',
        defaultConfig: {
            jellyseerr: {
                url: "http://jellyseerr.local:5055",
                key: "apikey"
            }
        }
    },
    {
        id: 'audiobookshelf',
        name: 'Audiobookshelf',
        type: 'audiobookshelf',
        category: 'media',
        description: 'Self-hosted audiobook and podcast server.',
        icon: 'mdi:book-music',
        defaultConfig: {
            audiobookshelf: {
                url: "http://abs.local:13378",
                key: "apikey"
            }
        }
    },
    {
        id: 'kavita',
        name: 'Kavita',
        type: 'kavita',
        category: 'media',
        description: 'Digital library for comics and mangas.',
        icon: 'mdi:book-open-page-variant',
        defaultConfig: {
            kavita: {
                url: "http://kavita.local:5000",
                user: "user",
                password: "password"
            }
        }
    },

    // --- ARRS (The Starrs) ---
    {
        id: 'sonarr',
        name: 'Sonarr',
        type: 'sonarr',
        category: 'arr',
        description: 'Smart PVR for newsgroup and bittorrent users.',
        icon: 'simple-icons:sonarr',
        defaultConfig: {
            sonarr: {
                url: "http://sonarr.local:8989",
                key: "apikey"
            }
        }
    },
    {
        id: 'radarr',
        name: 'Radarr',
        type: 'radarr',
        category: 'arr',
        description: 'Movie organizer/manager for usenet and torrents.',
        icon: 'simple-icons:radarr',
        defaultConfig: {
            radarr: {
                url: "http://radarr.local:7878",
                key: "apikey"
            }
        }
    },
    {
        id: 'lidarr',
        name: 'Lidarr',
        type: 'lidarr',
        category: 'arr',
        description: 'Music collection manager.',
        icon: 'simple-icons:lidarr',
        defaultConfig: {
            lidarr: {
                url: "http://lidarr.local:8686",
                key: "apikey"
            }
        }
    },
    {
        id: 'readarr',
        name: 'Readarr',
        type: 'readarr',
        category: 'arr',
        description: 'Ebook and audiobook collection manager.',
        icon: 'simple-icons:readarr',
        defaultConfig: {
            readarr: {
                url: "http://readarr.local:8787",
                key: "apikey"
            }
        }
    },
    {
        id: 'prowlarr',
        name: 'Prowlarr',
        type: 'prowlarr',
        category: 'arr',
        description: 'Indexer manager/proxy.',
        icon: 'simple-icons:prowlarr',
        defaultConfig: {
            prowlarr: {
                url: "http://prowlarr.local:9696",
                key: "apikey"
            }
        }
    },
    {
        id: 'bazarr',
        name: 'Bazarr',
        type: 'bazarr',
        category: 'arr',
        description: 'Companion application to Sonarr and Radarr for subtitles.',
        icon: 'mdi:subtitles',
        defaultConfig: {
            bazarr: {
                url: "http://bazarr.local:6767",
                key: "apikey"
            }
        }
    },

    // --- DOWNLOADERS ---
    {
        id: 'sabnzbd',
        name: 'SABnzbd',
        type: 'sabnzbd',
        category: 'download',
        description: 'Usenet downloader.',
        icon: 'simple-icons:sabnzbd',
        defaultConfig: {
            sabnzbd: {
                url: "http://sabnzbd.local:8080",
                key: "apikey"
            }
        }
    },
    {
        id: 'qbittorrent',
        name: 'qBittorrent',
        type: 'qbittorrent',
        category: 'download',
        description: 'Torrent client.',
        icon: 'simple-icons:qbittorrent',
        defaultConfig: {
            qbittorrent: {
                url: "http://qbittorrent.local:8080",
                user: "admin",
                password: "password"
            }
        }
    },
    {
        id: 'transmission',
        name: 'Transmission',
        type: 'transmission',
        category: 'download',
        description: 'Fast, easy, and free BitTorrent client.',
        icon: 'simple-icons:transmission',
        defaultConfig: {
            transmission: {
                url: "http://transmission.local:9091",
                user: "admin",
                password: "password"
            }
        }
    },
    {
        id: 'deluge',
        name: 'Deluge',
        type: 'deluge',
        category: 'download',
        description: 'BitTorrent client.',
        icon: 'simple-icons:deluge',
        defaultConfig: {
            deluge: {
                url: "http://deluge.local:8112",
                password: "password"
            }
        }
    },
    {
        id: 'nzbget',
        name: 'NZBGet',
        type: 'nzbget',
        category: 'download',
        description: 'Usenet downloader.',
        icon: 'mdi:download-network',
        defaultConfig: {
            nzbget: {
                url: "http://nzbget.local:6789",
                user: "nzbget",
                password: "password"
            }
        }
    },
    {
        id: 'pyload',
        name: 'pyLoad',
        type: 'pyload',
        category: 'download',
        description: 'Free and Open Source download manager.',
        icon: 'mdi:download-box',
        defaultConfig: {
            pyload: {
                url: "http://pyload.local:8000",
                user: "admin",
                password: "password"
            }
        }
    },

    // --- OTHER / UTILITIES ---
    {
        id: 'homeassistant',
        name: 'Home Assistant',
        type: 'homeassistant',
        category: 'other',
        description: 'Open source home automation.',
        icon: 'simple-icons:homeassistant',
        defaultConfig: {
            homeassistant: {
                url: "http://hass.local:8123",
                key: "long-lived-access-token"
            }
        }
    },
    {
        id: 'paperless',
        name: 'Paperless-ngx',
        type: 'paperlessngx',
        category: 'other',
        description: 'Document management system.',
        icon: 'simple-icons:paperlessngx',
        defaultConfig: {
            paperlessngx: {
                url: "http://paperless.local:8000",
                token: "token"
            }
        }
    },
    {
        id: 'nextcloud',
        name: 'Nextcloud',
        type: 'nextcloud',
        category: 'other',
        description: 'Safe home for all your data.',
        icon: 'simple-icons:nextcloud',
        defaultConfig: {
            nextcloud: {
                url: "http://nextcloud.local",
                user: "user",
                password: "password"
            }
        }
    },
    {
        id: 'immich',
        name: 'Immich',
        type: 'immich',
        category: 'other',
        description: 'Self-hosted photo and video backup solution.',
        icon: 'mdi:image-multiple',
        defaultConfig: {
            immich: {
                url: "http://immich.local:2283",
                key: "apikey"
            }
        }
    },
    {
        id: 'changedetection',
        name: 'ChangeDetection.io',
        type: 'changedetectionio',
        category: 'other',
        description: 'Website change detection.',
        icon: 'mdi:update',
        defaultConfig: {
            changedetectionio: {
                url: "http://changedetection.local:5000",
                key: "apikey"
            }
        }
    },
    {
        id: 'uptimekumma',
        name: 'Uptime Kuma',
        type: 'uptimekuma',
        category: 'other',
        description: 'Self-hosted monitoring tool.',
        icon: 'simple-icons:uptimekuma',
        defaultConfig: {
            uptimekuma: {
                url: "http://uptimekuma.local:3001",
                slug: "slug"
            }
        }
    },
    {
        id: 'speedtest',
        name: 'Speedtest Tracker',
        type: 'speedtest',
        category: 'other',
        description: 'Continuously run internet speed tests.',
        icon: 'simple-icons:speedtest',
        defaultConfig: {
            speedtest: {
                url: "http://speedtest.local:80",
            }
        }
    },
    {
        id: 'mealie',
        name: 'Mealie',
        type: 'mealie',
        category: 'other',
        description: 'Self hosted recipe manager.',
        icon: 'mdi:chef-hat',
        defaultConfig: {
            mealie: {
                url: "http://mealie.local:9925",
                key: "apikey"
            }
        }
    },

    // --- INFO WIDGETS ---
    {
        id: 'resources',
        name: 'System Resources',
        type: 'resources',
        category: 'info',
        description: 'CPU and Memory usage (Global).',
        icon: 'mdi:chip',
        defaultConfig: {
            resources: {
                cpu: true,
                memory: true,
                disk: "/"
            }
        }
    },
    {
        id: 'weather',
        name: 'Weather',
        type: 'weather',
        category: 'info',
        description: 'Current weather and forecast.',
        icon: 'mdi:weather-partly-cloudy',
        defaultConfig: {
            weather: {
                location: "London,UK",
                units: "metric",
                cache: 5
            }
        }
    },
    {
        id: 'search',
        name: 'Search Bar',
        type: 'search',
        category: 'info',
        description: 'Web search input.',
        icon: 'mdi:magnify',
        defaultConfig: {
            search: {
                provider: "google",
                target: "_blank"
            }
        }
    },
    {
        id: 'date',
        name: 'Date & Time',
        type: 'date',
        category: 'info',
        description: 'Current date and time display.',
        icon: 'mdi:calendar-clock',
        defaultConfig: {
            date: {
                format: "dddd, MMMM Do YYYY"
            }
        }
    },
    {
        id: 'greeting',
        name: 'Greeting',
        type: 'greeting',
        category: 'info',
        description: 'Personalized greeting message.',
        icon: 'mdi:hand-wave',
        defaultConfig: {
            greeting: {
                text_size: "2xl",
                text: "Welcome back!"
            }
        }
    }
];
