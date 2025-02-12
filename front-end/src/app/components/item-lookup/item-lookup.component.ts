import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ImageRecognitionService } from '../../services/image-recognition.service';
import { LitterItemsService } from '../../services/litter-items.service';

@Component({
  selector: 'app-item-lookup',
  templateUrl: './item-lookup.component.html',
  styleUrls: ['./item-lookup.component.scss']
})
export class ItemLookupComponent implements OnInit {
  private items: { _id: number, description: string, tags?: string[] }[] = [];
  private searchQuery = '';

  constructor(
    private readonly location: Location,
    private readonly router: Router,
    public _itemService: LitterItemsService,
    private _vision: ImageRecognitionService
  ) {
    this._itemService.list.subscribe(data => {
      this.items = data.sort((a,b) => a.title.localeCompare(b.title));
    });
  }

  get filteredItems() {
    const str = this.searchQuery.trim().toLowerCase();

    if (str.length === 0) {
      return this.items;
    }

    return this.items.filter(item => {
      return (
        item.description.toLowerCase().indexOf(str) !== -1
        || (item.tags && item.tags.some(tag => tag.toLowerCase().indexOf(str) !== -1))
      );
    });
  }

  ngOnInit() {
    // TODO: Temporarily populating data
    this._itemService.updateItemList();

    if (this._vision.searchResults.length) {
      this.searchQuery = this._vision.searchResults[0];
      this._vision.searchResults = [];
    }
  }

  goBack() {
    this.location.back();
  }

  goToItem(itemId: number) {
    this.router.navigate(['item-detail-info', itemId]);
  }
}
