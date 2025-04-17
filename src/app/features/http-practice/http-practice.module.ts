import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HttpPracticeRoutingModule } from './http-practice-routing.module';
import { BasicCrudComponent } from './components/basic-crud/basic-crud.component';
import { AdvancedFeaturesComponent } from './components/advanced-features/advanced-features.component';

@NgModule({
  declarations: [
    BasicCrudComponent,
    AdvancedFeaturesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpPracticeRoutingModule
  ]
})
export class HttpPracticeModule { }
