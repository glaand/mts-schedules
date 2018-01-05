import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UpcomingMetrosPage } from './upcoming-metros';

import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    UpcomingMetrosPage
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(UpcomingMetrosPage),
  ]
})
export class UpcomingMetrosPageModule {}
