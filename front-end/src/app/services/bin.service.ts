import { Injectable } from '@angular/core';
import * as $ from 'jquery';

@Injectable({
  providedIn: 'root'
})
export class BinService {
  private readonly SERVER_ENDPOINT = 'https://alitternation.com/';
  constructor() { }

  getBins(): Promise<any[]> {
    return new Promise(resolve => {
      $.getJSON(this.SERVER_ENDPOINT + 'bins/all').done((binData) => {
        resolve(binData);
      });
    });
  }
}
