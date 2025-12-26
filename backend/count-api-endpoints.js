// Count all API endpoints in the Medicare Plus project
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const routesDir = path.join(__dirname, 'routes');

// Store all endpoints
const endpoints = {
  GET: [],
  POST: [],
  PUT: [],
  PATCH: [],
  DELETE: []
};

let totalEndpoints = 0;

// Function to extract routes from a file
function extractRoutes(filePath, fileName) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const fileEndpoints = [];
  
  lines.forEach((line, index) => {
    // Match router.get, router.post, router.put, router.patch, router.delete
    const routeMatch = line.match(/router\.(get|post|put|patch|delete)\s*\(/);
    
    if (routeMatch) {
      const method = routeMatch[1].toUpperCase();
      
      // Try to find the route path (looking for strings in quotes)
      let routePath = '';
      
      // Check current line and next few lines for the path
      for (let i = index; i < Math.min(index + 3, lines.length); i++) {
        const pathMatch = lines[i].match(/['"`]([^'"`]+)['"`]/);
        if (pathMatch && pathMatch[1].startsWith('/')) {
          routePath = pathMatch[1];
          break;
        } else if (pathMatch && pathMatch[1] === '/') {
          routePath = '/';
          break;
        }
      }
      
      // Look for route description in comments above
      let description = '';
      if (index > 0) {
        const commentMatch = lines[index - 1].match(/@desc\s+(.+)/);
        if (commentMatch) {
          description = commentMatch[1].trim();
        }
      }
      
      if (routePath) {
        const endpoint = {
          method,
          path: routePath,
          file: fileName,
          description
        };
        
        fileEndpoints.push(endpoint);
        endpoints[method].push(endpoint);
        totalEndpoints++;
      }
    }
  });
  
  return fileEndpoints;
}

// Read all route files
console.log(`${colors.blue}╔════════════════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.blue}║        Medicare Plus API Endpoints Count              ║${colors.reset}`);
console.log(`${colors.blue}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);

const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.routes.js'));

const routesByFile = {};

routeFiles.forEach(file => {
  const filePath = path.join(routesDir, file);
  const fileEndpoints = extractRoutes(filePath, file);
  routesByFile[file] = fileEndpoints;
  
  console.log(`${colors.cyan}${file}${colors.reset}: ${colors.green}${fileEndpoints.length} endpoints${colors.reset}`);
});

console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
console.log(`${colors.blue}SUMMARY BY HTTP METHOD${colors.reset}`);
console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);

Object.keys(endpoints).forEach(method => {
  const count = endpoints[method].length;
  if (count > 0) {
    console.log(`${colors.yellow}${method}:${colors.reset} ${colors.green}${count} endpoints${colors.reset}`);
  }
});

console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
console.log(`${colors.magenta}TOTAL API ENDPOINTS: ${colors.green}${totalEndpoints}${colors.reset}`);
console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);

// Detailed breakdown by module
console.log(`${colors.blue}╔════════════════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.blue}║             DETAILED BREAKDOWN BY MODULE               ║${colors.reset}`);
console.log(`${colors.blue}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);

Object.entries(routesByFile).forEach(([file, fileEndpoints]) => {
  console.log(`${colors.cyan}━━━ ${file} ━━━${colors.reset}`);
  
  fileEndpoints.forEach(endpoint => {
    const methodColor = endpoint.method === 'GET' ? colors.green :
                       endpoint.method === 'POST' ? colors.yellow :
                       endpoint.method === 'PUT' ? colors.blue :
                       endpoint.method === 'PATCH' ? colors.magenta :
                       colors.red;
    
    console.log(`  ${methodColor}${endpoint.method.padEnd(7)}${colors.reset} ${endpoint.path}`);
    if (endpoint.description) {
      console.log(`           ${colors.reset}→ ${endpoint.description}${colors.reset}`);
    }
  });
  console.log('');
});

// Export summary to file
const summary = {
  totalEndpoints,
  byMethod: {
    GET: endpoints.GET.length,
    POST: endpoints.POST.length,
    PUT: endpoints.PUT.length,
    PATCH: endpoints.PATCH.length,
    DELETE: endpoints.DELETE.length
  },
  byFile: Object.fromEntries(
    Object.entries(routesByFile).map(([file, eps]) => [file, eps.length])
  ),
  allEndpoints: endpoints
};

fs.writeFileSync(
  path.join(__dirname, 'API_ENDPOINTS_COUNT.json'),
  JSON.stringify(summary, null, 2)
);

console.log(`${colors.green}✓ Detailed report saved to: API_ENDPOINTS_COUNT.json${colors.reset}\n`);
