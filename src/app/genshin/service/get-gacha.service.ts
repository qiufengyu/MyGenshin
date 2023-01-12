import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {OfficialGachaIndex, OfficialGachaIndexResponse, OfficialGachaPool} from "../types";
import {Observable} from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class GetGachaService {

  API_ENDPOINT = 'https://webstatic.mihoyo.com/hk4e/gacha_info/cn_gf01';
  httpHeaders: HttpHeaders;

  constructor(private http: HttpClient) {
    this.httpHeaders = new HttpHeaders();
    this.httpHeaders.set('content-type', 'application/json')
    this.httpHeaders.set('Access-Control-Allow-Origin', '*');
  }

  getGachaIndex(): Observable<OfficialGachaIndexResponse> {
    return this.http.get<OfficialGachaIndexResponse>(this.API_ENDPOINT + '/gacha/list.json',
      {headers: this.httpHeaders});
  }

  getGachaData(id: string): Observable<OfficialGachaPool> {
    return this.http.get<OfficialGachaPool>(`${this.API_ENDPOINT}/${id}/zh-cn.json`,
      {headers: this.httpHeaders});
  }

}
