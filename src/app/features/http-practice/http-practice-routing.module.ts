import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BasicCrudComponent } from './components/basic-crud/basic-crud.component';
import { AdvancedFeaturesComponent } from './components/advanced-features/advanced-features.component';

const routes: Routes = [
  {
    path: 'http-practice', children: [
      { path: 'basic', component: BasicCrudComponent },
      { path: 'advanced', component: AdvancedFeaturesComponent },
      { path: '', redirectTo: 'basic', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HttpPracticeRoutingModule { }
