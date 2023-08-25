import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ApiService} from "../../service/api.service";

@Component({
  selector: 'app-payment-successful',
  templateUrl: './payment-successful.component.html',
  styleUrls: ['./payment-successful.component.scss']
})
export class PaymentSuccessfulComponent implements OnInit {
    id: any;
    gateway_msg: string;

    constructor(private route: ActivatedRoute, private api: ApiService) {
    }

    ngOnInit(): void {
        this.id = this.route.snapshot.paramMap.get('id');

        this.api.get('api/payment/' + this.id).subscribe(res => {
            if (res.success == true) {
                this.gateway_msg = res.data.gateway_msg;
            } else {
                this.gateway_msg = res.message;
            }
        });
    }

}
