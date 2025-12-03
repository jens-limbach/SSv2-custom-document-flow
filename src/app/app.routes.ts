import { Routes } from '@angular/router';
import { DocumentFlowComponent } from './components/document-flow/document-flow.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'document-flow',
    pathMatch: 'full'
  },
  {
    path: 'document-flow',
    component: DocumentFlowComponent
  },
  {
    path: '**',
    redirectTo: 'document-flow'
  }
];
