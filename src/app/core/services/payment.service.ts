import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateCheckoutDto, CheckoutResponse, PaymentDetailsResponse } from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  createCheckout(data: CreateCheckoutDto): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.apiUrl}/create-checkout`, data);
  }

  getPaymentById(id: string): Observable<PaymentDetailsResponse> {
    return this.http.get<PaymentDetailsResponse>(`${this.apiUrl}/${id}`);
  }

  confirmPaymentSession(data: {
    paymentId?: string;
    reference?: string;
    transactionId?: string | number;
    orderId?: string | number;
    success?: boolean | string;
  }): Observable<{ status: string; message?: string; data: any; user?: { jobCredits?: number; subscription?: any } }> {
    return this.http.post<{ status: string; message?: string; data: any; user?: { jobCredits?: number; subscription?: any } }>(
      `${this.apiUrl}/confirm-session`,
      data
    );
  }
}
