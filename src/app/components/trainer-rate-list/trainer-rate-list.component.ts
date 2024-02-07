import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-trainer-rate-list',
  templateUrl: './trainer-rate-list.component.html',
  styleUrls: ['./trainer-rate-list.component.scss']
})
export class TrainerRateListComponent implements OnInit {
    trainerRates = [];

    constructor(public ref: DynamicDialogRef, public config: DynamicDialogConfig) { }

    ngOnInit(): void {
        console.log("this.config.data=", this.config.data);
        this.trainerRates = this.config.data.list;
        console.log("this.trainerRates=", this.trainerRates);
    }

    selectTrainer(trainer) {
        this.ref.close(trainer);
    }
}
