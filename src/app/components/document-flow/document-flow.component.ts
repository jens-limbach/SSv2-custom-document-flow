import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { IconModule } from '@fundamental-ngx/core/icon';

import { DocumentFlowService } from '../../services/document-flow.service';
import { DocumentNode, DocumentLink, ROUTING_KEY_MAPPING } from '../../models/document-flow.model';

@Component({
  selector: 'app-document-flow',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    NgxGraphModule,
    IconModule,
  ],
  templateUrl: './document-flow.component.html',
  styleUrls: ['./document-flow.component.scss'],
})
export class DocumentFlowComponent implements OnInit {
  // Basic graph layout settings
  layout = 'dagre';
  layoutSettings = {
    orientation: 'LR',
  };
  
  // Node dimensions
  nodeWidth = 160;
  nodeHeight = 100;

  // Graph data
  nodes: DocumentNode[] = [];
  links: DocumentLink[] = [];

  // Loading and error states
  isLoading = true;
  errorMessage = '';

  // URL parameters
  sourceId = '';
  sourceType = '';

  // Menu state tracking
  openMenuId: string | null = null;

  // Expansion tracking
  private expandedNodesCache = new Map<string, { nodes: DocumentNode[], links: DocumentLink[] }>();
  private expandedNodeTracker = new Map<string, { addedNodeIds: Set<string>, addedLinks: DocumentLink[] }>();
  private leafNodes = new Set<string>();

  constructor(
    private route: ActivatedRoute,
    private documentFlowService: DocumentFlowService
  ) {}

  ngOnInit(): void {
    console.log('DocumentFlowComponent initialized');
    
    // Extract URL parameters
    this.route.queryParams.subscribe((params) => {
      console.log('Query params:', params);
      this.sourceId = params['sourceid'] || '';
      this.sourceType = params['sourcetype'] || '72'; // Default to Opportunity

      if (this.sourceId) {
        console.log('Loading document flow for:', this.sourceId, this.sourceType);
        this.loadDocumentFlow();
      } else {
        console.log('No sourceid provided, showing mock data');
        // Show mock data for testing
        this.loadMockData();
      }
    });
  }

  /**
   * Load mock data for testing when no sourceid is provided
   */
  private loadMockData(): void {
    console.log('Loading mock data...');
    this.nodes = [
      {
        id: '1',
        label: 'Lead 878',
        status: 'neutral',
        icon: 'leads',
        objectType: '64',
        objectDisplayId: '878',
        objectId: '00000000-0000-0000-0000-000000000001',
        dimension: {
          width: this.nodeWidth,
          height: this.nodeHeight
        }
      },
      {
        id: '2',
        label: 'Opportunity 527',
        status: 'success',
        icon: 'opportunity',
        objectType: '72',
        objectDisplayId: '527',
        objectId: '00000000-0000-0000-0000-000000000002',
        dimension: {
          width: this.nodeWidth,
          height: this.nodeHeight
        }
      },
      {
        id: '3',
        label: 'Quote 261',
        status: 'warning',
        icon: 'sales-quote',
        objectType: '30',
        objectDisplayId: '261',
        objectId: '00000000-0000-0000-0000-000000000003',
        dimension: {
          width: this.nodeWidth,
          height: this.nodeHeight
        }
      },
      {
        id: '4',
        label: 'Appointment 296',
        status: 'neutral',
        icon: 'appointment',
        objectType: '12',
        objectDisplayId: '296',
        objectId: '00000000-0000-0000-0000-000000000004',
        dimension: {
          width: this.nodeWidth,
          height: this.nodeHeight
        }
      }
    ];
    this.links = [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
      { source: '2', target: '4' }
    ];
    this.isLoading = false;
    console.log('Mock data loaded:', this.nodes.length, 'nodes', this.links.length, 'links');
  }

  /**
   * Load document flow data from API
   */
  private loadDocumentFlow(): void {
    console.log('loadDocumentFlow called');
    this.isLoading = true;
    this.errorMessage = '';

    this.documentFlowService
      .getRelatedObjects(this.sourceId, this.sourceType)
      .subscribe({
        next: (response) => {
          console.log('API response received:', response);
          const graphData = this.documentFlowService.transformToGraphData(
            response,
            this.sourceId
          );
          console.log('Graph data transformed:', graphData);
          this.nodes = graphData.nodes;
          this.links = graphData.links;
          this.isLoading = false;
          console.log('Data loaded successfully');
          
          // Check leaf nodes for expandability
          this.checkLeafNodesForExpansion();
        },
        error: (error) => {
          console.error('Error loading document flow:', error);
          this.errorMessage = error.message || 'Failed to load document flow';
          this.isLoading = false;
          
          // Load mock data as fallback
          console.log('Loading mock data as fallback due to error');
          this.loadMockData();
        },
      });
  }

  /**
   * Get status color based on SAP Horizon theme
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'success':
        return 'var(--sapPositiveColor, #107e3e)';
      case 'warning':
        return 'var(--sapCriticalColor, #e9730c)';
      case 'error':
        return 'var(--sapNegativeColor, #bb0000)';
      case 'neutral':
      default:
        return 'var(--sapNeutralColor, #6a6d70)';
    }
  }

  /**
   * Get status background color for hover effect
   */
  getStatusBackgroundColor(status: string): string {
    switch (status) {
      case 'success':
        return 'var(--sapSuccessBackground, #f1fdf6)';
      case 'warning':
        return 'var(--sapWarningBackground, #fef7f1)';
      case 'error':
        return 'var(--sapErrorBackground, #ffebeb)';
      case 'neutral':
      default:
        return 'var(--sapNeutralBackground, #f5f6f7)';
    }
  }

  /**
   * Handle node click event
   */
  onNodeClick(node: DocumentNode): void {
    console.log('Node clicked:', node);
    // Implement navigation or detail view logic here
    // For example: navigate to detail page or open a popover
  }

  /**
   * Handle ID click to open quickview
   */
  onIdClick(event: Event, node: DocumentNode): void {
    event.stopPropagation(); // Prevent node click event
    this.openQuickView(node.objectId, node.objectType);
  }

  /**
   * Open quickview for a specific object
   */
  private openQuickView(objectId: string, objectType: string): void {
    const routingKey = ROUTING_KEY_MAPPING[objectType];
    
    if (!routingKey) {
      console.error('No routing key found for object type:', objectType);
      return;
    }

    console.log('Opening quickview:', { objectId, routingKey });
    
    const message = {
      operation: 'navigation',
      params: {
        objectKey: objectId,
        routingKey: routingKey,
        viewType: 'quickview'
      }
    };
    
    window.parent.postMessage(message, '*');
  }

  /**
   * Toggle burger menu for a node
   */
  toggleMenu(event: Event, nodeId: string): void {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === nodeId ? null : nodeId;
  }

  /**
   * Check if menu is open for a node
   */
  isMenuOpen(nodeId: string): boolean {
    return this.openMenuId === nodeId;
  }

  /**
   * Open list view for object type
   */
  openListView(event: Event, node: DocumentNode): void {
    event.stopPropagation();
    this.openMenuId = null;
    
    const routingKey = ROUTING_KEY_MAPPING[node.objectType];
    
    if (!routingKey) {
      console.error('No routing key found for object type:', node.objectType);
      return;
    }

    console.log('Opening list view:', { routingKey });
    
    const message = {
      operation: 'navigation',
      params: {
        routingKey: routingKey,
        viewType: 'list'
      }
    };
    
    window.parent.postMessage(message, '*');
  }

  /**
   * Check leaf nodes for additional relations
   */
  private checkLeafNodesForExpansion(): void {
    // Find leaf nodes (nodes with no outgoing edges)
    const nodesWithOutgoing = new Set(this.links.map(link => link.source));
    const previousLeafNodes = new Set(this.leafNodes);
    this.leafNodes.clear();
    
    this.nodes.forEach(node => {
      if (!nodesWithOutgoing.has(node.id)) {
        this.leafNodes.add(node.id);
        // Only check if this is a newly discovered leaf node
        if (!previousLeafNodes.has(node.id)) {
          this.checkNodeForMoreRelations(node);
        }
      }
    });
  }

  /**
   * Check if a specific node has more relations
   */
  private checkNodeForMoreRelations(node: DocumentNode): void {
    if (node.isCheckingRelations || node.hasMoreRelations !== undefined) {
      return;
    }

    node.isCheckingRelations = true;
    
    this.documentFlowService
      .getRelatedObjects(node.objectId, node.objectType)
      .subscribe({
        next: (response) => {
          node.isCheckingRelations = false;
          
          if (response.value && response.value.length > 0) {
            // Get current node IDs in the graph
            const currentNodeIds = new Set(this.nodes.map(n => n.objectId));
            
            // Check if there are successor relations that aren't already in the graph
            const newSuccessors = response.value.filter(rel => 
              rel.role === 'SUCCESSOR' && !currentNodeIds.has(rel.relatedObjectId)
            );
            
            node.hasMoreRelations = newSuccessors.length > 0;
            
            if (newSuccessors.length > 0) {
              // Cache the data for later expansion
              const graphData = this.documentFlowService.transformToGraphData(
                response,
                node.objectId
              );
              this.expandedNodesCache.set(node.id, graphData);
              console.log(`Node ${node.label} has ${newSuccessors.length} new successor relations`);
            } else {
              console.log(`Node ${node.label} has no new successor relations`);
            }
          } else {
            node.hasMoreRelations = false;
          }
        },
        error: (error) => {
          console.error(`Error checking relations for node ${node.label}:`, error);
          node.isCheckingRelations = false;
          node.hasMoreRelations = false;
        }
      });
  }

  /**
   * Toggle expansion of a node
   */
  toggleNodeExpansion(event: Event, node: DocumentNode): void {
    event.stopPropagation();
    
    if (!node.hasMoreRelations) {
      return;
    }

    if (node.isExpanded) {
      this.collapseNode(node);
    } else {
      this.expandNode(node);
    }
  }

  /**
   * Expand a node to show its relations
   */
  private expandNode(node: DocumentNode): void {
    const cachedData = this.expandedNodesCache.get(node.id);
    if (!cachedData) {
      console.error('No cached data for node:', node.id);
      return;
    }

    // Add new nodes (excluding the source node itself and nodes already in graph)
    const newNodes = cachedData.nodes.filter(n => 
      n.id !== node.id && !this.nodes.find(existing => existing.id === n.id)
    );
    
    // Add new links (only those not already in graph)
    const newLinks = cachedData.links.filter(l => 
      !this.links.find(existing => 
        existing.source === l.source && existing.target === l.target
      )
    );

    // Track what we're adding for this specific expansion
    const addedNodeIds = new Set(newNodes.map(n => n.id));
    this.expandedNodeTracker.set(node.id, {
      addedNodeIds: addedNodeIds,
      addedLinks: [...newLinks]
    });

    // Update graph
    this.nodes = [...this.nodes, ...newNodes];
    this.links = [...this.links, ...newLinks];

    node.isExpanded = true;
    
    console.log(`Expanded node ${node.label}, added ${newNodes.length} nodes and ${newLinks.length} links`);
    
    // Check newly added leaf nodes for expansion
    setTimeout(() => this.checkLeafNodesForExpansion(), 100);
  }

  /**
   * Collapse a node to hide its expanded relations
   */
  private collapseNode(node: DocumentNode): void {
    const trackedData = this.expandedNodeTracker.get(node.id);
    if (!trackedData) {
      console.log(`No tracked expansion data for node ${node.label}, setting isExpanded to false`);
      node.isExpanded = false;
      return;
    }

    const { addedNodeIds, addedLinks } = trackedData;
    
    console.log(`Collapsing node ${node.label}, removing ${addedNodeIds.size} nodes and ${addedLinks.length} links`);
    
    // Remove the nodes that were added
    this.nodes = this.nodes.filter(n => !addedNodeIds.has(n.id));
    
    // Remove the links that were added
    this.links = this.links.filter(existingLink => 
      !addedLinks.some(addedLink => 
        addedLink.source === existingLink.source && 
        addedLink.target === existingLink.target
      )
    );

    // Clean up tracking data
    this.expandedNodeTracker.delete(node.id);
    
    node.isExpanded = false;
    
    console.log(`Collapsed node ${node.label} successfully`);
  }

  /**
   * Open quick create for object type
   */
  openQuickCreate(event: Event, node: DocumentNode): void {
    event.stopPropagation();
    this.openMenuId = null;
    
    const routingKey = ROUTING_KEY_MAPPING[node.objectType];
    
    if (!routingKey) {
      console.error('No routing key found for object type:', node.objectType);
      return;
    }

    console.log('Opening quick create:', { routingKey });
    
    const message = {
      operation: 'navigation',
      params: {
        routingKey: routingKey,
        viewType: 'quickcreate'
      }
    };
    
    window.parent.postMessage(message, '*');
  }
}
