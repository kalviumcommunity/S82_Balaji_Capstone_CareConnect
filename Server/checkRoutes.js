const fs = require("fs");
const path = require("path");

const routesDir = path.resolve(__dirname, "routes");

function checkIsExpressRouter(routeModule) {
    const methods = ["get", "post", "put", "delete", "patch", "all", "use"];
    return (
        typeof routeModule === "function" ||
        (typeof routeModule === "object" &&
            methods.some((method) => typeof routeModule[method] === "function"))
    );
}

function checkRoutes() {
    if (!fs.existsSync(routesDir)) {
        console.error(`❌ Routes directory not found: ${routesDir}`);
        return;
    }

    const files = fs.readdirSync(routesDir).filter(f => f.endsWith(".js"));

    if (files.length === 0) {
        console.warn("⚠️ No route files found.");
        return;
    }

    for (const file of files) {
        const fullPath = path.join(routesDir, file);
        try {
            const routeModule = require(fullPath);
            if (checkIsExpressRouter(routeModule)) {
                console.log(`✅ ${file} exports a valid Express Router.`);
            } else {
                console.warn(`⚠️ ${file} does not export a valid Express Router.`);
            }
        } catch (err) {
            console.error(`❌ Error loading ${file}: ${err.message}`);
        }
    }
}

checkRoutes();
