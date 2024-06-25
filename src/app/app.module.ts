import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RoomComponent } from './component/room/room.component';
import { Room2Component } from './component/room2/room2.component';
import { Room3Component } from './component/room3/room3.component';

@NgModule({
  declarations: [
    AppComponent,
    RoomComponent,
    Room2Component,
    Room3Component
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
