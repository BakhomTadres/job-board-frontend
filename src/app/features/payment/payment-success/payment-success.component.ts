import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../../core/services/payment.service';
import { PaymentRecord } from '../../../core/models/payment.model';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css']
})
export class PaymentSuccessComponent implements OnInit {
  paymentId: string | null = null;
  reference: string | null = null;
  paymentDetails: PaymentRecord | null = null;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.paymentId = params['paymentId'] || params['id'] || null;
      this.reference = params['reference'] || params['merchant_order_id'] || null;

      if (this.paymentId) {
        this.fetchPaymentRecord(this.paymentId);
      }
    });
  }

  fetchPaymentRecord(id: string): void {
    this.isLoading = true;
    this.paymentService.getPaymentById(id).subscribe({
      next: (res) => {
        this.paymentDetails = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
