import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../../environment/enviorment.prod';
@Injectable({
  providedIn: 'root'
})
export class SearchService {

  baseurl = environment.baseUrl;
  searchResults = new BehaviorSubject<any[]>([]);
  searchKeyword = new BehaviorSubject<any[]>([]);

  private _refreshCompanyList = new Subject<void>();
  refreshCompanyList$ = this._refreshCompanyList.asObservable();
  triggerCompanyListRefresh(): void {
    this._refreshCompanyList.next();
  }
  getResult(value: any) {
    this.searchResults.next(value);
  }

  sendResults(): Observable<any> {
    return this.searchResults.asObservable();
  }
  setSearchKeyword(keyword: any): void {
    this.searchKeyword.next(keyword);
  }

  getSearchKeyword(): Observable<any> {
    return this.searchKeyword.asObservable();
  }


  constructor(private http: HttpClient) {}
 
  getNotifications(id:any):Observable<any>{
    return this.http.get<any>(this.baseurl+`notifications/getNotifications/ByuserId/${id}`)
  }
  readNotifications(id:any):Observable<any>{
    return this.http.put<any>(this.baseurl+`notifications/Notifications/${id}`,'')
  }
  searchclientRecent(keyword: any): Observable<any> {
    return this.http.get(this.baseurl + 'clients/search?keyword=' + keyword);
  }
  searchclientOpen(keyword: any): Observable<any> {
    return this.http.get(this.baseurl + 'clients/search?keyword=' + keyword);
  }
  searchquestion(keyword: any): Observable<any> {
    return this.http.get(this.baseurl + 'questions/Questions/search?keyword=' + keyword);
  }
  searchsurvey(keyword: any): Observable<any> {
    return this.http.get(this.baseurl + 'survey-types/Survey/search?keyword=' + keyword);
  }
  searchinterviews(keyword: any): Observable<any> {
    return this.http.get(this.baseurl + 'one-to-one-interviews/search?keyword=' + keyword);
  }
  searchQuestions(isBoolean:boolean,keyword: any,id:any): Observable<any> {
    return this.http.get(this.baseurl + `survey-types/SurveyDetailsSearch?isStatic=${isBoolean}&questionSearch=${keyword}&subPhaseId=${id}`);
  }

  searchTouchpointStages(keyword : any) : Observable<any>{
    return this.http.get(this.baseurl + `TouchPointStagesController/search?keyword=${keyword}`);
  }

  searchConsultant(keyword : any) : Observable<any>{
    return this.http.get(this.baseurl + `users/Consultant/search?keyword=${keyword}`);
  }

  // searchMeetingsForAdmin(clientId:number, curruntDate:number, keyword:any, userId:number): Observable<any>{
  //   return this.http.get<any>(this.baseurl+`consultant/upcomingEvents/pagination/search?clientId=1&currentDate1=2024-07-01%2015%3A41%3A05&keyword=m&userId=1`);
  // }
}