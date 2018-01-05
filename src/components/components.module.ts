import { NgModule } from '@angular/core';
import { StationSelectorComponent } from './station-selector/station-selector';
import { IonicModule } from 'ionic-angular/module';
import { DirectionSchedulesComponent } from './direction-schedules/direction-schedules';
@NgModule({
    declarations: [StationSelectorComponent,
        DirectionSchedulesComponent],
    imports: [IonicModule],
    exports: [StationSelectorComponent,
        DirectionSchedulesComponent]
})
export class ComponentsModule { }
