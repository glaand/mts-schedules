import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HomePage } from './home';
import { ComponentsModule } from '../../components/components.module'
import { UpcomingMetrosPageModule } from '../upcoming-metros/upcoming-metros.module';
// import { DirectivesModule } from '../../directives/directives.module'

@NgModule({
    declarations: [HomePage],
    imports: [
        // DirectivesModule,
        ComponentsModule,
        IonicPageModule.forChild(HomePage)
    ]
})
export class HomePageModule { }
