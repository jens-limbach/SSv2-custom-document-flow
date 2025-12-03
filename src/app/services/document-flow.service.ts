import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  DocumentFlowApiResponse,
  DocumentFlowRelation,
  DocumentNode,
  DocumentLink,
  GraphData,
  OBJECT_TYPE_MAPPING,
  STATUS_MAPPING,
} from '../models/document-flow.model';

@Injectable({
  providedIn: 'root',
})
export class DocumentFlowService {
  private readonly API_BASE_URL = environment.apiBaseUrl;
  private readonly API_PATH = environment.apiPath;
  private readonly USERNAME = environment.apiUsername;
  private readonly PASSWORD = environment.apiPassword;

  constructor(private http: HttpClient) {}

  /**
   * Fetch related objects from SAP C4C API
   * @param sourceId - UUID of the current object
   * @param sourceType - Type code of the current object (e.g., 72 for Opportunity)
   */
  getRelatedObjects(sourceId: string, sourceType: string): Observable<DocumentFlowApiResponse> {
    const url = `${this.API_BASE_URL}${this.API_PATH}`;
    const params = {
      $sourceid: sourceId,
      $sourcetype: sourceType,
    };

    // Create Basic Authentication header
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${this.USERNAME}:${this.PASSWORD}`),
      'Content-Type': 'application/json',
    });

    return this.http
      .get<DocumentFlowApiResponse>(url, { headers, params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Transform API response into graph-ready nodes and links
   * @param apiResponse - Response from the API
   * @param currentObjectId - The ID of the current object (from URL parameters)
   */
  transformToGraphData(apiResponse: DocumentFlowApiResponse, currentObjectId: string): GraphData {
    const relations = apiResponse.value;
    const nodesMap = new Map<string, DocumentNode>();
    const links: DocumentLink[] = [];

    // Process each relation to build nodes and links
    relations.forEach((relation) => {
      // Add source node (object)
      if (!nodesMap.has(relation.objectId)) {
        const objectTypeInfo = OBJECT_TYPE_MAPPING[relation.objectType] || {
          name: `Type ${relation.objectType}`,
          icon: 'document',
        };
        nodesMap.set(relation.objectId, {
          id: relation.objectId,
          label: `${objectTypeInfo.name} ${relation.objectDisplayId}`,
          status: STATUS_MAPPING[relation.objectType] || 'neutral',
          icon: objectTypeInfo.icon,
          objectType: relation.objectType,
          objectDisplayId: relation.objectDisplayId,
          objectId: relation.objectId,
          isCurrent: relation.objectId === currentObjectId,
        });
      }

      // Add target node (related object)
      if (!nodesMap.has(relation.relatedObjectId)) {
        const relatedTypeInfo = OBJECT_TYPE_MAPPING[relation.relatedObjectType] || {
          name: `Type ${relation.relatedObjectType}`,
          icon: 'document',
        };
        nodesMap.set(relation.relatedObjectId, {
          id: relation.relatedObjectId,
          label: `${relatedTypeInfo.name} ${relation.relatedObjectDisplayId}`,
          status: STATUS_MAPPING[relation.relatedObjectType] || 'neutral',
          icon: relatedTypeInfo.icon,
          objectType: relation.relatedObjectType,
          objectDisplayId: relation.relatedObjectDisplayId,
          objectId: relation.relatedObjectId,
          isCurrent: relation.relatedObjectId === currentObjectId,
        });
      }

      // Add link based on role
      // SUCCESSOR means: object -> relatedObject (forward link)
      // PREDECESSOR means: relatedObject -> object (backward link)
      if (relation.role === 'SUCCESSOR') {
        links.push({
          source: relation.objectId,
          target: relation.relatedObjectId,
        });
      } else if (relation.role === 'PREDECESSOR') {
        links.push({
          source: relation.relatedObjectId,
          target: relation.objectId,
        });
      }
    });

    return {
      nodes: Array.from(nodesMap.values()),
      links: links,
    };
  }

  /**
   * Error handler for HTTP requests
   */
  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Failed to fetch document flow data. Please try again later.'));
  }
}
