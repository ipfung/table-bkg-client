import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../service/api.service";
import {ActivatedRoute} from "@angular/router";

@Component({
    selector: 'app-payment-fail',
    templateUrl: './payment-fail.component.html',
    styleUrls: ['./payment-fail.component.scss']
})
export class PaymentFailComponent implements OnInit {
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
