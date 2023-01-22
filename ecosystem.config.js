module.exports = {
    apps: [{
        name: "server",
        script: "./server.js",
        env: {
            NODE_ENV: "development"
        },
        env_test: {
            NODE_ENV: "test",
        },
        env_staging: {
            NODE_ENV: "staging",
        },
        env_production: {
            NODE_ENV: "production",
        }
    }]
}