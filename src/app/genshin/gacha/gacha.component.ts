import { Component, OnInit } from '@angular/core';
import { GetGachaService } from "../service/get-gacha.service";
import {
  AppGachaItem,
  AppGachaPool, AppWishResult,
  OfficialGachaIndex,
  OfficialGachaPool,
  OfficialGachaPoolItem,
  OfficialGachaType
} from "../types";
import {poolStructureConverter} from "../util";
import {GenshinGachaKit} from "../index";
import {InfiniteScrollCustomEvent} from "@ionic/angular";
// @ts-ignore
import * as _ from 'lodash';

@Component({
  selector: 'app-gacha',
  templateUrl: './gacha.component.html',
  styleUrls: ['./gacha.component.scss']
})
export class GachaComponent implements OnInit {

  officialGachaIndex: OfficialGachaIndex[] = [];
  officialPools: OfficialGachaPool[] = [];
  pool: OfficialGachaPool | undefined;
  appPool: AppGachaPool | undefined;
  kit: GenshinGachaKit | undefined;
  wish10Flag = false;
  wishResult: AppGachaItem | undefined;
  wish10Results: AppGachaItem[] = [];
  wish10String = '';
  allResults: AppWishResult = { r: [], sr: [], ssr: [] };
  r5ups: OfficialGachaPoolItem[] = [];
  r4ups: OfficialGachaPoolItem[] = [];

  constructor(private gachaService: GetGachaService) {}

  ngOnInit(): void {
    this.gachaService.getGachaIndex().subscribe(result => {
      if (result && result.retcode === 0) {
        this.officialGachaIndex = result.data?.list;
        this.initAllGacha();
      } else {
        console.log('error get official gacha index');
      }
    });
  }

  onGachaChange(e: any) {
    console.log(e);
    e.stopPropagation();
    const gachaId = e.detail.value;
    console.log(gachaId);
    console.log(this.officialPools);
    this.pool = this.officialPools.find(p => p.gacha_id === gachaId);
    this.r4ups = [];
    this.r5ups = [];
    if (this.pool) {
      this.pool.title = this.pool.title.replace(/<.*?>/g, '');
      this.appPool = poolStructureConverter(this.pool);
      this.kit = new GenshinGachaKit(this.appPool);
      if (this.pool.r5_up_items) {
        for (const r5 of this.pool.r5_up_items) {
          this.r5ups.push(r5);
        }
      }
      if (this.pool.r4_up_items) {
        for (const r4 of this.pool.r4_up_items) {
          this.r4ups.push(r4);
        }
      }
    }
  }

  private initAllGacha() {
    this.officialPools = [];
    for (const i of this.officialGachaIndex) {
      this.gachaService.getGachaData(i.gacha_id).subscribe(result => {
        const p: OfficialGachaPool = {...result};
        p.gacha_id = i.gacha_id;
        this.officialPools.push(p);
      });
    }
    this.officialPools.sort((a, b) => a.title < b.title ? -1 : 1);
  }

  wish(): AppGachaItem | undefined {
    this.wish10Flag = false;
    if (this.appPool) {
      this.wishResult = this.kit?.singleWish();
      if (this.wishResult?.rarity === 3) {
        this.allResults.r.push(this.wishResult);
      } else if (this.wishResult?.rarity === 4) {
        this.allResults.sr.push(this.wishResult);
      } else if (this.wishResult?.rarity === 5){
        this.allResults.ssr.push(this.wishResult);
      }
      return this.wishResult;
    }
    return undefined;
  }

  wish10() {
    this.wish10Results = [];
    for (let i = 0; i < 10; i += 1) {
      const wishResult = this.wish();
      if (wishResult) {
        this.wish10Results.push(wishResult);
      }
    }
    this.wish10Flag = true;
    this.wish10String = this.wish10Results.map(r => r.name).join(', ');
  }

  showWishFull() {
    return this.pool && this.r5ups.length === 1 && (this.pool.gacha_type === 301 || this.pool?.gacha_type === 400);
  }

  wishFull() {
    if (this.showWishFull()) {
      this.clearAll();
      const currentName = this.r5ups[0]?.item_name;
      while (this.countSSR(currentName) < 7) {
        this.wish();
      }
    }
  }

  getSSRCountByName(): AppGachaItem[] {
    const results: AppGachaItem[] = [];
    const ssrGroup = _.groupBy(this.allResults.ssr, (item: AppGachaItem) => item.name);
    for (const ssr in ssrGroup) {
      results.push({
        name: ssr,
        type: ssrGroup[ssr][0].type,
        rarity: 5,
        count: ssrGroup[ssr].length
      })
    }
    return results;
  }

  getSRCountByName(): AppGachaItem[] {
    const results: AppGachaItem[] = [];
    const srGroup = _.groupBy(this.allResults.sr, (item: AppGachaItem) => item.name);
    for (const sr in srGroup) {
      results.push({
        name: sr,
        type: srGroup[sr][0].type,
        rarity: 4,
        count: srGroup[sr].length
      })
    }
    return results;
  }

  onIonInfinite(ev: any) {
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  countSSR(name: string | undefined): number {
    const ssr = this.allResults.ssr.filter(item => item.name === name);
    return ssr.length;
  }

  clearAll() {
    this.kit?.clearCounter();
    this.kit?.clearResult();
    this.allResults = {r: [], sr: [], ssr: []};
  }

  getAllCount() {
    return this.allResults.ssr.length + this.allResults.sr.length + this.allResults.r.length;
  }
}
