Node: process.env.NODE_ENV
Typically development or production, although you can manually set it to staging if you want. Node uses this flag to optimize certain libraries, skip debug logs, etc.

Vite: “mode”
When we run npm run dev, Vite sets the mode to development.
When we run npm run build, Vite sets the mode to production.
We can create .env.production, .env.staging, .env.development, etc. that Vite will read based on that mode to run Vite with the flag --mode="environmentChoice"

Render: Environments
We have two separate Render services. One is “staging,” one is “production.”
Each service has its own environment variables in the Render dashboard (NODE_ENV=staging & NODE_ENV=production).

GitHub: “environments”
GitHub also has a notion of “Environments” for environment protection rules. If you want, you can define them in your repo settings and store secrets or restrict deployments. This is optional, but can be helpful.
