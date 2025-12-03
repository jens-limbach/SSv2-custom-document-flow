# Document Flow Component

A custom Angular component that visually mimics the SAPUI5 ProcessFlow, built natively in Angular for SAP C4C document flow visualization.

> 💡 **Want to recreate this application?** Check out [My-Prompt.md](./My-Prompt.md) - a comprehensive prompt that could be used to build this entire application from scratch with AI assistance.

## 🎥 Video Demonstration

**Watch the full demo and development walkthrough:**

[![Document Flow Application Demo](https://img.shields.io/badge/▶️-Watch_Video-red?style=for-the-badge&logo=youtube)](https://sapvideo.cfapps.eu10-004.hana.ondemand.com/?entry_id=1_8qv0dybc)

In this video, I demonstrate:
- The finished application in action with real SAP C4C data
- How the document flow visualization works
- Interactive features (node expansion, quick view, navigation)
- **Most importantly**: How I used AI and simple prompts to develop this entire application from scratch

Even without deep Angular knowledge, you can build sophisticated applications like this by:
1. Starting with a clear description of what you want
2. Using AI to generate code iteratively
3. Refining through conversation

Watch the video to see the full development journey!

---

## Live Application

The application can be deployed to Cloud Foundry or any static web hosting service.

**Document Flow Route**: `/document-flow?sourceid={UUID}&sourcetype={TYPE_CODE}`

**Example URL**:
```
https://YOUR-APP-URL.com/document-flow?sourceid=58a9dd18-cf47-11f0-9209-e5c3caa18d2f&sourcetype=72
```

## Features

- **Native Angular Implementation**: Standalone component built with Angular 20/21
- **SAP Horizon Theme**: Styled to match SAP Fiori design principles with full UI5 icon support
- **Interactive Graph**: Native ngx-graph zoom and pan (dragging disabled for stability)
- **Real-time API Integration**: Fetches document flow data from SAP C4C REST API
- **Node Expansion**: Dynamically expand leaf nodes to show additional relations
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Custom Node Rendering**: Fiori-styled cards with SAP UI5 icons and status indicators
- **Enhanced Current Object Indicator**: Double-thick (12px) left border highlights the current object
- **Clickable Object IDs**: Click on object IDs to open quick view via postMessage
- **Overflow Menu**: Access list view and quick create options from each node
- **PostMessage Integration**: Navigate to quick view, list view, and quick create in parent SAP C4C window
- **Cloud Foundry Deployment**: Deployed with staticfile buildpack (64MB disk quota, 256MB memory)

## Technical Stack

- **Framework**: Angular 20/21 (Standalone Components)
- **Graph Engine**: `@swimlane/ngx-graph` v11.0.0 with dagre layout
- **UI Components**: `@fundamental-ngx/core` (Fiori-styled components)
- **Icons**: SAP UI5 Icon Fonts (CDN: https://ui5.sap.com/1.120.17/resources/sap/ui/core/themes/sap_horizon/fonts/)
- **Styling**: SAP Horizon Theme with Fundamental Styles CDN
- **Deployment**: Cloud Foundry (staticfile-buildpack)
- **Build**: Angular CLI with production optimization

## Prerequisites

Install the required dependencies:

```bash
npm install @swimlane/ngx-graph@11.0.0 @swimlane/ngx-charts d3-shape d3-selection
npm install @fundamental-ngx/core
```

**Note**: The application uses Angular 20/21. Ensure you have compatible Node.js version (18.x or higher).

## Project Structure

```
customdocflow-ui/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── document-flow/
│   │   │       ├── document-flow.component.ts
│   │   │       ├── document-flow.component.html
│   │   │       └── document-flow.component.scss
│   │   ├── services/
│   │   │   └── document-flow.service.ts
│   │   ├── models/
│   │   │   └── document-flow.model.ts
│   │   ├── app.component.ts
│   │   └── app.routes.ts
│   ├── environments/
│   │   ├── environment.example.ts (Template for configuration)
│   │   ├── environment.ts (Local dev - not in git)
│   │   └── environment.prod.ts (Production - not in git)
│   ├── main.ts
│   └── index.html
├── manifest.yml (Cloud Foundry configuration)
├── angular.json
├── package.json
├── README.md
└── DOCUMENT-FLOW-README.md (Detailed documentation)
```

## Installation & Configuration

### 1. Clone the repository

```bash
git clone <repository-url>
cd customdocflow-ui
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Copy the example environment file and configure your SAP C4C connection:

```bash
# Copy example to actual environment files
cp src/environments/environment.example.ts src/environments/environment.ts
cp src/environments/environment.example.ts src/environments/environment.prod.ts
```

Edit `src/environments/environment.ts` and `src/environments/environment.prod.ts` with your SAP C4C credentials:

```typescript
export const environment = {
  production: false, // Set to true in environment.prod.ts
  apiBaseUrl: 'https://YOUR-SAP-C4C-HOST.demo.crm.cloud.sap',
  apiPath: '/sap/c4c/api/v1/document-flow-service/relatedObjects',
  apiUsername: 'YOUR-USERNAME',
  apiPassword: 'YOUR-PASSWORD'
};
```

### 4. Add required providers in `src/main.ts`

```typescript
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(), // Required for ngx-graph animations
    provideHttpClient(),
  ]
});
```

### 5. Start development server

```bash
npm start
```

Open your browser at `http://localhost:4200/`

## Cloud Foundry Deployment

The application is configured for deployment to SAP Cloud Foundry using the staticfile buildpack.

**manifest.yml configuration:**
```yaml
applications:
  - name: customdocflow-ui
    memory: 256M
    disk_quota: 64M
    instances: 1
    buildpacks:
      - https://github.com/cloudfoundry/staticfile-buildpack.git
    path: dist/customdocflow-ui/browser
    env:
      FORCE_HTTPS: true
```

**Deployment steps:**
```bash
# Build for production
npm run build:prod

# Create Staticfile for pushstate routing
echo "pushstate: enabled" > dist/customdocflow-ui/browser/Staticfile

# Deploy to Cloud Foundry
cf push
```

## Usage

### Embedding in iFrame

The component is designed to be embedded in an SAP C4C UI and receives parameters via URL:

```html
<iframe 
  src="https://YOUR-APP-URL.com/document-flow?sourceid=58a9dd18-cf47-11f0-9209-e5c3caa18d2f&sourcetype=72"
  width="100%"
  height="600px"
  frameborder="0"
></iframe>
```

### URL Parameters

| Parameter | Description | Required | Example |
|-----------|-------------|----------|---------|
| `sourceid` | UUID of the current object | Yes | `58a9dd18-cf47-11f0-9209-e5c3caa18d2f` |
| `sourcetype` | Type code of the object | No (defaults to 72) | `72` (Opportunity) |

### Node Interactions

#### Overflow Menu
Each node has a three-dot menu in the top-right corner with options:
- **Open List View**: Opens the list view for that object type
- **+ Create**: Opens quick create for that object type

#### Clickable Object IDs
Click on object IDs to open the quick view via postMessage to the parent window.

#### Node Expansion
Leaf nodes (nodes with no outgoing connections) automatically check for additional relations. If found, an expand icon appears on the right side of the node. Click to expand and reveal more connected objects.

## API Integration

### Endpoint Configuration

Configure the API endpoint in your environment files (`src/environments/environment.ts`):

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'https://YOUR-SAP-C4C-HOST.demo.crm.cloud.sap',
  apiPath: '/sap/c4c/api/v1/document-flow-service/relatedObjects',
  apiUsername: 'YOUR-USERNAME',
  apiPassword: 'YOUR-PASSWORD'
};
```

### API Response Structure

```json
{
  "value": [
    {
      "id": "unique-id",
      "objectId": "source-uuid",
      "objectDisplayId": "527",
      "objectType": "72",
      "role": "SUCCESSOR",
      "relatedObjectType": "30",
      "relatedObjectId": "target-uuid",
      "relatedObjectDisplayId": "261",
      "adminData": {
        "createdBy": "...",
        "createdOn": "2025-12-02T06:23:18.858Z",
        "updatedBy": "...",
        "updatedOn": "2025-12-02T06:23:19.034Z"
      }
    }
  ]
}
```

## Object Type Mapping

The component supports 13 SAP C4C object types. See [DOCUMENT-FLOW-README.md](./DOCUMENT-FLOW-README.md) for the complete mapping table.

## PostMessage Integration

The application communicates with the parent SAP C4C window using postMessage for navigation:

**Quick View** (clicking object ID):
```javascript
{
  operation: 'navigation',
  params: {
    objectKey: 'uuid-of-object',
    routingKey: 'guidedselling',
    viewType: 'quickview'
  }
}
```

**List View** (from overflow menu):
```javascript
{
  operation: 'navigation',
  params: {
    routingKey: 'sales-order',
    viewType: 'list'
  }
}
```

**Quick Create** (from overflow menu):
```javascript
{
  operation: 'navigation',
  params: {
    routingKey: 'lead',
    viewType: 'quickcreate'
  }
}
```

## Customization

For detailed customization options, troubleshooting, and advanced configuration, see [DOCUMENT-FLOW-README.md](./DOCUMENT-FLOW-README.md).

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Considerations

- Optimized for graphs with up to 50 nodes
- Production build: ~720KB (~185KB gzipped)
- Cloud Foundry deployment uses minimal resources (64MB disk, 256MB memory)

## Known Limitations

- **Node Dragging**: Disabled to maintain graph stability
- **CORS**: Direct API calls require proper CORS configuration on the SAP C4C server
- **Authentication**: Currently uses Basic Auth. For production, consider OAuth 2.0 or SAP IAS integration
- **Quick Create**: May not be supported for all object types depending on SAP C4C configuration

## Security Note

⚠️ **Important**: Never commit your `environment.ts` or `environment.prod.ts` files to version control. These files contain sensitive credentials and are excluded via `.gitignore`. Use `environment.example.ts` as a template.

## License

This component is provided as-is for use within SAP C4C environments.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For detailed documentation, see [DOCUMENT-FLOW-README.md](./DOCUMENT-FLOW-README.md).

For issues or questions, please open an issue on GitHub.

## AI Development Reference

Want to build a similar application? See **[My-Prompt.md](./My-Prompt.md)** for the complete requirements prompt that could be used to recreate this application from scratch.

---

**Built with Angular 20/21 for SAP C4C Document Flow Visualization**
