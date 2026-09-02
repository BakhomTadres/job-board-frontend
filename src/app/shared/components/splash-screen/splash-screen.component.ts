import { Component, OnInit, OnDestroy, Output, EventEmitter, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.css']
})
export class SplashScreenComponent implements OnInit, OnDestroy {
  @Output() splashDone = new EventEmitter<void>();

  isExiting = false;
  isHidden = false;
  particles: { left: string; duration: string; delay: string; size: string }[] = [];

  private splashTimeout: any;
  private hideTimeout: any;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    // Generate particles data with negative delays so they are already in motion across the screen
    for (let i = 0; i < 35; i++) {
      this.particles.push({
        left: (Math.random() * 96 + 2).toFixed(1) + '%',
        duration: (5 + Math.random() * 5).toFixed(1) + 's',
        delay: (-Math.random() * 10).toFixed(1) + 's',
        size: (5 + Math.random() * 10).toFixed(1) + 'px'
      });
    }

    // Prevent body scroll while splash is visible
    this.renderer.setStyle(document.body, 'overflow', 'hidden');

    // Start exit after splash duration (total ~3.0s: 2500ms active + 500ms fade exit)
    this.splashTimeout = setTimeout(() => {
      this.isExiting = true;

      // After exit animation completes, hide and notify parent
      this.hideTimeout = setTimeout(() => {
        this.isHidden = true;
        this.renderer.removeStyle(document.body, 'overflow');
        this.splashDone.emit();
      }, 500);
    }, 2500);
  }

  ngOnDestroy(): void {
    clearTimeout(this.splashTimeout);
    clearTimeout(this.hideTimeout);
    this.renderer.removeStyle(document.body, 'overflow');
  }
}
