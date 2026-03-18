
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/enviorment.prod';



@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  baseUrl = environment.baseUrl;
  // baseUrl2 = environment.baseUrl2;
  constructor(private http: HttpClient) {}

  getCountByClientEmpId(id: any): Observable<any> {
    return this.http.get<any>(this.baseUrl+`employee-responses/count?clientEmpId=${id}`);
  }

  getNotifications(id:any):Observable<any>{
    return this.http.get<any>(this.baseUrl+`notifications?userId=${id}`)
  }

  getAllAssignedSurveyByClientEmpId(
    id: any,
    page: number,
    size: number,
    sortBy: string,
    orderBy: string
  ): Observable<any> {
    const url = `${this.baseUrl}employee-responses/getAllsurveyForEmp?clientEmpId=${id}&orderBy=${orderBy}&page=${page}&size=${size}&sortBy=${sortBy}`;
    return this.http.get<any>(url);
  }

  getAssignedSurveyByStatus( id: any,
    page: number,
    size: number,
    sortBy: string,
    orderBy: string,status:any):Observable<any>{
    const url = `${this.baseUrl}employee-responses/getAllsurveyForEmp?clientEmpId=${id}&orderBy=${orderBy}&page=${page}&size=${size}&sortBy=${sortBy}&status=${status}`;
    return this.http.get<any>(url);
  }

  getSurveyBysurveyAssignmentId (id:any):Observable<any>{
    return this.http.get<any>(this.baseUrl+`employee-responses/SurveyDetails/${id}`);
  }

  getUpcomingEventsById (formattedDate:string,id: any, page: number,size: number):Observable<any>{
    return this.http.post<any>(this.baseUrl+`focus-group-meetings/upcomingEvents/pagination/count?currentDate1=${formattedDate}&userId=${id}`,'');
  }
  
  submitEmployeeResponse (data:any):Observable<any>{
    return this.http.post<any>(this.baseUrl+`employee-responses`, data);
  }

  getMeetingsDateByMonth(month: number, year: number, userId: number): Observable<any> {
    return this.http.post<any>(this.baseUrl+`focus-group-meetings/dateByMonthNew?month=${month}&userId=${userId}&year=${year}`,'')
  }

  getEventOnDateByUserID(date:any,userId:any):Observable<any>{
    return this.http.post<any>(this.baseUrl+`focus-group-meetings/eventsOnDate?date=${date}&userId=${userId}`,'');
  }

  updateUser (id:any, data:any):Observable<any>{
    return this.http.put<any>(this.baseUrl+`users/admin`, data);
  }
  
  getUserById (id:any):Observable<any>{
    return this.http.get<any>(this.baseUrl+`users/${id}`);
  }

  searchreminder(keyword:any,userid:any):Observable<any>{
    return this.http.get<any>(this.baseUrl+`focus-group-meetings/upcomingEvents/pagination/search?keyword=${keyword}&userId=${userid}`);
  }

  deleteUserProfile(id:number):Observable<any>{
    return this.http.put<any>(this.baseUrl+`users/${id}/soft-delete`,'');
  }
}
