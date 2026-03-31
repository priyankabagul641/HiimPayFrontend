import { Injectable } from '@angular/core';
import { environment } from '../../../environment/enviorment.prod';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  baseUrl = environment.baseUrl;
  constructor(private http:HttpClient,public router:Router) { }

  authLogin(obj:any){
    return this.http.post<any>(this.baseUrl+'users/Login/emailId/jwt',obj);
  }

  authLoginwithoutJwt(data:any):Observable<any>{
    return this.http.post<any>(this.baseUrl+`users/Login/emailId/jwt`,data);
  }

  // authLoginwithoutJwt(emailId:any,password:any){
  //   return this.http.get<any>(this.baseUrl+`users/login/${emailId}?password=${password}`)
  // }

  updateUser(userid:any,obj:any){
    return this.http.put<any>(this.baseUrl+`users/${userid}`,obj);
  }

  generateOTP(emailId:any){
    return this.http.post<any>(this.baseUrl+`users/SendOTPOnEmailId?emailId=${emailId}`,'');
//     geeting res like this 
//     {
//   "data": {
//     "otp": "123456",
//     "email": "vayu@yopmail.com"
//   },
//   "message": "OTP sent successfully",
//   "success": true
// }
  }

  // verifyOTP(emailId:any,otp:any){
  //   return this.http.post<any>(this.baseUrl+`users/VerifyOtp?emailId=${emailId}&otp=${otp}`,'')
  // }

  verifyOTP(email: string, otp: string) {
    const url = `${this.baseUrl}users/VerifyOtpJWT?emailId=${email}&otp=${otp}`;
    return this.http.post(url,'');
//     geeting res like this 
//     {
//   "data": {
//     "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjUiLCJlbWFpbCI6InZheXVAeW9wbWFpbC5jb20iLCJpYXQiOjE3NzQ5NDAwMjEsImV4cCI6MTc3NTAyNjQyMX0.KWMHQpNEdY7Tvl2hmsCYy-S0XDtXq05gD7At6cvfiDY",
//     "user": {
//       "id": 125,
//       "fullName": "vayu",
//       "email": "vayu@yopmail.com",
//       "mobile": "8773773776",
//       "userType": "ADMIN",
//       "status": "ACTIVE",
//       "companyId": null
//     }
//   },
//   "message": "OTP verified",
//   "success": true
// }
  }
  

  // resetPassword(id:any,password:any){
  //   return this.http.put<any>(this.baseUrl+`users/updatePassword?id=${id}&password=${password}`,'')
  // }

  resetPassword(password: string, token:any) {
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  const body = {
    password: password
  };

  return this.http.put<any>(
    `${this.baseUrl}users/updatePassword`,
    body,
    { headers }
  );


//   getting res like this{
//   "data": null,
//   "message": "Password updated successfully",
//   "success": true
// }
}


  getAllClient() {
    const orderBy = 'asc'; 
    const page = 0;
    const size = 10;
    const sortBy = 'id'; 

    const url =` ${this.baseUrl}clients/pagention?orderBy=${orderBy}&page=${page}&size=${size}&sortBy=${sortBy}`;
  
    return this.http.get<any>(url);
  }
  loggedIn() {
    return sessionStorage.getItem('currentLoggedInUserData')
  }
  loggeOut() {
    sessionStorage.removeItem('currentLoggedInUserData')
    this.router.navigate(['auth']);
  }

  helpAndSupport(content:any,emailID:any,subject:any):Observable<any>{
    return this.http.post<any>(this.baseUrl+`Email/sendForHelpAndSupport?content=${content}&emailId=${emailID}&subject=${subject}`,'');
  }
  
  getToken(): string | null {
    return sessionStorage.getItem('authToken'); // Or localStorage if you're using that
  }

  getLoggedInUserData() {
    const token = this.getToken();
    if (!token) return null;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const url = `${this.baseUrl}users/getCurrentLoggedInJwt`;

    return this.http.post<any>(url, { headers });
  }
}
