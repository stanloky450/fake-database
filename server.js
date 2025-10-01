const jsonServer = require("json-server");
const fs = require("fs");
const path = require("path");

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);

// Function to recursively expose nested endpoints
function exposeNestedRoutes(obj, prefix = "", routes = {}) {
  for (let key in obj) {
    const value = obj[key];
    const route = prefix ? `${prefix}/${key}` : `/${key}`;

    if (typeof value === "object" && !Array.isArray(value)) {
      // Register nested object as endpoint
      routes[route] = value;
      exposeNestedRoutes(value, route, routes);
    }
  }
  return routes;
}

const dbFile = path.join(__dirname, "db.json");
const dbData = JSON.parse(fs.readFileSync(dbFile, "utf-8"));

const nestedRoutes = exposeNestedRoutes(dbData);

// Add custom nested routes to server
Object.keys(nestedRoutes).forEach((route) => {
  server.get(route, (req, res) => {
    res.jsonp(nestedRoutes[route]);
  });
});

server.use(router);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`JSON Server running on port ${PORT}`);
});
