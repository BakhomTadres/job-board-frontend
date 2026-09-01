import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SplashService } from './core/services/splash.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'CareerHub';
  showSplash = false;

  private splashSub!: Subscription;

  constructor(private splashService: SplashService) {}

  ngOnInit(): void {
    this.splashSub = this.splashService.splash$.subscribe(() => {
      this.showSplash = true;
    });
  }

  onSplashDone(): void {
    this.showSplash = false;
    this.splashService.notifySplashDone();
  }

  ngOnDestroy(): void {
    this.splashSub?.unsubscribe();
  }
}
