# Qubic Sentinel

Qubic Sentinel is an advanced real-time whale transaction monitoring system for the Qubic blockchain network. It uses blockchain RPC APIs to detect large "whale" transactions based on a configurable threshold and sends alerts via configurable webhooks such as Discord (via EasyConnect). The project includes a backend sentinel script and a modern React dashboard for real-time visualization and configuration.

---

## Features

* Real-time polling of Qubic blockchain ticks and transactions
* Configurable whale transaction threshold
* EasyConnect webhook integration for Discord alerts with rich embeds
* React dashboard with live stats and recent alerts visualization
* Configurable RPC endpoints, polling intervals, and webhook URLs
* Docker-ready production deployment
* PowerShell sentinel script for quick instant testing and deployment

---

## Architecture

* **Backend** : Node.js sandbox listens to Qubic RPC, evaluates transactions using custom rules, and sends alerts
* **Frontend** : React app with TailwindCSS and Lucide icons for a clean, modern UI showing stats and alerts
* **Notifications** : Discord webhook integration for instant whale alerts with detailed transaction info

---

## Getting Started

## Prerequisites

* Node.js (v18+ recommended)
* npm
* PowerShell (for sentinel script)
* Docker (optional, for containerized deployment)

## Installation

1. **Clone repository:**
   <pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">bash</div></div><div><span><code><span><span class="token token">git</span><span> clone </span><span class="token token operator"><</span><span>repo-url</span><span class="token token operator">></span><span>
   </span></span><span><span></span><span class="token token">cd</span><span> qubic-sentinel
   </span></span><span></span></code></span></div></div></div></pre>
2. **Backend setup:**
   <pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">bash</div></div><div><span><code><span><span class="token token">cd</span><span> sentinel
   </span></span><span><span></span><span class="token token">npm</span><span></span><span class="token token">install</span><span>
   </span></span><span><span></span><span class="token token">cp</span><span> .env.example .env
   </span></span><span><span></span><span class="token token"># Edit .env to add your Discord/EasyConnect webhook URL and other config</span><span>
   </span></span><span></span></code></span></div></div></div></pre>
3. **Frontend setup:**
   <pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">bash</div></div><div><span><code><span><span class="token token">cd</span><span></span><span class="token token punctuation">..</span><span>/qubic-dashboard
   </span></span><span><span></span><span class="token token">npm</span><span></span><span class="token token">install</span><span>
   </span></span><span><span></span><span class="token token"># Paste React dashboard component in src/App.jsx</span><span>
   </span></span><span></span></code></span></div></div></div></pre>
4. **TailwindCSS Setup:**
   Run inside `qubic-dashboard` folder:
   <pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">bash</div></div><div><span><code><span><span class="token token">npm</span><span></span><span class="token token">install</span><span> -D tailwindcss @tailwindcss/postcss autoprefixer
   </span></span><span>npx tailwindcss init -p
   </span><span></span></code></span></div></div></div></pre>
5. **Start React server:**
   <pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">bash</div></div><div><span><code><span><span class="token token">npm</span><span> run dev
   </span></span><span></span></code></span></div></div></div></pre>
6. **Run backend sentinel:**
   <pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">bash</div></div><div><span><code><span><span class="token token">cd</span><span></span><span class="token token punctuation">..</span><span>/sentinel
   </span></span><span><span>powershell -ExecutionPolicy Bypass -File .</span><span class="token token punctuation">\</span><span>sentinel.ps1
   </span></span><span></span></code></span></div></div></div></pre>
7. **Open React dashboard:**
   [http://localhost:5173](http://localhost:5173/)

---

## Configuration

All configuration is via `.env` for backend and React state for frontend.

* `WHALE_THRESHOLD_QU`: Minimum transaction size for alerts
* `RPC_BASE_URL`: Qubic blockchain RPC endpoint URL
* `POLL_INTERVAL_MS`: Polling frequency in milliseconds
* `EASYCONNECT_WEBHOOK_URL`: Discord webhook URL for alert delivery

Configure webhook URL in both backend `.env` and frontend React config for alerting.

---

## Usage

* Use the React dashboard for real-time whale alerts visualization and quick webhook tests.
* Monitor backend console for tick polling and alert forwarding logs.
* Use PowerShell sentinel for quick start without Node.js environment.
* Docker container available for production ready deployment.

---

## Troubleshooting

* Ensure Docker Desktop and Node environment are correctly installed and running.
* Verify Discord webhook URL is correct and active.
* Restart servers if changes are made to environment variables or config files.
* Check ports `3000` for backend API and `5173` for React dashboard are free.

---

## Contributing

Contributions welcome. Please fork the repo, create a feature branch, and submit pull requests.

---

## License

MIT License © 2025 Team Green
