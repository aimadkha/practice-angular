import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, retry, catchError, throwError, timeout } from 'rxjs';
import { Post } from '../interfaces/post.interface';

@Injectable({
  providedIn: 'root'
})
export class HttpDemoService {
  private apiUrl = 'https://jsonplaceholder.typicode.com';

  constructor(private http: HttpClient) { }

  // Basic CRUD Operations
  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/posts`);
  }

  getPost(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/posts/${id}`);
  }

  createPost(post: Post): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/posts`, post);
  }

  updatePost(post: Post): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/posts/${post.id}`, post);
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/posts/${id}`);
  }

  // Advanced Features
  getPostsWithFullResponse(): Observable<HttpResponse<Post[]>> {
    return this.http.get<Post[]>(`${this.apiUrl}/posts`, { observe: 'response' });
  }

  getPostsWithParams(userId?: number, _start?: number, _limit?: number): Observable<Post[]> {
    let params = new HttpParams();
    if (userId) params = params.append('userId', userId.toString());
    if (_start !== undefined) params = params.append('_start', _start.toString());
    if (_limit !== undefined) params = params.append('_limit', _limit.toString());

    return this.http.get<Post[]>(`${this.apiUrl}/posts`, { params });
  }

  getPostsWithHeaders(): Observable<Post[]> {
    const headers = new HttpHeaders()
      .set('Custom-Header', 'Custom Value')
      .set('Accept', 'application/json');

    return this.http.get<Post[]>(`${this.apiUrl}/posts`, { headers });
  }

  getPostsWithRetry(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/posts`).pipe(
      retry(3),
      timeout(5000),
      catchError(error => {
        console.error('Error fetching posts:', error);
        return throwError(() => new Error('Failed to fetch posts after 3 retries'));
      })
    );
  }
}
