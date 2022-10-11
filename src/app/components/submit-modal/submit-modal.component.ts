import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-submit-modal',
  templateUrl: './submit-modal.component.html',
  styleUrls: ['./submit-modal.component.scss']
})
export class SubmitModalComponent implements OnInit {

    @Input()
    visible: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
