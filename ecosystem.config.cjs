module.exports = {
  apps : [{
    name: "watcher",
    script: "pnpm",
    args: "run start",
    interpreter: "none",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
};

