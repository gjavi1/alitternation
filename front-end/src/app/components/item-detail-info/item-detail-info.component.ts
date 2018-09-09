import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ItemInfoService } from '../../services/item-info.service';
import { GeoLocationService } from '../../services/geo-location.service';
import { UserService } from '../../services/user.service';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import * as $ from "jquery";

@Component({
  selector: 'app-item-detail-info',
  templateUrl: './item-detail-info.component.html',
  styleUrls: ['./item-detail-info.component.scss']
})
export class ItemDetailInfoComponent implements OnInit {
  private id: string | undefined = undefined;
  private routeSubscription: any;
  public _itemInfo: BehaviorSubject<any> = new BehaviorSubject<any>({});

  constructor(
    private readonly location: Location,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    public _itemInfoService: ItemInfoService,
    public _userService: UserService,
    public _geo: GeoLocationService
  ) { }

  get itemInfo() {
    return this._itemInfo.asObservable();
  }

  ngOnInit() {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.id = params['id'];
      this._itemInfoService.getItemById(this.id).then(_ => {
        this._itemInfo.next(_);
      });
    });
  }

  goBack() {
    this.location.back();
  }

  reportItem() {
    const itemInfo = this._itemInfo.value;
    const itemDepositable = itemInfo.information ? !!itemInfo.information.depositable : false;

    const itemId = itemInfo._id;
    let latitude = null;
    let longitude = null;
    let radius = null;

    this._geo.currentLocation()
      .then((position: Position | null) => {
        if (!position) {
          return;
        }

        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        radius = position.coords.accuracy;
      })
      .then(() => {
        $.post({
          url: "https://alitternation.com/litter/record",
          data: {
            itemId,
            latitude,
            longitude,
            radius,
            collected: true,
          },
        })
          .then(() => {
            // Only submit credit increment when item depositable
            if (!itemDepositable) {
              return;
            }

            const user = this._userService._currentUser.value;
            const googleId = user.googleId;

            return $.post({
              url: `https://alitternation.com/user/balance/${googleId}/10`,
            });
          })
          .then(() => {
            if (itemDepositable) {
              alert("Item reported and you've received 10c credit");
            } else {
              alert("Item reported, thank you");
            }

            this.router.navigate(["/"]);
          });
      });

  }
}
