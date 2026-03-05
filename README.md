# PayEcho UI

Web app for **PayEcho** — built for Africa's unique financial landscape. Merchants get a dashboard to accept USDC on Base, share QR codes, view live payment feed, analytics, savings/lending, identity (credit score), and voice confirmations.

## Stack

- **React 19** + **TypeScript** + **Vite 7**
- **Tailwind CSS** for styling
- **Thirdweb** for wallet connect and Base chain
- **Recharts** for analytics
- **Framer Motion** for animations
- **React Router** for routing

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). For local network or tunnel access, see [Sharing via tunnel](#sharing-via-tunnel) below.

## Scripts

| Command        | Description                    |
|----------------|--------------------------------|
| `npm run dev`  | Start dev server (Vite)        |
| `npm run build`| TypeScript check + production build |
| `npm run preview` | Preview production build   |
| `npm run lint` | Run ESLint                     |

## Environment variables

Create a `.env` in the project root (see `.env.example` if present). All client-side vars must be prefixed with `VITE_`.

| Variable | Description |
|----------|-------------|
| `VITE_THIRDWEB_CLIENT_ID` | Thirdweb dashboard client ID |
| `VITE_PAYSTACK_PUBLIC_KEY` | Paystack public key (optional) |
| `VITE_OPENROUTER_API_KEY` | OpenRouter API key (optional) |
| `VITE_SITE_URL` | Canonical site URL (e.g. `http://localhost:5173/`) |
| `VITE_PUBLIC_APP_URL` | Public app URL for QR codes and callbacks (e.g. your tunnel URL or production URL) |
| `VITE_MERCHANT_VAULT_ADDRESS` | Merchant vault contract address (optional) |
| `VITE_FACTORY_ADDRESS`, `VITE_REGISTRY_ADDRESS`, etc. | Contract addresses when backend is wired |

After changing `.env`, restart the dev server.

## App structure

- **Public**: Home, Products, About, Features, Contact, Resources (Whitepaper, Smart Token, etc.), Connect, Register.
- **Pay flow**: `/pay` — customer payment screen (amount, vault, wallet/Paystack). Can be opened with `?payload=...` from a scanned QR.
- **Scan**: `/scan` — scan a PayEcho QR to open the payment URL.
- **Dashboard** (after onboarding): Dashboard home, QR, Transactions, Analytics, Savings, Lending, Identity, Voice. On mobile, a single menu icon in the header opens the sidebar (no Pay in that menu).

## Sharing via tunnel (e.g. localtunnel)

To test on a phone or share a link:

1. Start the app: `npm run dev` (note the port, usually 5173).
2. In another terminal: `npx localtunnel --port 5173` (or `--subdomain payecho-demo` if you want a fixed subdomain).
3. Set `VITE_PUBLIC_APP_URL` in `.env` to the tunnel URL (e.g. `https://your-subdomain.loca.lt`), then restart `npm run dev`.
4. Optional: disable HMR over the tunnel to avoid white screen:  
   `DISABLE_HMR=1 npm run dev` (Windows Git Bash) or `$env:DISABLE_HMR="1"; npm run dev` (PowerShell).

Visitors may see localtunnel’s “tunnel password” page once per IP per 7 days; the password is the public IP of the machine running localtunnel (see [loca.lt/mytunnelpassword](https://loca.lt/mytunnelpassword)).

## Build & deploy

```bash
npm run build
```

Output is in `dist/`. Serve with any static host. Set `VITE_PUBLIC_APP_URL` (and other `VITE_*` vars) to your production URL for the deployed build.

## License

Private. See project root for terms.
