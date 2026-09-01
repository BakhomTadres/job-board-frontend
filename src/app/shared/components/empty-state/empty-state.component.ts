import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.css']
})
export class EmptyStateComponent {
  @Input() icon = 'fa-regular fa-folder-open';
  @Input() title = 'No data found';
  @Input() message = 'We could not find any records matching your criteria.';
  @Input() actionText?: string;
  @Input() actionRoute?: string;
  @Output() actionClick = new EventEmitter<void>();

  onAction(): void {
    this.actionClick.emit();
  }
}
