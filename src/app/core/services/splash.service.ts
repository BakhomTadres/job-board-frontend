import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SplashService {
  private splashSubject = new Subject<void>();
  public splash$ = this.splashSubject.asObservable();

  private splashDoneSubject = new Subject<void>();
  public splashDone$ = this.splashDoneSubject.asObservable();

  triggerSplash(): void {
    this.splashSubject.next();
  }

  notifySplashDone(): void {
    this.splashDoneSubject.next();
  }
}
