import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Location } from '@angular/common';
import { MediaService } from '../../services/media.service';
import { ImageRecognitionService } from '../../services/image-recognition.service';
import { BarcodeService } from '../../services/barcode.service';
import { BrowserBarcodeReader } from '@zxing/library';
import { LitterItemsService } from '../../services/litter-items.service';
import { Router } from '@angular/router';

interface VisonResponse {
  responses: [
    {
      webDetection: {
        bestGuessLabels: [
          {
            label: string;
          }
        ],
        webEntities: [
          {
            entityId: string;
            score: number;
            description: string;
          }
        ]
      };
    }
  ];
}


@Component({
  selector: 'app-image-capture',
  templateUrl: './image-capture.component.html',
  styleUrls: ['./image-capture.component.scss']
})
export class ImageCaptureComponent implements OnInit, AfterViewInit {

  constructor(
    private _media: MediaService,
    private _barcode: BarcodeService,
    private _vision: ImageRecognitionService,
    private _router: Router,
    private readonly location: Location
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    const video = document.getElementById('main-video') as HTMLVideoElement;
    this._media.videoElement = video;
    video.onloadedmetadata = () => {
      this._media.setupVideoDimensions(video.videoWidth, video.videoHeight);
    };
    this._barcode.openBarcodeDialog();
  }

  goBack() {
    this.location.back();
  }

  captureImage() {
    const data = this._media.snapshot();
    this._media.pauseMedia();
    this._vision.recognise(data).then((_: VisonResponse) => {
      console.log(_);
      const result = _.responses[0];
      const matches = [];

      if (!!result && !!result.webDetection) {
        if (!!result.webDetection.bestGuessLabels) {
          result.webDetection.bestGuessLabels.map(guess => {
            matches.push(guess.label);
          });
        }

        if (!!result.webDetection.webEntities) {
          result.webDetection.webEntities.map(webEntity => {
            matches.push(webEntity.description);
          });
        }
      }
      this._media.unPauseMedia();
      console.log(matches);
      this._vision.searchResults = matches;
      this._router.navigate(['item-lookup']);
    });
  }

}
